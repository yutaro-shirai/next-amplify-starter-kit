import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendContactEmail } from '@/lib/ses-client';

/**
 * Contact form request schema
 */
const ContactRequestSchema = z.object({
    /** Sender's name */
    name: z
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name must be 100 characters or less'),
    /** Sender's email address */
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email address'),
    /** Email subject (optional) */
    subject: z
        .string()
        .max(200, 'Subject must be 200 characters or less')
        .optional(),
    /** Message body */
    message: z
        .string()
        .min(1, 'Message is required')
        .max(5000, 'Message must be 5000 characters or less'),
    /** Additional recipient(s) (optional) */
    to: z
        .union([z.string().email(), z.array(z.string().email())])
        .optional(),
});


/**
 * API Response types
 */
interface SuccessResponse {
    success: true;
    messageId: string;
}

interface ErrorResponse {
    success: false;
    error: string;
    details?: z.ZodIssue[];
}

type ContactResponse = SuccessResponse | ErrorResponse;

/**
 * POST /api/contact
 * 
 * Handles contact form submissions and sends emails via AWS SES.
 * 
 * Request body:
 * - name: string (required) - Sender's name
 * - email: string (required) - Sender's email address
 * - subject: string (optional) - Email subject
 * - message: string (required) - Message body
 * - to: string | string[] (optional) - Additional recipient(s)
 * 
 * Response:
 * - 200: { success: true, messageId: string }
 * - 400: { success: false, error: string, details?: ZodIssue[] }
 * - 500: { success: false, error: string }
 */
export async function POST(
    request: NextRequest
): Promise<NextResponse<ContactResponse>> {
    try {
        // Parse request body
        const body = await request.json();

        // Validate request
        const validationResult = ContactRequestSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation failed',
                    details: validationResult.error.issues,
                },
                { status: 400 }
            );
        }

        const { name, email, subject, message, to } = validationResult.data;

        // Send email
        const result = await sendContactEmail({
            name,
            email,
            subject,
            message,
            to,
        });

        if (!result.success) {
            console.error('Failed to send contact email:', result.error);
            return NextResponse.json(
                {
                    success: false,
                    error: result.error || 'Failed to send email',
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            messageId: result.messageId!,
        });
    } catch (error) {
        console.error('Contact API error:', error);

        // Handle JSON parse errors
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid JSON in request body',
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: 'An unexpected error occurred',
            },
            { status: 500 }
        );
    }
}

/**
 * OPTIONS /api/contact
 * 
 * Handle CORS preflight requests
 */
export async function OPTIONS(): Promise<NextResponse> {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
