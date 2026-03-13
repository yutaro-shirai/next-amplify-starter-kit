import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    GetCommand,
    UpdateCommand,
    DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.ITEMS_TABLE_NAME || 'next-amplify-starter-kit-items';

const updateItemSchema = z.object({
    userId: z.string().min(1),
    title: z.string().min(1).max(200).optional(),
    content: z.string().max(5000).optional(),
});

// GET /api/items/[itemId]?userId=xxx — Get a single item
export async function GET(
    request: Request,
    { params }: { params: Promise<{ itemId: string }> }
) {
    const { itemId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const result = await docClient.send(
        new GetCommand({
            TableName: TABLE_NAME,
            Key: { userId, itemId },
        })
    );

    if (!result.Item) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ data: result.Item });
}

// PATCH /api/items/[itemId] — Update an item
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ itemId: string }> }
) {
    const { itemId } = await params;
    const body = await request.json();
    const parsed = updateItemSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { userId, ...updates } = parsed.data;
    const now = new Date().toISOString();

    const updateExpressions: string[] = ['#updatedAt = :updatedAt'];
    const expressionNames: Record<string, string> = { '#updatedAt': 'updatedAt' };
    const expressionValues: Record<string, string> = { ':updatedAt': now };

    if (updates.title !== undefined) {
        updateExpressions.push('#title = :title');
        expressionNames['#title'] = 'title';
        expressionValues[':title'] = updates.title;
    }

    if (updates.content !== undefined) {
        updateExpressions.push('#content = :content');
        expressionNames['#content'] = 'content';
        expressionValues[':content'] = updates.content;
    }

    const result = await docClient.send(
        new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { userId, itemId },
            UpdateExpression: `SET ${updateExpressions.join(', ')}`,
            ExpressionAttributeNames: expressionNames,
            ExpressionAttributeValues: expressionValues,
            ReturnValues: 'ALL_NEW',
            ConditionExpression: 'attribute_exists(itemId)',
        })
    );

    return NextResponse.json({ data: result.Attributes });
}

// DELETE /api/items/[itemId]?userId=xxx — Delete an item
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ itemId: string }> }
) {
    const { itemId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    await docClient.send(
        new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { userId, itemId },
        })
    );

    return NextResponse.json({ data: { deleted: true } });
}
