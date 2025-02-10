import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    // Set headers for Server-Sent Events
    const headers = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    };

    try {
        // Create a response stream
        const stream = new ReadableStream({
            async start(controller) {
                // Function to fetch and send doctors
                const sendDoctors = async () => {
                    try {
                        const doctors = await db.doctor.findMany({
                            where: {
                                isAvailable: true,
                            },
                            select: {
                                id: true,
                                name: true,
                                speciality: true,
                                isAvailable: true,
                                // Add other fields you want to expose
                            }
                        });

                        const data = `data: ${JSON.stringify(doctors)}\n\n`;
                        controller.enqueue(new TextEncoder().encode(data));
                    } catch (error) {
                        console.error('[DOCTOR_FETCH_ERROR]', error);
                        // Send error event to client
                        const errorData = `event: error\ndata: Failed to fetch doctors\n\n`;
                        controller.enqueue(new TextEncoder().encode(errorData));
                    }
                };

                // Initial send
                await sendDoctors();

                // Poll for updates every 30 seconds
                const interval = setInterval(sendDoctors, 30000);

                // Cleanup on close
                return () => {
                    clearInterval(interval);
                };
            }
        });

        return new NextResponse(stream, { headers });
    } catch (error) {
        console.error('[DOCTOR_AVAILABILITY_STREAM]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
