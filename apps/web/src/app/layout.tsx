import type { Metadata } from 'next';
import './globals.css';
import { AuthProviderWrapper } from './auth-provider-wrapper';

export const metadata: Metadata = {
    title: 'Next.js Amplify Starter Kit',
    description: 'A modern monorepo starter kit with Next.js, AWS Amplify, and CDK',
    keywords: ['Next.js', 'AWS', 'Amplify', 'CDK', 'Monorepo', 'Turborepo'],
    openGraph: {
        title: 'Next.js Amplify Starter Kit',
        description: 'A modern monorepo starter kit with Next.js, AWS Amplify, and CDK',
        type: 'website',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                <AuthProviderWrapper>{children}</AuthProviderWrapper>
            </body>
        </html>
    );
}
