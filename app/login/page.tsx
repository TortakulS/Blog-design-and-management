"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SiteHeader } from "@/components/site-header"
import { useBlog } from "@/components/blog-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function LoginPage() {
  const { login } = useBlog()
  const router = useRouter()
  const [username, setusername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      setError("");
      const response = await login(username, password);
      if (response && response.ok) {
        toast.success("เข้าสู่ระบบสำเร็จ");
        router.push("/admin");
      } else {
        let msg = "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";

        if (response?.status === 401) {
          msg = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
        }
        setError(msg);
      }
    } catch (err) {
      const fallbackMsg = "ไม่สามารถเชื่อมต่อกับระบบได้ กรุณาลองใหม่ภายหลัง";
      toast.error(fallbackMsg);
      setError(fallbackMsg);
    }finally {
      setIsLoading(false); 
    }
  };


  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto flex max-w-3xl items-center justify-center px-5 py-16">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">
              เข้าสู่ระบบผู้ดูแล
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="username">อีเมล</Label>
                <Input
                  id="username"
                  type="username"
                  value={username}
                  onChange={(e) => setusername(e.target.value)}
                  placeholder="adminblog"
                  autoComplete="username"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <Button
                type="submit"
                className="mt-2 w-full flex items-center justify-center gap-2"
                disabled={isLoading} // ป้องกันการกดซ้ำตอนกำลังโหลด
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    กำลังเข้าสู่ระบบ...
                  </>
                ) : (
                  "เข้าสู่ระบบ"
                )}
              </Button>
            </form>
            {error && (
              <p className="mt-4 rounded-md bg-muted p-3 text-xs leading-relaxed text-red-500">
                {error}
              </p>
            )}
            <p className="mt-4 rounded-md bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
              ทดลองใช้งาน: <strong>adminblogs</strong>/
              <strong>adminblogs</strong>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
