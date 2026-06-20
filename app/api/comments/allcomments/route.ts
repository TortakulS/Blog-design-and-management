import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const dbComments = await prisma.comments.findMany({
            orderBy: {
                create_at: 'desc',
            },
        });
        const activeComments = dbComments.filter(comment => comment.is_delete !== true);

        const mapdata =  activeComments.map((comment) => ({
            id: comment.id,
            postId: comment.blog_id,
            author: comment.author_name,
            body: comment.comment_text,
            status: comment.status, 
            createdAt: comment.create_at.toISOString(), 
        }));
        return NextResponse.json(mapdata);
    } catch (error) {
        console.error(" ERROR:", error);
        return NextResponse.json({ error }, { status: 500 });
    }
}