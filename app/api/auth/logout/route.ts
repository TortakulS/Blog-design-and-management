
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("session")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const response = NextResponse.json({ message: "Logout success" });
        cookieStore.delete("session");
        return response;
    } catch (error) {
        console.error("ERROR:", error);
        return NextResponse.json({ error }, { status: 500 });
    }
}