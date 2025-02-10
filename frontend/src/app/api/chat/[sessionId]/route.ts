// app/api/chat/[sessionId]/route.ts
import { db } from '@/lib/db';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    req: NextRequest,
    { params }: { params: { sessionId: string } }
) {
    const { sessionId } = params;

    // Set headers for SSE
    const headersList = headers();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const session = await db.chatSession.findUnique({
                where: { id: sessionId },
                include: { messages: true }
            });

            if (!session) {
                controller.close();
                return;
            }

            // Send initial messages
            const initialMessages = session.messages;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialMessages)}\n\n`));

            // Watch for new messages
            const interval = setInterval(async () => {
                const newMessages = await db.message.findMany({
                    where: {
                        chatSessionId: sessionId,
                        timestamp: {
                            gt: new Date(Date.now() - 1000) // Last second
                        }
                    }
                });

                if (newMessages.length > 0) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(newMessages)}\n\n`));
                }
            }, 1000);

            // Cleanup
            return () => clearInterval(interval);
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}

export async function POST(
    req: Request,
    { params }: { params: { sessionId: string } }
) {
    try {
        const { sessionId } = params;
        const { content, senderId, senderRole } = await req.json();

        const message = await db.message.create({
            data: {
                content,
                senderId,
                senderRole,
                chatSessionId: sessionId
            }
        });

        // Update message count
        await db.chatSession.update({
            where: { id: sessionId },
            data: { messageCount: { increment: 1 } }
        });

        return NextResponse.json(message);
    } catch (error) {
        console.error('[CHAT_MESSAGE]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
