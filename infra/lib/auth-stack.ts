/**
 * Auth Stack - AWS Cognito User Pool
 *
 * Creates a Cognito User Pool with email-based authentication.
 * This is an optional stack — only deployed when COGNITO_ENABLED=true.
 *
 * Resources created:
 * - Cognito User Pool (email sign-up/sign-in, self-registration, email verification)
 * - Cognito User Pool Client (for frontend authentication)
 *
 * Outputs:
 * - UserPoolId: Use as NEXT_PUBLIC_COGNITO_USER_POOL_ID in your frontend
 * - UserPoolClientId: Use as NEXT_PUBLIC_COGNITO_CLIENT_ID in your frontend
 */
import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export class AuthStack extends cdk.Stack {
    public readonly userPool: cognito.UserPool;
    public readonly userPoolClient: cognito.UserPoolClient;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // ---------------------------------------------------------
        // Cognito User Pool
        // - Email-based sign-in (no username required)
        // - Self-registration enabled so users can sign up on their own
        // - Email verification required before sign-in
        // - Standard password policy: minimum 8 characters
        // ---------------------------------------------------------
        this.userPool = new cognito.UserPool(this, 'UserPool', {
            userPoolName: `${this.stackName}-user-pool`,

            // Allow users to sign up on their own
            selfSignUpEnabled: true,

            // Sign-in configuration: email as the primary identifier
            signInAliases: {
                email: true,
            },

            // Require email verification before allowing sign-in
            autoVerify: {
                email: true,
            },

            // Standard attributes collected during sign-up
            standardAttributes: {
                email: {
                    required: true,
                    mutable: true,
                },
            },

            // Password policy: minimum 8 characters with complexity requirements
            passwordPolicy: {
                minLength: 8,
                requireLowercase: true,
                requireUppercase: true,
                requireDigits: true,
                requireSymbols: false,
            },

            // Account recovery via email
            accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,

            // Removal policy: DESTROY for development convenience
            // Change to RETAIN for production deployments
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        // ---------------------------------------------------------
        // User Pool Client
        // - Used by the frontend to interact with Cognito
        // - No client secret (required for browser-based auth)
        // - Standard auth flows for email/password sign-in
        // ---------------------------------------------------------
        this.userPoolClient = this.userPool.addClient('UserPoolClient', {
            userPoolClientName: `${this.stackName}-client`,

            // Auth flows: allow standard username/password and SRP-based auth
            authFlows: {
                userPassword: true,
                userSrp: true,
            },

            // No client secret — required for public clients (browser apps)
            generateSecret: false,

            // Token validity periods
            accessTokenValidity: cdk.Duration.hours(1),
            idTokenValidity: cdk.Duration.hours(1),
            refreshTokenValidity: cdk.Duration.days(30),
        });

        // ---------------------------------------------------------
        // CloudFormation Outputs
        // Copy these values into your frontend .env.local file
        // ---------------------------------------------------------
        new cdk.CfnOutput(this, 'UserPoolId', {
            value: this.userPool.userPoolId,
            description: 'Cognito User Pool ID (use as NEXT_PUBLIC_COGNITO_USER_POOL_ID)',
        });

        new cdk.CfnOutput(this, 'UserPoolClientId', {
            value: this.userPoolClient.userPoolClientId,
            description: 'Cognito User Pool Client ID (use as NEXT_PUBLIC_COGNITO_CLIENT_ID)',
        });

        new cdk.CfnOutput(this, 'UserPoolArn', {
            value: this.userPool.userPoolArn,
            description: 'Cognito User Pool ARN',
        });
    }
}
