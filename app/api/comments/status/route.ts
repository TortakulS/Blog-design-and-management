import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
export async function PATCH(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("session")?.value;
        const { cID, status } = await req.json();
        console.log(cID,status)
        if (!token) {
            return NextResponse.json({ isAdmin: false, message: "Invalid or expired token" }, { status: 401 });
        }
        await prisma.comments.update({
            where:{
                id:cID
            },
            data: {
                status
            },
        });

        return NextResponse.json({ message: 'success' }, { status: 200 });
    } catch (error) {
        console.error(" ERROR:", error);
        return NextResponse.json({ error }, { status: 500 });
    }
}