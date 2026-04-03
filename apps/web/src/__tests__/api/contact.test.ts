import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the SES client module
vi.mock('@/lib/ses-client', () => ({
    sendContactEmail: vi.fn(),
}));

describe('Contact API Route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetModules();
    });

    describe('POST /api/contact', () => {
        it('should return 400 for missing required fields', async () => {
            const { POST } = await import('@/app/api/contact/route');

            const request = new NextRequest('http://localhost:3000/api/contact', {
                method: 'POST',
                body: JSON.stringify({}),
                headers: { 'Content-Type': 'application/json' },
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Validation failed');
        });

        it('should return 400 for invalid email', async () => {
            const { POST } = await import('@/app/api/contact/route');

            const request = new NextRequest('http://localhost:3000/api/contact', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'Test User',
                    email: 'invalid-email',
                    message: 'Test message',
                }),
                headers: { 'Content-Type': 'application/json' },
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });

        it('should return 400 for empty name', async () => {
            const { POST } = await import('@/app/api/contact/route');

            const request = new NextRequest('http://localhost:3000/api/contact', {
                method: 'POST',
                body: JSON.stringify({
                    name: '',
                    email: 'test@example.com',
                    message: 'Test message',
                }),
                headers: { 'Content-Type': 'application/json' },
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });

        it('should return 400 for empty message', async () => {
            const { POST } = await import('@/app/api/contact/route');

            const request = new NextRequest('http://localhost:3000/api/contact', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'Test User',
                    email: 'test@example.com',
                    message: '',
                }),
                headers: { 'Content-Type': 'application/json' },
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });

        it('should return 200 for valid request', async () => {
            const { sendContactEmail } = await import('@/lib/ses-client');
            vi.mocked(sendContactEmail).mockResolvedValue({
                success: true,
                messageId: 'test-message-id',
            });

            const { POST } = await import('@/app/api/contact/route');

            const request = new NextRequest('http://localhost:3000/api/contact', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'Test User',
                    email: 'test@example.com',
                    message: 'This is a test message',
                }),
                headers: { 'Content-Type': 'application/json' },
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.messageId).toBe('test-message-id');
        });

        it('should return 200 for valid request with subject', async () => {
            const { sendContactEmail } = await import('@/lib/ses-client');
            vi.mocked(sendContactEmail).mockResolvedValue({
                success: true,
                messageId: 'test-message-id-2',
            });

            const { POST } = await import('@/app/api/contact/route');

            const request = new NextRequest('http://localhost:3000/api/contact', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'Test User',
                    email: 'test@example.com',
                    subject: 'Test Subject',
                    message: 'This is a test message with subject',
                }),
                headers: { 'Content-Type': 'application/json' },
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });

        it('should return 500 when email sending fails', async () => {
            const { sendContactEmail } = await import('@/lib/ses-client');
            vi.mocked(sendContactEmail).mockResolvedValue({
                success: false,
                error: 'SES Error',
            });

            const { POST } = await import('@/app/api/contact/route');

            const request = new NextRequest('http://localhost:3000/api/contact', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'Test User',
                    email: 'test@example.com',
                    message: 'This is a test message',
                }),
                headers: { 'Content-Type': 'application/json' },
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBe('SES Error');
        });

        it('should return 400 for name exceeding max length', async () => {
            const { POST } = await import('@/app/api/contact/route');

            const longName = 'a'.repeat(101);
            const request = new NextRequest('http://localhost:3000/api/contact', {
                method: 'POST',
                body: JSON.stringify({
                    name: longName,
                    email: 'test@example.com',
                    message: 'Test message',
                }),
                headers: { 'Content-Type': 'application/json' },
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });
    });

    describe('OPTIONS /api/contact', () => {
        it('should return 200 with CORS headers', async () => {
            const { OPTIONS } = await import('@/app/api/contact/route');

            const response = await OPTIONS();

            expect(response.status).toBe(204);
            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
            expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
        });
    });
});
