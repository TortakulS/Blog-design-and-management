"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { SiteHeader, formatDate } from "@/components/site-header"
import { useBlog } from "@/components/blog-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 30]

export default function HomePage() {
  const { posts, isAdmin,isLoading } = useBlog()
  const [query, setQuery] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let result = posts
    if (isAdmin) {
      result = posts.filter((p) => p.is_published === 'publish')
    }
    const q = query.trim().toLowerCase()
    if (!q) return result
    
    return result.filter((p) => p.title.toLowerCase().includes(q))
  }, [posts, query,isAdmin])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const visible = filtered.slice(start, start + pageSize)

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-12">
        <div className="mb-8">
          <h1 className="font-heading text-balance text-4xl font-semibold tracking-tight">
            BLOGS
          </h1>
        </div>

        {/* Search + page size controls */}
        <div className="mb-2 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
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

          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-sm text-muted-foreground">
              Pagination
            </span>
            <div className="flex items-center gap-1">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <Button
                  key={size}
                  variant={pageSize === size ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setPageSize(size)
                    setPage(1)
                  }}
                  aria-pressed={pageSize === size}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-24 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
            {/* คุณสามารถใช้ไอคอนหมุนๆ หรือทำเป็นโครงร่าง Skeleton สวยๆ ตรงนี้ได้ */}
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        ) : filtered.length === 0 ? (
          // 3. ถ้าโหลดเสร็จแล้ว และไม่มีข้อมูลจริงๆ ค่อยแสดงข้อความนี้
          <p className="py-12 text-center text-muted-foreground">
            {query.trim()
              ? `ไม่พบบทความที่ตรงกับ "${query.trim()}"`
              : "ยังไม่มีบทความในขณะนี้"}
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-6">
              {visible.map((post) => (
                <article
                  key={post.id}
                  className="flex flex-col md:flex-row overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md items-stretch"
                >
                  <div className="relative aspect-video w-full md:w-72 md:h-auto shrink-0 overflow-hidden">
                    <Image
                      src={post.cover_image ? post.cover_image : "/placeholder-img.jpg"}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6 justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {formatDate(post.created_at)} · {post.author}
                      </p>

                      <h2 className="font-heading text-xl font-semibold tracking-tight line-clamp-2 mb-2">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="transition-colors hover:text-muted-foreground"
                        >
                          {post.title}
                        </Link>
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed text-pretty line-clamp-2 mb-4">
                        {post.dscription}
                      </p>
                    </div>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex w-fit items-center gap-1 text-sm font-medium hover:underline"
                    >
                      อ่านต่อ
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
              <p className="text-sm text-muted-foreground">
                {start + 1}–{Math.min(start + pageSize, filtered.length)} จาก{" "}
                {filtered.length} บทความ
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  ก่อนหน้า
                </Button>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  ถัดไป
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
