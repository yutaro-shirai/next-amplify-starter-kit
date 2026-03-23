'use client';

/**
 * Dashboard Page (Protected)
 *
 * A sample protected page that demonstrates:
 * - Redirecting unauthenticated users to /auth/login
 * - Displaying user info from the Cognito session
 * - Sign-out functionality
 * - Demo card layout for quick customization
 *
 * Replace the demo cards with your own application content.
 */
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, signOut } = useAuth();

    // Redirect to login if not authenticated (after loading completes)
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [isLoading, isAuthenticated, router]);

    // Show a loading spinner while checking session
    if (isLoading) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <svg
                        className="animate-spin h-12 w-12 text-purple-400 mx-auto mb-4"
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
                    <p className="text-gray-400">Loading your dashboard...</p>
                </div>
            </main>
        );
    }

    // Don't render content if not authenticated (redirect is in progress)
    if (!isAuthenticated || !user) {
        return null;
    }

    function handleSignOut() {
        signOut();
        router.push('/');
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Top Bar */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                        <p className="text-gray-400 mt-1">
                            Welcome back, {user.email}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            Home
                        </Link>
                        <button
                            onClick={handleSignOut}
                            className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Demo badge */}
                <div className="mb-8 inline-flex items-center px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg text-sm">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Sample dashboard &mdash; customize for your app
                </div>

                {/* User Info Card */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
                    <h2 className="text-lg font-semibold text-white mb-4">User Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</p>
                            <p className="text-white mt-1">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">User ID (sub)</p>
                            <p className="text-white mt-1 font-mono text-sm break-all">{user.sub}</p>
                        </div>
                    </div>
                </div>

                {/* Demo Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Recent Activity Card */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white ml-3">Recent Activity</h3>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex items-center text-gray-400 text-sm">
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-3" />
                                Signed in successfully
                            </li>
                            <li className="flex items-center text-gray-400 text-sm">
                                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3" />
                                Account created
                            </li>
                            <li className="flex items-center text-gray-400 text-sm">
                                <span className="w-2 h-2 bg-purple-400 rounded-full mr-3" />
                                Email verified
                            </li>
                        </ul>
                        <p className="mt-4 text-xs text-gray-600">
                            Replace with real activity data from your API.
                        </p>
                    </div>

                    {/* Quick Actions Card */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white ml-3">Quick Actions</h3>
                        </div>
                        <div className="space-y-2">
                            <button className="w-full text-left px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-colors text-sm">
                                Create New Project
                            </button>
                            <button className="w-full text-left px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-colors text-sm">
                                Invite Team Member
                            </button>
                            <button className="w-full text-left px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-colors text-sm">
                                View Documentation
                            </button>
                        </div>
                        <p className="mt-4 text-xs text-gray-600">
                            Wire these buttons to your own actions.
                        </p>
                    </div>

                    {/* Settings Card */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                    />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white ml-3">Settings</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm">Email Notifications</span>
                                <div className="w-10 h-6 bg-purple-500 rounded-full relative cursor-pointer">
                                    <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm">Dark Mode</span>
                                <div className="w-10 h-6 bg-purple-500 rounded-full relative cursor-pointer">
                                    <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm">Two-Factor Auth</span>
                                <div className="w-10 h-6 bg-gray-600 rounded-full relative cursor-pointer">
                                    <div className="w-4 h-4 bg-gray-400 rounded-full absolute left-1 top-1" />
                                </div>
                            </div>
                        </div>
                        <p className="mt-4 text-xs text-gray-600">
                            Connect these toggles to your settings API.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
