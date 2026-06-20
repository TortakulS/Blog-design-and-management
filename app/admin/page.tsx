"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { useBlog } from "@/components/blog-provider"
import { AdminPosts } from "@/components/admin-posts"
import { AdminComments } from "@/components/admin-comments"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminPage() {
  const { isAdmin, isAuthLoading, comments } = useBlog()
  const router = useRouter()

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAdmin) {
      router.replace("/login");
    }
  }, [isAdmin, isAuthLoading, router])


  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>กำลังตรวจสอบสิทธิ์การเข้าใช้งาน...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-12">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          แดชบอร์ดผู้ดูแล
        </h1>

        <Tabs defaultValue="posts" className="mt-8">
          <TabsList>
            <TabsTrigger value="posts">บทความ</TabsTrigger>
            <TabsTrigger value="comments">
              ความคิดเห็น
            </TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="mt-6">
            <AdminPosts />
          </TabsContent>
          <TabsContent value="comments" className="mt-6">
            <AdminComments />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
