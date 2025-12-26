import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

/**
 * SES Client singleton instance
 * Uses environment variables for configuration
 */
const sesClient = new SESClient({
    region: process.env.SES_REGION || process.env.AWS_REGION || 'ap-northeast-1',
});

/**
 * Email sending options
 */
export interface SendEmailOptions {
    /** Recipient email address(es) */
    to: string | string[];
    /** Email subject */
    subject: string;
    /** Email body (plain text) */
    body: string;
    /** HTML body (optional) */
    htmlBody?: string;
    /** Reply-to email address (optional) */
    replyTo?: string;
    /** CC recipients (optional) */
    cc?: string | string[];
    /** BCC recipients (optional) */
    bcc?: string | string[];
}

/**
 * Email sending result
 */
export interface SendEmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

/**
 * Get the sender email address from environment variables
 * @throws Error if SES_FROM_EMAIL is not set
 */
function getFromEmail(): string {
    const fromEmail = process.env.SES_FROM_EMAIL;
    if (!fromEmail) {
        throw new Error(
            'SES_FROM_EMAIL environment variable is required. ' +
            'Please set it in your .env.local file.'
        );
    }
    return fromEmail;
}

/**
 * Get the default recipient email address from environment variables
 */
export function getDefaultToEmail(): string | undefined {
    return process.env.SES_TO_EMAIL;
}

/**
 * Normalize email addresses to an array
 */
function normalizeEmails(emails: string | string[] | undefined): string[] {
    if (!emails) return [];
    return Array.isArray(emails) ? emails : [emails];
}

/**
 * Send an email using AWS SES
 * 
 * @param options - Email sending options
 * @returns Promise with the result of the email sending operation
 * 
 * @example
 * ```typescript
 * const result = await sendEmail({
 *   to: 'recipient@example.com',
 *   subject: 'Hello',
 *   body: 'This is a test email',
 * });
 * 
 * if (result.success) {
 *   console.log('Email sent:', result.messageId);
 * } else {
 *   console.error('Failed to send email:', result.error);
 * }
 * ```
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    const { to, subject, body, htmlBody, replyTo, cc, bcc } = options;

    try {
        const fromEmail = getFromEmail();
        const toAddresses = normalizeEmails(to);
        const ccAddresses = normalizeEmails(cc);
        const bccAddresses = normalizeEmails(bcc);

        if (toAddresses.length === 0) {
            return {
                success: false,
                error: 'At least one recipient email address is required',
            };
        }

        const command = new SendEmailCommand({
            Source: fromEmail,
            Destination: {
                ToAddresses: toAddresses,
                CcAddresses: ccAddresses.length > 0 ? ccAddresses : undefined,
                BccAddresses: bccAddresses.length > 0 ? bccAddresses : undefined,
            },
            Message: {
                Subject: {
                    Data: subject,
                    Charset: 'UTF-8',
                },
                Body: {
                    Text: {
                        Data: body,
                        Charset: 'UTF-8',
                    },
                    Html: htmlBody
                        ? {
                              Data: htmlBody,
                              Charset: 'UTF-8',
                          }
                        : undefined,
                },
            },
            ReplyToAddresses: replyTo ? [replyTo] : undefined,
        });

        const response = await sesClient.send(command);

        return {
            success: true,
            messageId: response.MessageId,
        };
    } catch (error) {
        console.error('SES send email error:', error);

        // Handle specific SES errors
        if (error instanceof Error) {
            // Check for common SES error types
            if (error.name === 'MessageRejected') {
                return {
                    success: false,
                    error: 'Email was rejected. Please check if the sender email is verified in SES.',
                };
            }
            if (error.name === 'MailFromDomainNotVerifiedException') {
                return {
                    success: false,
                    error: 'The sender domain is not verified in SES.',
                };
            }
            if (error.name === 'ConfigurationSetDoesNotExistException') {
                return {
                    success: false,
                    error: 'SES configuration set does not exist.',
                };
            }

            return {
                success: false,
                error: error.message,
            };
        }

        return {
            success: false,
            error: 'An unexpected error occurred while sending the email',
        };
    }
}

/**
 * Send a contact form email
 * 
 * This is a convenience function that formats a contact form submission
 * and sends it to the default recipient.
 * 
 * @param options - Contact form data
 * @returns Promise with the result of the email sending operation
 */
export async function sendContactEmail(options: {
    name: string;
    email: string;
    subject?: string;
    message: string;
    to?: string | string[];
}): Promise<SendEmailResult> {
    const { name, email, subject, message, to } = options;

    // Determine recipient(s)
    const recipients = to || getDefaultToEmail();
    if (!recipients) {
        return {
            success: false,
            error: 'No recipient specified and SES_TO_EMAIL is not configured',
        };
    }

    // Format the email
    const emailSubject = subject || `[Contact Form] Message from ${name}`;
    const emailBody = `
New contact form submission:

Name: ${name}
Email: ${email}
${subject ? `Subject: ${subject}` : ''}

Message:
${message}

---
This email was sent from the contact form.
`.trim();

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; }
        .value { margin-top: 4px; }
        .message { background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; white-space: pre-wrap; }
        .footer { margin-top: 20px; font-size: 12px; color: #9ca3af; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin: 0;">📬 New Contact Form Submission</h2>
        </div>
        <div class="content">
            <div class="field">
                <div class="label">Name</div>
                <div class="value">${escapeHtml(name)}</div>
            </div>
            <div class="field">
                <div class="label">Email</div>
                <div class="value"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></div>
            </div>
            ${subject ? `
            <div class="field">
                <div class="label">Subject</div>
                <div class="value">${escapeHtml(subject)}</div>
            </div>
            ` : ''}
            <div class="field">
                <div class="label">Message</div>
                <div class="message">${escapeHtml(message)}</div>
            </div>
        </div>
        <div class="footer">
            This email was sent from the contact form.
        </div>
    </div>
</body>
</html>
`.trim();

    return sendEmail({
        to: recipients,
        subject: emailSubject,
        body: emailBody,
        htmlBody,
        replyTo: email,
    });
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
    const htmlEntities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    };
    return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}
