import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("session")?.value;

        if (!token) {
            return NextResponse.json({ isAdmin: false, message: "Invalid or expired token" }, { status: 401 });
        }
        return NextResponse.json({ isAdmin: true, message: "Authorized" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ isAdmin: false, message: "Server error" }, { status: 500 });
    }
}