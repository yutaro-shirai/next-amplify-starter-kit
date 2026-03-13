import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    PutCommand,
    QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.ITEMS_TABLE_NAME || 'next-amplify-starter-kit-items';

const createItemSchema = z.object({
    userId: z.string().min(1),
    title: z.string().min(1).max(200),
    content: z.string().max(5000).optional(),
});

// GET /api/items?userId=xxx — List items for a user
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const result = await docClient.send(
            new QueryCommand({
                TableName: TABLE_NAME,
                IndexName: 'gsi-userId-createdAt',
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId,
                },
                ScanIndexForward: false, // newest first
            })
        );

        return NextResponse.json({ data: result.Items ?? [] });
    } catch (error) {
        console.error('GET /api/items error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch items' },
            { status: 500 }
        );
    }
}

// POST /api/items — Create a new item
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = createItemSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
        }

        const now = new Date().toISOString();
        const itemId = crypto.randomUUID();

        const item = {
            userId: parsed.data.userId,
            itemId,
            title: parsed.data.title,
            content: parsed.data.content ?? '',
            createdAt: now,
            updatedAt: now,
        };

        await docClient.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: item,
            })
        );

        return NextResponse.json({ data: item }, { status: 201 });
    } catch (error) {
        console.error('POST /api/items error:', error);

        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create item' },
            { status: 500 }
        );
    }
}
