import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("session")?.value;

        if (!token) {
            return NextResponse.json({ isAdmin: false, message: "Invalid or expired token" }, { status: 401 });
        }
        const formData = await req.formData();

        const title = formData.get("title") as string;
        const author = formData.get("author") as string;
        const excerpt = formData.get("excerpt") as string;
        const body = formData.get("body") as string;
        const slug = formData.get("slug") as string;

        const coverImageFile = formData.get("coverImage") as File | null;
        let coverImageUrl: string | null = null;

        if (coverImageFile && coverImageFile.size > 0) {
            const uniqueFileName = `cover/${Date.now()}-${coverImageFile.name}`;

            const { error: uploadError } = await supabase.storage
                .from("images")
                .upload(uniqueFileName, coverImageFile, {
                    contentType: coverImageFile.type,
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from("images")
                .getPublicUrl(uniqueFileName);

            coverImageUrl = urlData.publicUrl;
        }

        const galleryFiles = formData.getAll("galleryImages") as File[];
        let galleryUrls: string[] = [];

        if (galleryFiles && galleryFiles.length > 0) {
            for (const file of galleryFiles) {
                if (file.size > 0) {
                    const uniqueFileName = `gallery/${Date.now()}-${file.name}`;

                    const { error: uploadError } = await supabase.storage
                        .from("images")
                        .upload(uniqueFileName, file, {
                            contentType: file.type,
                            upsert: true
                        });

                    if (uploadError) throw uploadError;

                    const { data: urlData } = supabase.storage
                        .from("images")
                        .getPublicUrl(uniqueFileName);

                    galleryUrls.push(urlData.publicUrl);
                }
            }
        }

        const newPost = await prisma.blogs.create({
            data: {
                title,
                author,
                dscription: excerpt,
                content: body,
                slug,
                cover_image: coverImageUrl || '',
                created_at: new Date()
            },
        });

        if (galleryUrls.length > 0) {
            await prisma.blog_images.createMany({
                data: galleryUrls.map((url) => ({
                    blog_id: newPost.id,
                    image_url: url,
                })),
            });
        }

        return NextResponse.json({ message: "สร้างโพสต์ด้วย Prisma สำเร็จ!", data: newPost }, { status: 200 });

    } catch (error: any) {
        console.error("ERROR:", error);
        return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 });
    }
}