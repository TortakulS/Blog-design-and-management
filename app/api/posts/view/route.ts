import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { slug } = body;
        if (!slug) {
            return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
        }
        const decodedSlug = decodeURIComponent(slug);
        const findID = await prisma.blogs.findFirst({
            where: {
                slug:decodedSlug
            }, select: {
                id: true
            }
        })
        if (findID) {
            const updatedPost = await prisma.blogs.update({
                where: {
                    id: findID.id
                },
                data: {
                    views_count: { increment: 1 }
                },
                select: { views_count: true }
            });

            return NextResponse.json({ success: true, views: updatedPost.views_count }, { status: 200 });
        }else
            return NextResponse.json({ success: false }, { status: 500 });
    } catch (error: any) {
        console.error("View update error:", error);
        return NextResponse.json({ error: "ไม่สามารถอัปเดตยอดวิวได้" }, { status: 500 });
    }
}