import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("session")?.value;

        if (!token) {
            return NextResponse.json({ isAdmin: false, message: "Invalid or expired token" }, { status: 401 });
        }

        const formData = await req.formData();
        const postId = formData.get("postId") as string;
        const title = formData.get("title") as string;
        const author = formData.get("author") as string;
        const dscription = formData.get("dscription") as string;
        const content = formData.get("content") as string;
        const slug = formData.get("slug") as string;

        const remainImageIdsRaw = formData.get("remainImageIds") as string;
        const remainImageIds: string[] = remainImageIdsRaw ? JSON.parse(remainImageIdsRaw) : [];

        let coverImageUrl = formData.get("coverImageUrl") as string;
        const coverImageFile = formData.get("coverImage") as File | null;
        const currentPost = await prisma.blogs.findUnique({
            where: { id: postId }
        });
        if (currentPost && currentPost.cover_image) {
            try {
                const oldCoverPath = currentPost.cover_image.split('/storage/v1/object/public/images/')[1];
                if (oldCoverPath) {
                    await supabase.storage
                        .from("images")
                        .remove([oldCoverPath]);
                }
            } catch (err) {
                console.error(err);
            }
        }
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

        const oldImages = await prisma.blog_images.findMany({
            where: { blog_id: postId }
        });
        const imagesToDelete = oldImages.filter(img => !remainImageIds.includes(img.id));

        if (imagesToDelete.length > 0) {
            const filesToDelete = imagesToDelete.map(img => {
                const parts = img.image_url.split('/storage/v1/object/public/images/');
                return parts[1];
            });

            const { error: storageError } = await supabase.storage
                .from("images")
                .remove(filesToDelete);

            if (storageError) {
                console.error("Error", storageError);
            }
        }

        const result = await prisma.$transaction(async (tx) => {
            return await tx.blogs.update({
                where: { id: postId },
                data: {
                    title,
                    author,
                    dscription,
                    content,
                    slug,
                    cover_image: coverImageUrl,
                    blogImages: {
                        deleteMany: {
                            id: {
                                notIn: remainImageIds,
                            },
                        },
                        createMany: {
                            data: galleryUrls.map((url) => ({
                                image_url: url,
                            })),
                        },
                    },
                },
                include: {
                    blogImages: true,
                },
            });
        });

        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        console.error("Backend Error:", error);
        return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการอัปเดต" }, { status: 500 });
    }
}