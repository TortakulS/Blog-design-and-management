"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react"

export type CommentStatus = "pending" | "approved" | "rejected"

export type Comment = {
  id: string
  postId: string
  author: string
  body: string
  status: CommentStatus
  createdAt: string
}

export interface BlogImage {
  id: string;
  blog_id: string;
  image_url: string;
}

export interface Post {
  id: string;
  title: string;
  author: string;
  slug: string;
  dscription: string;
  content: string;
  cover_image: string;
  views_count: number;
  is_published: string;
  created_at: string;
  blogImages: BlogImage[];
}

type BlogContextValue = {
  posts: Post[]
  comments: Comment[]
  isAdmin: boolean
  isAuthLoading: boolean
  login: (username: string, password: string) => Promise<Response>
  logout: () => void
  getPostBySlug: (slug: string) => Post | undefined
  createPost: (data: Omit<Post, "id" | "slug" | "createdAt">) => void
  updatePost: (id: string, data: Partial<Omit<Post, "id">>) => void
  deletePost: (id: string) => void
  publishedPost: (id: string) => void
  addComment: (postId: string, author: string, body: string) => void
  setCommentStatus: (id: string, status: CommentStatus) => void
  approvedCommentsFor: (postId: string) => Comment[]
  initAppData: () => void
  isLoading: boolean
}

const BlogContext = createContext<BlogContextValue | null>(null)

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9ก-๙\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60)
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}
import { apiService } from "@/services/api"
export function BlogProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const initAppData = async () => {
    try {
      const authResponse = await apiService.checkAuthStatus();
      const currentIsAdmin = authResponse.ok;
      setIsLoading(true)
      setIsAdmin(currentIsAdmin);

      const [fetchedPosts, fetchedComments] = await Promise.all([
        apiService.getAllPosts(currentIsAdmin),
        apiService.getAllComments()
      ]);

      setPosts(fetchedPosts);
      setComments(fetchedComments);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAuthLoading(false);
      setIsLoading(false)
    }
  };

  useEffect(() => {
    initAppData();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await apiService.adminLogin({ username, password });
      if (response.ok) {
        setIsAdmin(true);
      }
      return response;
    } catch (error) {
      console.error("Login Error in Provider:", error);
      throw error;
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      const response = await apiService.adminLogout();
      if (response.ok) {
        setIsAdmin(false);
      }
      return response
    } catch (e) {
      throw e;
    }
  }, [])

  const getPostBySlug = useCallback(
    (slug: string) => {
      const decodedSlug = decodeURIComponent(slug);

      return posts.find((p) => p.slug === decodedSlug);
    },
    [posts]
  );

  const createPost = useCallback(
    (data: Omit<Post, "id" | "slug" | "createdAt">) => {
      setPosts((prev) => [
        {
          ...data,
          id: uid(),
          slug: `${slugify(data.title)}-${uid().slice(0, 4)}`,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ])
    },


    [],
  )

  const updatePost = useCallback(
    (id: string, data: Partial<Omit<Post, "id">>) => {
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...data } : p)),
      ),
        initAppData()
    },
    [],
  )

  const deletePost = useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id))
    setComments((prev) => prev.filter((c) => c.postId !== id))
  }, [])

  const publishedPost = useCallback((id: string) => {

  }, [])



  const addComment = useCallback(
    (postId: string, author: string, body: string) => {
      setComments((prev) => [
        ...prev,
        {
          id: uid(),
          postId,
          author: author.trim() || "ผู้อ่านนิรนาม",
          body: body.trim(),
          status: "pending",
          createdAt: new Date().toISOString(),
        },
      ])
    },
    [],
  )

  const setCommentStatus = useCallback(
    (id: string, status: CommentStatus) => {
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c)),
      )
    },
    [],
  )

  const approvedCommentsFor = useCallback(
    (postId: string) =>
      comments.filter((c) => c.postId === postId && c.status === "approved"),
    [comments],
  )

  const value = useMemo(
    () => ({
      posts,
      comments,
      isAdmin,
      login,
      logout,
      isAuthLoading,
      getPostBySlug,
      createPost,
      updatePost,
      deletePost,
      addComment,
      setCommentStatus,
      approvedCommentsFor,
      initAppData,
      publishedPost,
      isLoading
    }),
    [
      posts,
      comments,
      isAdmin,
      login,
      logout,
      isAuthLoading,
      getPostBySlug,
      createPost,
      updatePost,
      deletePost,
      addComment,
      setCommentStatus,
      approvedCommentsFor,
      initAppData,
      publishedPost,
      isLoading
    ],
  )

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>
}

export function useBlog() {
  const ctx = useContext(BlogContext)
  if (!ctx) throw new Error("useBlog must be used within BlogProvider")
  return ctx
}
