/**
 * Auth Client - Lightweight Cognito authentication using amazon-cognito-identity-js
 *
 * This module provides a thin wrapper around the Cognito Identity SDK.
 * It is intentionally kept simple and framework-agnostic so you can
 * use it with any React state management approach (Context, Zustand, etc.).
 *
 * Required environment variables:
 *   NEXT_PUBLIC_COGNITO_USER_POOL_ID  — Cognito User Pool ID (from CDK output)
 *   NEXT_PUBLIC_COGNITO_CLIENT_ID     — Cognito App Client ID (from CDK output)
 *
 * Usage example:
 *   import { signIn, signOut, getCurrentUser } from '@/lib/auth';
 *   const session = await signIn('user@example.com', 'password');
 */
import {
    CognitoUserPool,
    CognitoUser,
    AuthenticationDetails,
    CognitoUserAttribute,
    CognitoUserSession,
    ISignUpResult,
} from 'amazon-cognito-identity-js';

// ---------------------------------------------------------------------------
// User Pool Configuration
// Reads from Next.js public environment variables so the values are available
// in both server and client components.
// ---------------------------------------------------------------------------
const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? '';
const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? '';

/**
 * Create the CognitoUserPool instance.
 * Returns null if the required env vars are missing (allows the app to run
 * without Cognito for local development or when auth is disabled).
 */
function getUserPool(): CognitoUserPool | null {
    if (!userPoolId || !clientId) {
        return null;
    }
    return new CognitoUserPool({
        UserPoolId: userPoolId,
        ClientId: clientId,
    });
}

// ---------------------------------------------------------------------------
// signUp — Register a new user with email and password
// ---------------------------------------------------------------------------
export function signUp(
    email: string,
    password: string,
    attributes?: Record<string, string>
): Promise<ISignUpResult> {
    return new Promise((resolve, reject) => {
        const pool = getUserPool();
        if (!pool) {
            return reject(new Error('Cognito is not configured. Check your environment variables.'));
        }

        // Build the list of user attributes (email is always included)
        const attributeList: CognitoUserAttribute[] = [
            new CognitoUserAttribute({ Name: 'email', Value: email }),
        ];

        // Append any additional attributes the caller provides
        if (attributes) {
            for (const [key, value] of Object.entries(attributes)) {
                attributeList.push(new CognitoUserAttribute({ Name: key, Value: value }));
            }
        }

        pool.signUp(email, password, attributeList, [], (err, result) => {
            if (err) return reject(err);
            if (!result) return reject(new Error('Sign-up failed: no result returned.'));
            resolve(result);
        });
    });
}

// ---------------------------------------------------------------------------
// confirmSignUp — Verify the email with the 6-digit code sent by Cognito
// ---------------------------------------------------------------------------
export function confirmSignUp(email: string, code: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const pool = getUserPool();
        if (!pool) {
            return reject(new Error('Cognito is not configured. Check your environment variables.'));
        }

        const cognitoUser = new CognitoUser({ Username: email, Pool: pool });

        cognitoUser.confirmRegistration(code, true, (err, result) => {
            if (err) return reject(err);
            resolve(result as string);
        });
    });
}

// ---------------------------------------------------------------------------
// resendConfirmationCode — Resend the verification code to the user's email
// ---------------------------------------------------------------------------
export function resendConfirmationCode(email: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const pool = getUserPool();
        if (!pool) {
            return reject(new Error('Cognito is not configured. Check your environment variables.'));
        }

        const cognitoUser = new CognitoUser({ Username: email, Pool: pool });

        cognitoUser.resendConfirmationCode((err, result) => {
            if (err) return reject(err);
            resolve(result as string);
        });
    });
}

// ---------------------------------------------------------------------------
// signIn — Authenticate with email and password
// Returns the Cognito session containing JWT tokens.
// ---------------------------------------------------------------------------
export function signIn(email: string, password: string): Promise<CognitoUserSession> {
    return new Promise((resolve, reject) => {
        const pool = getUserPool();
        if (!pool) {
            return reject(new Error('Cognito is not configured. Check your environment variables.'));
        }

        const cognitoUser = new CognitoUser({ Username: email, Pool: pool });
        const authDetails = new AuthenticationDetails({
            Username: email,
            Password: password,
        });

        cognitoUser.authenticateUser(authDetails, {
            onSuccess: (session) => resolve(session),
            onFailure: (err) => reject(err),
        });
    });
}

// ---------------------------------------------------------------------------
// signOut — Sign out the currently authenticated user
// Clears local tokens from storage.
// ---------------------------------------------------------------------------
export function signOut(): void {
    const pool = getUserPool();
    if (!pool) return;

    const cognitoUser = pool.getCurrentUser();
    if (cognitoUser) {
        cognitoUser.signOut();
    }
}

// ---------------------------------------------------------------------------
// getCurrentUser — Get the currently authenticated CognitoUser (if any)
// Returns null if no user is signed in.
// ---------------------------------------------------------------------------
export function getCurrentUser(): CognitoUser | null {
    const pool = getUserPool();
    if (!pool) return null;

    return pool.getCurrentUser();
}

// ---------------------------------------------------------------------------
// getSession — Retrieve the current session (validates and refreshes tokens)
// Resolves with the session if valid, or rejects if the user is not signed in.
// ---------------------------------------------------------------------------
export function getSession(): Promise<CognitoUserSession> {
    return new Promise((resolve, reject) => {
        const user = getCurrentUser();
        if (!user) {
            return reject(new Error('No authenticated user.'));
        }

        user.getSession((err: Error | null, session: CognitoUserSession | null) => {
            if (err) return reject(err);
            if (!session || !session.isValid()) {
                return reject(new Error('Session is invalid or expired.'));
            }
            resolve(session);
        });
    });
}
