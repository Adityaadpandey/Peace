import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const doctor = await db.doctor.findMany({
            where: {
                isAvailable:true,
            },
        });
        console.log(doctor);

        return NextResponse.json(doctor);
    } catch (error) {
        console.error('[DOCTOR_AVAILABILITY]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
