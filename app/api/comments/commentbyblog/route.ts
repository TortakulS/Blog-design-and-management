import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("session")?.value;

        if (!token) {
            return NextResponse.json({ isAdmin: false, message: "Invalid or expired token" }, { status: 401 });
        }
        const post = await prisma.blogs.findMany({
            include: {
                blogImages: true,
            },
        });
        return NextResponse.json({ post }, { status: 200 });
    } catch (error) {
        console.error(" ERROR:", error);
        return NextResponse.json({ error }, { status: 500 });
    }
}