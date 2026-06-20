"use client"
import { useRef } from "react";
import { use, useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { SiteHeader, formatDate } from "@/components/site-header"
import { useBlog } from "@/components/blog-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import Image from "next/image";
import { apiService } from "@/services/api";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function PostPage({
  params,
}: {
  params: Promise<{ slug: string }
  >
}) {
  const { slug } = use(params)
  const { getPostBySlug, approvedCommentsFor } = useBlog()
  const post = getPostBySlug(slug)
  const sliderRef = useRef<HTMLDivElement>(null);
  const [author, setAuthor] = useState("")
  const [body, setBody] = useState("")
  const [bodyError, setBodyError] = useState("");
  const [isOpenConfirm, setIsOpenConfirm] = useState(false);

  useEffect(() => {
    const updateBlogView = async () => {
      const storageKey = `viewed_blog_${slug}`;
      const hasViewed = sessionStorage.getItem(storageKey);

      if (!hasViewed) {
        try {
          const res = await apiService.view(slug);
          if (res && res.success) {
            sessionStorage.setItem(storageKey, 'true');
          }
        } catch (error) {
          console.error("Failed to update view count:", error);
        }
      }
    };

    if (slug) {
      updateBlogView();
    }
  }, [slug]);




  const allowedPattern = /^[ก-์๐-๙0-9\s฿]/u;
  const handleBodyChange = (value: string) => {
    setBody(value);

    if (value === "") {
      setBodyError("");
      return;
    }

    if (!allowedPattern.test(value)) {
      setBodyError("ข้อความของคุณมีอักขระพิเศษที่ไม่ได้รับอนุญาต");
    } else {
      setBodyError("");
    }
  };

  if (!post) {
    return (
      <div className="min-h-dvh">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-5 py-20 text-center">
          <h1 className="font-heading text-2xl font-semibold">ไม่พบบทความ</h1>
          <p className="mt-2 text-muted-foreground">
            บทความนี้อาจถูกลบหรือย้ายไปแล้ว
          </p>
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            variant="outline"
            className="mt-6"
          >
            กลับหน้าหลัก
          </Button>
        </main>
      </div>
    )
  }

  const approved = approvedCommentsFor(post.id)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim() || !author.trim()) {
      toast.error("กรุณากรอกชื่อผู้ส่งหรือพิมพ์แสดงความคิดเห็นก่อน")
      return
    }
    setIsOpenConfirm(true);
  }

  const handleConfirmSubmit = async () => {
    setIsOpenConfirm(false);
    await apiService.addcomment(post!.id, author, body)
    setAuthor("")
    setBody("")
    toast.success("ส่งความคิดเห็นแล้ว กรุณารอผู้ดูแลอนุมัติ")
  };

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          บทความทั้งหมด
        </Link>



        <article className="mt-8 max-w-3xl mx-auto px-4 pb-24">

          <header className="space-y-3 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-2 w-full">
              <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
                {formatDate(post.created_at)} · เขียนโดย {post.author}
              </p>
              <span className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground px-2.5 py-1 rounded-full text-xs font-medium">
                <Eye className="w-3.5 h-3.5" />
                {post.views_count.toLocaleString()} views
              </span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight text-balance">
              {post.title}
            </h1>
          </header>

          {post.cover_image && (
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border/60 shadow-md">
              <Image
                src={post.cover_image}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="whitespace-pre-line mt-10 leading-relaxed text-foreground/80 text-base sm:text-lg tracking-normal space-y-4">
            {post.content}
          </div>

          {post.blogImages && post.blogImages.length > 0 && (
            <section className="mt-16 border-t border-border pt-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
                    ภาพประกอบเพิ่มเติม
                  </h3>

                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (sliderRef.current) sliderRef.current.scrollLeft -= 400;
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      if (sliderRef.current) sliderRef.current.scrollLeft += 400;
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div
                ref={sliderRef}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {post.blogImages.map((img, index: number) => (
                  <div
                    key={img.id}
                    className="relative aspect-video w-[85%] sm:w-[60%] md:w-[50%] shrink-0 snap-start overflow-hidden rounded-xl border border-border/80 bg-muted shadow-sm transition-all duration-300 hover:brightness-105"
                  >
                    <Image
                      src={img.image_url}
                      alt={`ภาพประกอบที่ ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      {index + 1} / {post.blogImages.length}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>




        <section className=" border-t border-border pt-10">
          <h2 className="font-heading text-xl font-semibold">
            ความคิดเห็น ({approved.length})
          </h2>

          <div className="mt-6 flex flex-col gap-6">
            {approved.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                ยังไม่มีความคิดเห็น มาเป็นคนแรกกันเลย
              </p>
            ) : (
              approved.map((c) => (
                <div key={c.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{c.author}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(c.createdAt)}
                    </span>
                  </div>
                  <p className="text-pretty leading-relaxed text-muted-foreground">
                    {c.body}
                  </p>
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-10 flex flex-col gap-4 rounded-lg border border-border p-5"
          >
            <h3 className="font-medium">แสดงความคิดเห็น</h3>
            <div className="flex flex-col gap-2">
              <Label htmlFor="author">ชื่อผู้ส่ง</Label>
              <Input
                id="author"
                value={author}
                required
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="body" className="text-sm font-medium">
                เนื้อหาบทความ
              </label>

              <Textarea
                id="body"
                value={body}
                onChange={(e) => handleBodyChange(e.target.value)}
                placeholder="แบ่งปันความคิดของคุณ..."
                rows={4}
                required
                className={`w-full ${bodyError ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />

              {bodyError && (
                <p className="text-sm font-medium text-destructive animate-in fade-in-50 duration-200">
                  {bodyError}
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              ความคิดเห็นจะแสดงหลังจากผู้ดูแลอนุมัติแล้ว
            </p>
            <p  className="text-xs text-muted-foreground bg-red-50 rounded pl-2 pt-1 pb-1">
              แนวทางการ validate ใช้วิธีการตรวจสอบตัวอักษรโดยใช้การเทียบตัวอักษร Regular Expression (Regex) <br/>
              เพื่อกำหนดรูปแบบของข้อความที่อนุญาตให้กรอกได้
            </p>
            <Button type="submit" disabled={!!bodyError || !!body || !!author} className="w-fit">
              ส่งความคิดเห็น
            </Button>
          </form>
        </section>
      </main>
      <AlertDialog open={isOpenConfirm} onOpenChange={setIsOpenConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการส่งความคิดเห็น?</AlertDialogTitle>
            <AlertDialogDescription>
              เมื่อส่งแล้ว ความคิดเห็นของคุณจะถูกส่งไปยังผู้ดูแลระบบเพื่อตรวจสอบและอนุมัติก่อนแสดงผลบนเว็บไซต์
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>
              ยืนยันการส่ง
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
