-- AlterTable
ALTER TABLE "blogs" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "is_published" SET DEFAULT 'publish';
