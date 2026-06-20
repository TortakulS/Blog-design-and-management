-- CreateEnum
CREATE TYPE "published" AS ENUM ('publish', 'unpublish');

-- CreateEnum
CREATE TYPE "commentStatus" AS ENUM ('pending', 'rejected');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blogs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "dscription" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "cover_image" TEXT NOT NULL,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "is_published" "published" NOT NULL DEFAULT 'unpublish',
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_images" (
    "id" TEXT NOT NULL,
    "blog_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,

    CONSTRAINT "blog_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "blog_id" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "comment_text" TEXT NOT NULL,
    "status" "commentStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "blogs_id_idx" ON "blogs"("id");

-- CreateIndex
CREATE INDEX "blog_images_blog_id_idx" ON "blog_images"("blog_id");

-- CreateIndex
CREATE INDEX "comments_blog_id_idx" ON "comments"("blog_id");

-- AddForeignKey
ALTER TABLE "blog_images" ADD CONSTRAINT "blog_images_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
