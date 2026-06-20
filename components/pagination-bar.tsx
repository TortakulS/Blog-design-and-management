"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export const ADMIN_PAGE_SIZE = 10

export function PaginationBar({
  page,
  totalPages,
  total,
  pageSize,
  unitLabel,
  onPrev,
  onNext,
}: {
  page: number
  totalPages: number
  total: number
  pageSize: number
  unitLabel: string
  onPrev: () => void
  onNext: () => void
}) {
  if (total === 0) return null
  const start = (page - 1) * pageSize

  return (
    <div className="mt-2 flex items-center justify-between border-t border-border pt-4">
      <p className="text-sm text-muted-foreground">
        {start + 1}–{Math.min(start + pageSize, total)} จาก {total} {unitLabel}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={onPrev}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          ก่อนหน้า
        </Button>
        <span className="text-sm tabular-nums text-muted-foreground">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={onNext}
        >
          ถัดไป
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
