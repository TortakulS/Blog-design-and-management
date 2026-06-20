"use client"

import { useMemo, useState } from "react"
import { Pencil, Trash2, Plus, X, Search, EyeOff, Globe, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useBlog, type Post } from "@/components/blog-provider"
import { formatDate } from "@/components/site-header"
import { ADMIN_PAGE_SIZE, PaginationBar } from "@/components/pagination-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type BlogImage = {
  id: string
  blog_id: string
  image_url: string
}

type Draft = {
  title: string;
  author: string;
  excerpt: string;
  body: string;
  slug: string;
  coverImage: File | string | null;
  galleryImages: (File | BlogImage)[];
};

import { apiService } from "@/services/api"
const emptyDraft: Draft = { title: "", author: "ทีมงาน", excerpt: "", body: "", slug: "", coverImage: null, galleryImages: [] }

export function AdminPosts() {
  const { posts, deletePost, initAppData } = useBlog()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return posts
    return posts.filter((p) => p.title.toLowerCase().includes(q))
  }, [posts, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ADMIN_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * ADMIN_PAGE_SIZE
  const visible = filtered.slice(start, start + ADMIN_PAGE_SIZE)

  function startCreate() {
    setEditingId(null)
    setDraft(emptyDraft)
    setShowForm(true)
  }

  function startEdit(post: Post) {
    setEditingId(post.id)
    setDraft({
      title: post.title,
      author: post.author,
      excerpt: post.dscription || "",
      body: post.content || "",
      slug: post.slug,
      coverImage: post.cover_image || null,
      galleryImages: post.blogImages || []
    });

    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setDraft(emptyDraft)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    if (!draft.title.trim() || !draft.body.trim()) {
      toast.error("กรุณากรอกหัวข้อและเนื้อหา")
      return
    }
    if (editingId) {
      await apiService.updatePost(editingId, draft)
      initAppData()
      setLoading(false)
      toast.success("อัปเดตบทความแล้ว")
    } else {
      const newPost = {
        ...draft,
      }
      await apiService.createPost(newPost)
      initAppData()
      setLoading(false)
      toast.success("สร้างบทความใหม่แล้ว")
    }

    closeForm()
  }

  async function handleDelete(post: Post) {
    deletePost(post.id)
    await apiService.deletePost(post.id)
    initAppData()
    toast.success("ลบบทความแล้ว")
    if (editingId === post.id) closeForm()
  }

  const handleTogglePublish = async (post: Post) => {
    const nextStatus = post.is_published === 'publish' ? 'unpublish' : 'publish';
    try {

      await apiService.PublishPost(post.id, nextStatus);
      initAppData()
      toast.success("เผยแพร่ Blog สำเร็จ!")
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการเปลี่ยนสถานะ:", error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          ทั้งหมด {posts.length} บทความ
        </p>
        {!showForm && (
          <Button size="sm" onClick={startCreate}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            เขียนบทความใหม่
          </Button>
        )}
      </div>

      <div className="relative w-full sm:max-w-xs">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(1)
          }}
          placeholder="ค้นหาบทความตามชื่อ..."
          aria-label="ค้นหาบทความตามชื่อ"
          className="pl-9"
        />
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold">
                {editingId ? "แก้ไขบทความ" : "บทความใหม่"}
              </h3>
              <Button variant="ghost" size="icon" onClick={closeForm}>
                <X className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">ปิด</span>
              </Button>
            </div>
            <form className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">หัวข้อ</Label>
                <Input
                  id="title"
                  value={draft.title}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, title: e.target.value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="author">ผู้เขียน</Label>
                <Input
                  id="author"
                  value={draft.author}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, author: e.target.value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="slug">slug</Label>
                <Input
                  id="slug"
                  placeholder="กรณีไม่กรอกจะใช้ชื่อหัวข้อเป็น slug"
                  value={draft.slug}
                  onChange={(e) => {
                    const formattedSlug = e.target.value
                      .replace(/\s+/g, '-')
                      .replace(/-+/g, '-')
                      .toLowerCase();
                    setDraft((d) => ({ ...d, slug: formattedSlug }));
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="excerpt">เกริ่นนำ</Label>
                <Textarea
                  id="excerpt"
                  rows={2}
                  value={draft.excerpt}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, excerpt: e.target.value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="body">เนื้อหา (เว้นบรรทัดว่างเพื่อขึ้นย่อหน้าใหม่)</Label>
                <Textarea
                  id="body"
                  rows={8}
                  value={draft.body}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, body: e.target.value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="coverImage">รูปปก</Label>

                <Input
                  id="coverImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;

                    setDraft((d) => ({
                      ...d,
                      coverImage: file,
                    }));
                  }}
                />

                {draft.coverImage && (
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    <div className="relative">

                      <img
                        src={
                          typeof draft.coverImage === "string"
                            ? draft.coverImage
                            : URL.createObjectURL(draft.coverImage)
                        }
                        alt="Cover Preview"
                        className="h-32 w-full rounded-md object-cover"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="absolute right-1 top-1"
                        onClick={() =>
                          setDraft((d) => ({
                            ...d,
                            coverImage: null,
                          }))
                        }
                      >
                        X
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="galleryImages">
                  รูปเพิ่มเติม ({draft.galleryImages.length}/6)
                </Label>

                <Input
                  id="galleryImages"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);

                    setDraft((d) => ({
                      ...d,
                      galleryImages: [
                        ...d.galleryImages,
                        ...files,
                      ].slice(0, 6),
                    }));
                  }}
                />
              </div>
              {draft.galleryImages.length > 0 && (
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {draft.galleryImages.map((item, index) => {
                    const isOldImage = item && typeof item === "object" && "image_url" in item;
                    const src = isOldImage
                      ? (item as BlogImage).image_url
                      : URL.createObjectURL(item as File);

                    return (
                      <div key={index} className="relative">
                        <img
                          src={src}
                          alt={`Gallery ${index}`}
                          className="h-32 w-full rounded-md object-cover"
                        />

                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute right-1 top-1"
                          onClick={() => {
                            setDraft((d) => ({
                              ...d,
                              galleryImages: d.galleryImages.filter((_, i) => i !== index),
                            }));
                          }}
                        >
                          X
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button">
                      {editingId ? "บันทึกการแก้ไข" : "เผยแพร่"}
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {editingId ? "ยืนยันการแก้ไขโพสต์" : "ยืนยันการเผยแพร่โพสต์"}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {editingId
                          ? "คุณแน่ใจหรือไม่ว่าต้องการบันทึกการเปลี่ยนแปลงนี้? ข้อมูลเดิมจะถูกเขียนทับและไฟล์ภาพที่ถูกลบจะหายไปจากระบบทันที"
                          : "คุณแน่ใจหรือไม่ว่าต้องการเผยแพร่โพสต์นี้ขึ้นสู่เว็บไซต์?"}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          handleSubmit(e);
                        }}
                        disabled={loading}
                        className="flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            กำลังดำเนินการ...
                          </>
                        ) : (
                          "ตกลง, ดำเนินการต่อ"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button type="button" variant="outline" onClick={closeForm}>
                  ยกเลิก
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )
      }

      {
        filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {query.trim()
              ? `ไม่พบบทความที่ตรงกับ "${query.trim()}"`
              : "ยังไม่มีบทความ"}
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {visible.map((post) => (
                <div
                  key={post.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-border p-4"
                >
                  <div className="min-w-0">
                    <h4 className="truncate font-medium">{post.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(post.created_at)} · {post.author}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button type="button" variant="ghost" size="icon">
                          {post.is_published === 'publish' ? (
                            <Globe className="h-4 w-4 text-green-600 " />
                          ) : (

                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {post.is_published === 'publish' ? "เปลี่ยนเป็นฉบับร่าง (Unpublish)" : "เผยแพร่ (Publish)"}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {post.is_published === 'publish'
                              ? "คุณแน่ใจหรือไม่ว่าต้องการหยุดเผยแพร่ Blog นี้ขึ้นสู่เว็บไซต์?"
                              : "คุณแน่ใจหรือไม่ว่าต้องการเผยแพร่ Blog นี้ขึ้นสู่เว็บไซต์?"}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleTogglePublish(post)}>
                            ตกลง, ดำเนินการต่อ
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {/* ปุ่มแก้ไข */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(post)}
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">แก้ไข</span>
                    </Button>

                    {/* ปุ่มลบ */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost"
                          size="icon">
                          <Trash2
                            className="h-4 w-4 text-destructive"
                            aria-hidden="true"
                          />
                          <span className="sr-only">ลบ</span>
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            ยืนยันการลบ blogs ที่เลือก
                          </AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(post)}>
                            ยืนยันการลบ
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>

            <PaginationBar
              page={currentPage}
              totalPages={totalPages}
              total={filtered.length}
              pageSize={ADMIN_PAGE_SIZE}
              unitLabel="บทความ"
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          </>
        )
      }
    </div >
  )
}
