import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockSend } = vi.hoisted(() => ({
    mockSend: vi.fn(),
}));

vi.mock('@aws-sdk/client-dynamodb', () => ({
    DynamoDBClient: class { },
}));
vi.mock('@aws-sdk/lib-dynamodb', () => ({
    DynamoDBDocumentClient: {
        from: () => ({ send: mockSend }),
    },
    PutCommand: class { constructor(public input: unknown) { } },
    QueryCommand: class { constructor(public input: unknown) { } },
}));

import { GET, POST } from '../route';

describe('GET /api/items', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 400 if userId is missing', async () => {
        const request = new Request('http://localhost/api/items');
        const response = await GET(request);
        expect(response.status).toBe(400);

        const body = await response.json();
        expect(body.error).toBe('userId is required');
    });

    it('returns items for a valid userId', async () => {
        const items = [
            { userId: 'user1', itemId: 'item1', title: 'Test' },
        ];
        mockSend.mockResolvedValueOnce({ Items: items });

        const request = new Request('http://localhost/api/items?userId=user1');
        const response = await GET(request);
        expect(response.status).toBe(200);

        const body = await response.json();
        expect(body.data).toEqual(items);
    });

    it('returns empty array when no items exist', async () => {
        mockSend.mockResolvedValueOnce({ Items: undefined });

        const request = new Request('http://localhost/api/items?userId=user1');
        const response = await GET(request);
        expect(response.status).toBe(200);

        const body = await response.json();
        expect(body.data).toEqual([]);
    });

    it('returns 500 on DynamoDB error', async () => {
        mockSend.mockRejectedValueOnce(new Error('DynamoDB unavailable'));

        const request = new Request('http://localhost/api/items?userId=user1');
        const response = await GET(request);
        expect(response.status).toBe(500);

        const body = await response.json();
        expect(body.error).toBe('Failed to fetch items');
    });
});

describe('POST /api/items', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('creates an item with valid data', async () => {
        mockSend.mockResolvedValueOnce({});

        const request = new Request('http://localhost/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 'user1',
                title: 'Test Item',
                content: 'Some content',
            }),
        });

        const response = await POST(request);
        expect(response.status).toBe(201);

        const body = await response.json();
        expect(body.data.userId).toBe('user1');
        expect(body.data.title).toBe('Test Item');
        expect(body.data.content).toBe('Some content');
        expect(body.data.itemId).toBeDefined();
        expect(body.data.createdAt).toBeDefined();
    });

    it('returns 400 for invalid data (missing title)', async () => {
        const request = new Request('http://localhost/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'user1' }),
        });

        const response = await POST(request);
        expect(response.status).toBe(400);
    });

    it('returns 400 for invalid JSON', async () => {
        const request = new Request('http://localhost/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: 'not-json',
        });

        const response = await POST(request);
        expect(response.status).toBe(400);

        const body = await response.json();
        expect(body.error).toBe('Invalid JSON in request body');
    });

    it('returns 500 on DynamoDB error', async () => {
        mockSend.mockRejectedValueOnce(new Error('DynamoDB unavailable'));

        const request = new Request('http://localhost/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 'user1',
                title: 'Test Item',
            }),
        });

        const response = await POST(request);
        expect(response.status).toBe(500);

        const body = await response.json();
        expect(body.error).toBe('Failed to create item');
    });

    it('defaults content to empty string when not provided', async () => {
        mockSend.mockResolvedValueOnce({});

        const request = new Request('http://localhost/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 'user1',
                title: 'No content',
            }),
        });

        const response = await POST(request);
        expect(response.status).toBe(201);

        const body = await response.json();
        expect(body.data.content).toBe('');
    });
});
