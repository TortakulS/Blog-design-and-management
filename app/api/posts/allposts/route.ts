import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { isAdmin } = await req.json();
        if (isAdmin) {
            const post = await prisma.blogs.findMany({
                where: {
                    is_deleted: false
                },
                include: {
                    blogImages: true,
                },orderBy:{
                    created_at:'desc'
                }
            });
            return NextResponse.json({ post }, { status: 200 });
        } else {
            const post = await prisma.blogs.findMany({
                where: {
                    is_deleted: false,
                    is_published: 'publish'
                },
                include: {
                    blogImages: true,
                },orderBy:{
                    created_at:'desc'
                }
            });
            return NextResponse.json({ post }, { status: 200 });
        }
    } catch (error) {
        console.error(" ERROR:", error);
        return NextResponse.json({ error }, { status: 500 });
    }
}