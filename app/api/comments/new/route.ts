import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function POST(req: Request) {
    try {

        const { blog_id, author, body } = await req.json();

        if (!blog_id || !author || !body) {
            return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
        }
        const newComment = await prisma.comments.create({
            data: {
                blog_id, 
                author_name: author,
                comment_text: body,
            },
        });

        return NextResponse.json({ message: "เพิ่มความคิดเห็นสำเร็จ" }, { status: 201 });
    } catch (error) {
        console.error(" ERROR:", error);
        return NextResponse.json({ error }, { status: 500 });
    }
}