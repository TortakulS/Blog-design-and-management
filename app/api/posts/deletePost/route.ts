import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request) {
    try {
        const {id} = await req.json();
        await prisma.blogs.update({
            where: {
                id
            },
            data: {
                is_deleted:true,
                is_published:'unpublish',
                deleted_at:new Date()
            },
        });
        return NextResponse.json({ success: true}, { status: 200 });
    
    } catch (error: any) {
    console.error("View update error:", error);
    return NextResponse.json({ error: "ไม่สามารถลบโพสได้" }, { status: 500 });
}
}