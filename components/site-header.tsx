"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { PenLine, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBlog } from "@/components/blog-provider"

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

export function SiteHeader() {
  const { isAdmin, logout } = useBlog()

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex items-center gap-2">
          <PenLine className="h-5 w-5" aria-hidden="true" />
          <span className="font-heading text-lg font-semibold tracking-tight">
            The Blogs
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            variant="ghost"
            size="lg"
          >
            Blogs
          </Button>
          {isAdmin ? (
            <>
              <Button
                render={<Link href="/admin" />}
                nativeButton={false}
                variant="ghost"
                size="sm"
              >
                แดชบอร์ด
              </Button>
              {/* ปุ่ม Logout */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="gap-2 text-black hover:text-destructive hover:bg-destructive/10">
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">ออกจากระบบ</span>
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent className="sm:max-w-[700px] p-8">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-bold text-primary">ยืนยันการออกจากระบบ?</AlertDialogTitle>
                    <AlertDialogDescription className="text-lg pt-4">
                      คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter className="gap-3 sm:gap-4">
                    <AlertDialogCancel className="h-12 px-6 text-base">ยกเลิก</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => logout()}
                      className="h-12 px-8 text-base bg-primary font-bold shadow-md hover:translate-y-[-2px] transition-transform"
                    >
                      ยืนยันออกจากระบบ
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <Button
              render={<Link href="/login" />}
              nativeButton={false}
              variant="outline"
              size="sm"
            >
              เข้าสู่ระบบ
            </Button>
          )}
        </nav>

      </div>
    </header>
  )
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
