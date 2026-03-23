'use client';

/**
 * Conditional Auth Provider Wrapper
 *
 * Only wraps children with the AuthProvider if Cognito environment variables
 * are set. This allows the app to run without Cognito configured (e.g., for
 * local development or when auth is not needed).
 *
 * The check uses NEXT_PUBLIC_ env vars which are inlined at build time,
 * so this has zero runtime cost when Cognito is disabled.
 */
import { type ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth-context';

const isCognitoConfigured =
    !!process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID &&
    !!process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

export function AuthProviderWrapper({ children }: { children: ReactNode }) {
    if (isCognitoConfigured) {
        return <AuthProvider>{children}</AuthProvider>;
    }
    return <>{children}</>;
}
