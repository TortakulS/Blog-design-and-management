-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_delete" BOOLEAN NOT NULL DEFAULT false;
