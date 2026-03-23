'use client';

/**
 * Auth Context Provider
 *
 * Wraps your application with authentication state powered by AWS Cognito.
 * Provides the current user, loading state, and auth actions (signIn, signUp, signOut)
 * to any child component via the useAuth() hook.
 *
 * Usage:
 *   // In your layout or root component:
 *   <AuthProvider>{children}</AuthProvider>
 *
 *   // In any child component:
 *   const { user, isAuthenticated, signIn, signOut } = useAuth();
 */
import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from 'react';
import {
    signIn as cognitoSignIn,
    signUp as cognitoSignUp,
    signOut as cognitoSignOut,
    getSession,
    confirmSignUp as cognitoConfirmSignUp,
} from './auth';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Minimal user info extracted from the Cognito session */
export interface AuthUser {
    email: string;
    sub: string;
}

/** Shape of the auth context value */
interface AuthContextValue {
    /** Currently authenticated user, or null */
    user: AuthUser | null;
    /** True while the initial session check is in progress */
    isLoading: boolean;
    /** Convenience boolean — true when user is not null */
    isAuthenticated: boolean;
    /** Sign in with email and password */
    signIn: (email: string, password: string) => Promise<void>;
    /** Register a new account */
    signUp: (email: string, password: string) => Promise<void>;
    /** Confirm sign-up with verification code */
    confirmSignUp: (email: string, code: string) => Promise<void>;
    /** Sign out and clear local state */
    signOut: () => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider Component
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for an existing session on mount
    useEffect(() => {
        checkSession();
    }, []);

    /** Try to restore the session from local storage */
    async function checkSession() {
        try {
            const session = await getSession();
            const payload = session.getIdToken().decodePayload();
            setUser({
                email: payload['email'] as string,
                sub: payload['sub'] as string,
            });
        } catch {
            // No valid session — user is not logged in
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }

    /** Sign in and update local state */
    const handleSignIn = useCallback(async (email: string, password: string) => {
        const session = await cognitoSignIn(email, password);
        const payload = session.getIdToken().decodePayload();
        setUser({
            email: payload['email'] as string,
            sub: payload['sub'] as string,
        });
    }, []);

    /** Register a new user (does not auto-sign-in — user must confirm first) */
    const handleSignUp = useCallback(async (email: string, password: string) => {
        await cognitoSignUp(email, password);
    }, []);

    /** Confirm sign-up with the verification code */
    const handleConfirmSignUp = useCallback(async (email: string, code: string) => {
        await cognitoConfirmSignUp(email, code);
    }, []);

    /** Sign out and reset state */
    const handleSignOut = useCallback(() => {
        cognitoSignOut();
        setUser(null);
    }, []);

    const value: AuthContextValue = {
        user,
        isLoading,
        isAuthenticated: user !== null,
        signIn: handleSignIn,
        signUp: handleSignUp,
        confirmSignUp: handleConfirmSignUp,
        signOut: handleSignOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Access authentication state and actions.
 * Must be used within an <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an <AuthProvider>.');
    }
    return context;
}
