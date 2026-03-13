import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class DatabaseStack extends cdk.Stack {
    public readonly itemsTable: dynamodb.Table;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Items Table - generic CRUD resource table
        this.itemsTable = new dynamodb.Table(this, 'ItemsTable', {
            tableName: 'next-amplify-starter-kit-items',
            partitionKey: {
                name: 'userId',
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: 'itemId',
                type: dynamodb.AttributeType.STRING,
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            pointInTimeRecovery: true,
        });

        // GSI: Query items by creation date
        this.itemsTable.addGlobalSecondaryIndex({
            indexName: 'gsi-userId-createdAt',
            partitionKey: {
                name: 'userId',
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: 'createdAt',
                type: dynamodb.AttributeType.STRING,
            },
            projectionType: dynamodb.ProjectionType.ALL,
        });

        // Outputs
        new cdk.CfnOutput(this, 'ItemsTableName', {
            value: this.itemsTable.tableName,
            description: 'DynamoDB Items Table Name',
        });

        new cdk.CfnOutput(this, 'ItemsTableArn', {
            value: this.itemsTable.tableArn,
            description: 'DynamoDB Items Table ARN',
        });
    }
}
