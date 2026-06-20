import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request) {
    try {
        const {id,status} = await req.json();
        await prisma.blogs.update({
            where: {
                id
            },
            data: {
                is_published:status
            },
        });
        return NextResponse.json({ success: true}, { status: 200 });
    
    } catch (error: any) {
    console.error("View update error:", error);
    return NextResponse.json({ error:error }, { status: 500 });
}
}