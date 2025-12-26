import * as cdk from 'aws-cdk-lib';
import * as ses from 'aws-cdk-lib/aws-ses';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

export interface SesStackProps extends cdk.StackProps {
    /**
     * Email address to verify for sending emails
     * @default - Retrieved from environment variable SES_FROM_EMAIL
     */
    readonly fromEmail?: string;

    /**
     * Domain to verify for sending emails (optional, alternative to email verification)
     * @default - Retrieved from environment variable SES_DOMAIN
     */
    readonly domain?: string;

    /**
     * Route53 Hosted Zone ID for automatic DKIM record creation
     * If specified, DKIM CNAME records will be automatically added to the hosted zone
     * @default - Retrieved from environment variable ROUTE53_HOSTED_ZONE_ID
     */
    readonly hostedZoneId?: string;

    /**
     * Whether to create a configuration set for tracking
     * @default false
     */
    readonly enableConfigurationSet?: boolean;
}

export class SesStack extends cdk.Stack {
    public readonly emailIdentity?: ses.CfnEmailIdentity;
    public readonly domainIdentity?: ses.CfnEmailIdentity;
    public readonly configurationSet?: ses.CfnConfigurationSet;

    constructor(scope: Construct, id: string, props?: SesStackProps) {
        super(scope, id, props);

        // Get configuration from props or environment variables
        const fromEmail = props?.fromEmail || process.env.SES_FROM_EMAIL;
        const domain = props?.domain || process.env.SES_DOMAIN;
        const hostedZoneId = props?.hostedZoneId || process.env.ROUTE53_HOSTED_ZONE_ID;
        const enableConfigurationSet = props?.enableConfigurationSet ?? false;

        // Validate that at least one identity is specified
        if (!fromEmail && !domain) {
            throw new Error(
                'Either SES_FROM_EMAIL or SES_DOMAIN must be specified. ' +
                'Set the environment variable or pass via props.'
            );
        }

        // Create Email Identity if fromEmail is specified
        if (fromEmail) {
            this.emailIdentity = new ses.CfnEmailIdentity(this, 'EmailIdentity', {
                emailIdentity: fromEmail,
            });

            new cdk.CfnOutput(this, 'SesEmailIdentity', {
                value: fromEmail,
                description: 'SES Email Identity (verification required)',
            });
        }

        // Create Domain Identity if domain is specified
        if (domain) {
            this.domainIdentity = new ses.CfnEmailIdentity(this, 'DomainIdentity', {
                emailIdentity: domain,
                dkimSigningAttributes: {
                    nextSigningKeyLength: 'RSA_2048_BIT',
                },
            });

            new cdk.CfnOutput(this, 'SesDomainIdentity', {
                value: domain,
                description: 'SES Domain Identity (DNS verification required)',
            });

            // If Route53 Hosted Zone ID is provided, automatically create DKIM CNAME records
            if (hostedZoneId) {
                const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
                    hostedZoneId: hostedZoneId,
                    zoneName: domain,
                });

                // Create DKIM CNAME records for domain verification
                // SES provides 3 DKIM tokens that need to be added as CNAME records
                for (let i = 1; i <= 3; i++) {
                    const tokenAttr = i === 1 
                        ? this.domainIdentity.attrDkimDnsTokenName1 
                        : i === 2 
                            ? this.domainIdentity.attrDkimDnsTokenName2 
                            : this.domainIdentity.attrDkimDnsTokenName3;

                    new route53.CnameRecord(this, `DkimRecord${i}`, {
                        zone: hostedZone,
                        recordName: `${tokenAttr}._domainkey`,
                        domainName: `${tokenAttr}.dkim.amazonses.com`,
                        ttl: cdk.Duration.minutes(5),
                        comment: `SES DKIM verification record ${i}`,
                    });
                }

                new cdk.CfnOutput(this, 'DkimRecordsCreated', {
                    value: 'true',
                    description: 'DKIM records automatically created in Route53',
                });
            } else {
                // Output DKIM tokens for manual DNS configuration
                new cdk.CfnOutput(this, 'DkimToken1', {
                    value: this.domainIdentity.attrDkimDnsTokenName1,
                    description: 'DKIM Token 1 - Add CNAME: {token}._domainkey.{domain} -> {token}.dkim.amazonses.com',
                });
                new cdk.CfnOutput(this, 'DkimToken2', {
                    value: this.domainIdentity.attrDkimDnsTokenName2,
                    description: 'DKIM Token 2 - Add CNAME: {token}._domainkey.{domain} -> {token}.dkim.amazonses.com',
                });
                new cdk.CfnOutput(this, 'DkimToken3', {
                    value: this.domainIdentity.attrDkimDnsTokenName3,
                    description: 'DKIM Token 3 - Add CNAME: {token}._domainkey.{domain} -> {token}.dkim.amazonses.com',
                });

                new cdk.CfnOutput(this, 'DkimManualSetupRequired', {
                    value: 'Set ROUTE53_HOSTED_ZONE_ID to automatically create DKIM records, or add CNAME records manually.',
                    description: 'DKIM Manual Setup Notice',
                });
            }
        }

        // Create Configuration Set if enabled
        if (enableConfigurationSet) {
            this.configurationSet = new ses.CfnConfigurationSet(this, 'ConfigurationSet', {
                name: `${this.stackName}-config-set`,
                trackingOptions: {
                    customRedirectDomain: domain,
                },
                reputationOptions: {
                    reputationMetricsEnabled: true,
                },
                sendingOptions: {
                    sendingEnabled: true,
                },
            });

            new cdk.CfnOutput(this, 'SesConfigurationSet', {
                value: this.configurationSet.name || '',
                description: 'SES Configuration Set name',
            });
        }

        // Create IAM policy for SES sending (can be attached to Amplify execution role)
        const sesSendPolicy = new iam.ManagedPolicy(this, 'SesSendPolicy', {
            managedPolicyName: `${this.stackName}-ses-send-policy`,
            description: 'Policy for sending emails via SES',
            statements: [
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: [
                        'ses:SendEmail',
                        'ses:SendRawEmail',
                        'ses:SendTemplatedEmail',
                    ],
                    resources: ['*'],
                    conditions: fromEmail ? {
                        'StringEquals': {
                            'ses:FromAddress': fromEmail,
                        },
                    } : undefined,
                }),
            ],
        });

        new cdk.CfnOutput(this, 'SesSendPolicyArn', {
            value: sesSendPolicy.managedPolicyArn,
            description: 'ARN of the SES send policy (attach to your execution role)',
        });

        // Output important notes about SES sandbox mode
        new cdk.CfnOutput(this, 'SesNote', {
            value: 'IMPORTANT: New AWS accounts are in SES sandbox mode. You can only send to verified emails. Request production access in AWS Console.',
            description: 'SES Sandbox Mode Notice',
        });
    }
}
