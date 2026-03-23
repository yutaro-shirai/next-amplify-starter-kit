'use client';

/**
 * Email Confirmation Page
 *
 * After signing up, users are redirected here to enter the 6-digit
 * verification code sent by Cognito. Includes a "Resend Code" button
 * in case the email didn't arrive.
 *
 * On successful confirmation, the user is redirected to the login page.
 */
import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { resendConfirmationCode } from '@/lib/auth';

/**
 * Inner component that uses useSearchParams (must be wrapped in Suspense)
 */
function ConfirmForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { confirmSignUp } = useAuth();

    // Pre-fill email from the query string (passed from sign-up page)
    const [email, setEmail] = useState(searchParams.get('email') ?? '');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resendMessage, setResendMessage] = useState('');

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');
        setResendMessage('');
        setIsSubmitting(true);

        try {
            await confirmSignUp(email, code);
            // Confirmation successful — redirect to login
            router.push('/auth/login');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
            if (message.includes('CodeMismatchException')) {
                setError('Invalid verification code. Please check and try again.');
            } else if (message.includes('ExpiredCodeException')) {
                setError('This code has expired. Please request a new one.');
            } else {
                setError(message);
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleResendCode() {
        if (!email) {
            setError('Please enter your email address first.');
            return;
        }
        setError('');
        setResendMessage('');

        try {
            await resendConfirmationCode(email);
            setResendMessage('A new verification code has been sent to your email.');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to resend code.';
            setError(message);
        }
    }

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Message */}
                {error && (
                    <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}

                {/* Success / info message */}
                {resendMessage && (
                    <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {resendMessage}
                        </div>
                    </div>
                )}

                {/* Email (pre-filled but editable) */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                        placeholder="your.email@example.com"
                    />
                </div>

                {/* Verification Code */}
                <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
                        Verification Code <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        id="code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                        maxLength={6}
                        pattern="[0-9]{6}"
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-center text-2xl tracking-widest"
                        placeholder="000000"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                        Enter the 6-digit code sent to your email.
                    </p>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center">
                            <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            Verifying...
                        </span>
                    ) : (
                        'Verify Email'
                    )}
                </button>

                {/* Resend code */}
                <div className="text-center">
                    <button
                        type="button"
                        onClick={handleResendCode}
                        className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                    >
                        Didn&apos;t receive the code? Resend it
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function ConfirmPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-16 px-4">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">Verify Your Email</h1>
                    <p className="text-gray-300">
                        We&apos;ve sent a 6-digit verification code to your email address.
                    </p>
                    {/* Demo badge */}
                    <div className="mt-4 inline-flex items-center px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg text-sm">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Sample auth page &mdash; powered by AWS Cognito
                    </div>
                </div>

                {/* Wrap in Suspense because useSearchParams requires it */}
                <Suspense
                    fallback={
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center text-gray-400">
                            Loading...
                        </div>
                    }
                >
                    <ConfirmForm />
                </Suspense>

                {/* Back link */}
                <div className="text-center mt-8">
                    <Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors">
                        &larr; Back to Sign In
                    </Link>
                </div>
            </div>
        </main>
    );
}
