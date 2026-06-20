"use client"

import { useMemo, useState } from "react"
import { Check, X, Undo2, Search } from "lucide-react"
import { toast } from "sonner"
import { useBlog, type Comment } from "@/components/blog-provider"
import { formatDate } from "@/components/site-header"
import { ADMIN_PAGE_SIZE, PaginationBar } from "@/components/pagination-bar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { apiService } from "@/services/api"
export function AdminComments() {
  const { comments, posts, setCommentStatus,initAppData } = useBlog()
  const [query, setQuery] = useState("")
  
  const postTitle = (postId: string) =>
    posts.find((p) => p.id === postId)?.title ?? "บทความที่ถูกลบ"

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return comments
    return comments.filter((c) =>
      postTitle(c.postId).toLowerCase().includes(q)
    )
  }, [comments, posts, query])

  const pending = filtered.filter((c) => c.status === "pending")
  const approved = filtered.filter((c) => c.status === "approved")
  const rejected = filtered.filter((c) => c.status === "rejected")

  async function approve(c: Comment) {
    setCommentStatus(c.id, "approved")
    await apiService.approvecomment(c.id, "approved")
    await initAppData()
    toast.success("อนุมัติความคิดเห็นแล้ว")
  }

  async function reject(c: Comment) {
    setCommentStatus(c.id, "rejected")
    await apiService.approvecomment(c.id, "rejected")
    await initAppData()
    toast.success("ปฏิเสธความคิดเห็นแล้ว")
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="relative w-full sm:max-w-xs">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาตามชื่อบทความ..."
          aria-label="ค้นหาความคิดเห็นตามชื่อบทความ"
          className="pl-9"
        />
      </div>

      <Section title="รออนุมัติ" items={pending} emptyText="ไม่มีความคิดเห็นที่รออนุมัติ">
        {(c) => (
          <CommentRow key={c.id} comment={c} postTitle={postTitle(c.postId)}>
            <Button size="sm" onClick={() => approve(c)}>
              <Check className="h-4 w-4" aria-hidden="true" />
              อนุมัติ
            </Button>
            <Button size="sm" variant="outline" onClick={() => reject(c)}>
              <X className="h-4 w-4" aria-hidden="true" />
              ปฏิเสธ
            </Button>
          </CommentRow>
        )}
      </Section>

      <Section
        title="อนุมัติแล้ว (แสดงในบล็อก)"
        items={approved}
        emptyText="ยังไม่มีความคิดเห็นที่อนุมัติ"
      >
        {(c) => (
          <CommentRow key={c.id} comment={c} postTitle={postTitle(c.postId)}>
            <Button size="sm" variant="outline" onClick={() => reject(c)}>
              <Undo2 className="h-4 w-4" aria-hidden="true" />
              ถอนการอนุมัติ
            </Button>
          </CommentRow>
        )}
      </Section>

      <Section title="ปฏิเสธแล้ว" items={rejected} emptyText="ไม่มีความคิดเห็นที่ถูกปฏิเสธ">
        {(c) => (
          <CommentRow key={c.id} comment={c} postTitle={postTitle(c.postId)}>
            <Button size="sm" onClick={() => approve(c)}>
              <Check className="h-4 w-4" aria-hidden="true" />
              อนุมัติแทน
            </Button>
          </CommentRow>
        )}
      </Section>
    </div>
  )
}

function Section({
  title,
  items,
  emptyText,
  children,
}: {
  title: string
  items: Comment[]
  emptyText: string
  children: (comment: Comment) => React.ReactNode
}) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(items.length / ADMIN_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * ADMIN_PAGE_SIZE
  const visible = items.slice(start, start + ADMIN_PAGE_SIZE)

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h3 className="font-heading text-lg font-semibold">{title}</h3>
        <Badge variant="secondary">{items.length}</Badge>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <>
          <div className="flex flex-col gap-3">{visible.map(children)}</div>
          <PaginationBar
            page={currentPage}
            totalPages={totalPages}
            total={items.length}
            pageSize={ADMIN_PAGE_SIZE}
            unitLabel="ความคิดเห็น"
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </>
      )}
    </section>
  )
}

function CommentRow({
  comment,
  postTitle,
  children,
}: {
  comment: Comment
  postTitle: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{comment.author}</span>
          <span className="text-xs text-muted-foreground">
            {formatDate(comment.createdAt)}
          </span>
        </div>
        <p className="mt-1 text-pretty leading-relaxed">{comment.body}</p>
        <p className="mt-1 text-xs text-muted-foreground">ความคิดเห็น: {postTitle}</p>
      </div>
      <div className="flex shrink-0 gap-2">{children}</div>
    </div>
  )
}
