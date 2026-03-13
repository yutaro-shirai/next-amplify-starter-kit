import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export interface AuthStackProps extends cdk.StackProps {
    /**
     * Callback URLs for OAuth (e.g., http://localhost:3000/api/auth/callback)
     * @default ['http://localhost:3000/api/auth/callback']
     */
    readonly callbackUrls?: string[];

    /**
     * Logout URLs for OAuth
     * @default ['http://localhost:3000']
     */
    readonly logoutUrls?: string[];
}

export class AuthStack extends cdk.Stack {
    public readonly userPool: cognito.UserPool;
    public readonly userPoolClient: cognito.UserPoolClient;

    constructor(scope: Construct, id: string, props?: AuthStackProps) {
        super(scope, id, props);

        // Cognito User Pool
        this.userPool = new cognito.UserPool(this, 'UserPool', {
            userPoolName: 'next-amplify-starter-kit-users',
            selfSignUpEnabled: true,
            signInAliases: {
                email: true,
            },
            autoVerify: {
                email: true,
            },
            standardAttributes: {
                email: {
                    required: true,
                    mutable: true,
                },
                fullname: {
                    required: false,
                    mutable: true,
                },
            },
            passwordPolicy: {
                minLength: 8,
                requireLowercase: true,
                requireUppercase: true,
                requireDigits: true,
                requireSymbols: false,
            },
            accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });

        // User Pool Client
        const callbackUrls = props?.callbackUrls ?? [
            'http://localhost:3000/api/auth/callback',
        ];
        const logoutUrls = props?.logoutUrls ?? [
            'http://localhost:3000',
        ];

        this.userPoolClient = this.userPool.addClient('WebClient', {
            userPoolClientName: 'next-amplify-starter-kit-web',
            authFlows: {
                userSrp: true,
            },
            oAuth: {
                flows: {
                    authorizationCodeGrant: true,
                },
                scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE],
                callbackUrls,
                logoutUrls,
            },
            preventUserExistenceErrors: true,
        });

        // User Pool Domain (Cognito hosted UI)
        const domainPrefix = process.env.COGNITO_DOMAIN_PREFIX || 'next-amplify-starter-kit';
        this.userPool.addDomain('CognitoDomain', {
            cognitoDomain: {
                domainPrefix,
            },
        });

        // Outputs
        new cdk.CfnOutput(this, 'UserPoolId', {
            value: this.userPool.userPoolId,
            description: 'Cognito User Pool ID',
        });

        new cdk.CfnOutput(this, 'UserPoolClientId', {
            value: this.userPoolClient.userPoolClientId,
            description: 'Cognito User Pool Client ID',
        });

        new cdk.CfnOutput(this, 'CognitoDomainUrl', {
            value: `https://${domainPrefix}.auth.${this.region}.amazoncognito.com`,
            description: 'Cognito Hosted UI Domain',
        });
    }
}
