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
    GetCommand: class { constructor(public input: unknown) { } },
    UpdateCommand: class { constructor(public input: unknown) { } },
    DeleteCommand: class { constructor(public input: unknown) { } },
}));

import { GET, PATCH, DELETE } from '../../items/[itemId]/route';

const makeParams = (itemId: string) => Promise.resolve({ itemId });

describe('GET /api/items/[itemId]', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 400 if userId is missing', async () => {
        const request = new Request('http://localhost/api/items/item1');
        const response = await GET(request, { params: makeParams('item1') });
        expect(response.status).toBe(400);
    });

    it('returns 404 if item not found', async () => {
        mockSend.mockResolvedValueOnce({ Item: undefined });

        const request = new Request('http://localhost/api/items/item1?userId=user1');
        const response = await GET(request, { params: makeParams('item1') });
        expect(response.status).toBe(404);

        const body = await response.json();
        expect(body.error).toBe('Item not found');
    });

    it('returns item when found', async () => {
        const item = { userId: 'user1', itemId: 'item1', title: 'Found' };
        mockSend.mockResolvedValueOnce({ Item: item });

        const request = new Request('http://localhost/api/items/item1?userId=user1');
        const response = await GET(request, { params: makeParams('item1') });
        expect(response.status).toBe(200);

        const body = await response.json();
        expect(body.data).toEqual(item);
    });

    it('returns 500 on DynamoDB error', async () => {
        mockSend.mockRejectedValueOnce(new Error('DynamoDB unavailable'));

        const request = new Request('http://localhost/api/items/item1?userId=user1');
        const response = await GET(request, { params: makeParams('item1') });
        expect(response.status).toBe(500);
    });
});

describe('PATCH /api/items/[itemId]', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('updates an item with valid data', async () => {
        const updated = { userId: 'user1', itemId: 'item1', title: 'Updated' };
        mockSend.mockResolvedValueOnce({ Attributes: updated });

        const request = new Request('http://localhost/api/items/item1', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'user1', title: 'Updated' }),
        });

        const response = await PATCH(request, { params: makeParams('item1') });
        expect(response.status).toBe(200);

        const body = await response.json();
        expect(body.data).toEqual(updated);
    });

    it('returns 400 for invalid data (missing userId)', async () => {
        const request = new Request('http://localhost/api/items/item1', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Updated' }),
        });

        const response = await PATCH(request, { params: makeParams('item1') });
        expect(response.status).toBe(400);
    });

    it('returns 404 when item does not exist (ConditionalCheckFailed)', async () => {
        const error = new Error('Conditional check failed');
        error.name = 'ConditionalCheckFailedException';
        mockSend.mockRejectedValueOnce(error);

        const request = new Request('http://localhost/api/items/item1', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'user1', title: 'Updated' }),
        });

        const response = await PATCH(request, { params: makeParams('item1') });
        expect(response.status).toBe(404);

        const body = await response.json();
        expect(body.error).toBe('Item not found');
    });

    it('returns 500 on generic DynamoDB error', async () => {
        mockSend.mockRejectedValueOnce(new Error('Service unavailable'));

        const request = new Request('http://localhost/api/items/item1', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'user1', title: 'Updated' }),
        });

        const response = await PATCH(request, { params: makeParams('item1') });
        expect(response.status).toBe(500);
    });
});

describe('DELETE /api/items/[itemId]', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 400 if userId is missing', async () => {
        const request = new Request('http://localhost/api/items/item1', {
            method: 'DELETE',
        });
        const response = await DELETE(request, { params: makeParams('item1') });
        expect(response.status).toBe(400);
    });

    it('deletes an item successfully', async () => {
        mockSend.mockResolvedValueOnce({});

        const request = new Request('http://localhost/api/items/item1?userId=user1', {
            method: 'DELETE',
        });
        const response = await DELETE(request, { params: makeParams('item1') });
        expect(response.status).toBe(200);

        const body = await response.json();
        expect(body.data.deleted).toBe(true);
    });

    it('returns 500 on DynamoDB error', async () => {
        mockSend.mockRejectedValueOnce(new Error('DynamoDB unavailable'));

        const request = new Request('http://localhost/api/items/item1?userId=user1', {
            method: 'DELETE',
        });
        const response = await DELETE(request, { params: makeParams('item1') });
        expect(response.status).toBe(500);
    });
});
