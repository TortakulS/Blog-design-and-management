
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        const { username, password } = body;
        const user = await prisma.users.findFirst({
            where: {
                username: username
            },
            select: {
                id: true,
                username: true,
                password: true,
            }
        });
        if (!user) {
            return NextResponse.json(
                { message: "not found" },
                { status: 401 }
            );
        }
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );
        if (!isMatch) {
            return NextResponse.json(
                { message: "not found" },
                { status: 401 }
            );
        }
        const response = NextResponse.json({
            message: "Login success", status:'ok'
        });
        const token = jwt.sign(
            {
                userId: user.id,
            },
            process.env.JWT_SECRET!,
            {
                expiresIn: "1d"
            }
        );

        response.cookies.set("session", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24
        });
        
        return response
    } catch (error) {
        console.error(" ERROR:", error);
        return NextResponse.json({ error }, { status: 500 });
    }
}