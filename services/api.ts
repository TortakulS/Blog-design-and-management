export interface AdminLoginRequest {
  username: string;
  password: string;
}

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


type Post = {
  id: string
  title: string
  author: string
  slug: string
  dscription: string
  content: string
  cover_image: string
  views_count: number
  is_published: string
  created_at: string
  blogImages: BlogImage[]
}

import { apiFetch } from "@/lib/api";

function generateSlug(text: string) {
  return text
    .toString()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

class ApiService {
  // Admin API methods
  async adminLogin(credentials: AdminLoginRequest) {
    const response = await apiFetch(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      }
    );
    return response
  }
  async adminLogout() {
    const response = await apiFetch(
      "/auth/logout",
      {
        method: "POST",
      }
    );
    return response
  }

  async checkAuthStatus() {
    const response = await apiFetch(
      "/auth/status",
      {
        method: "GET",
        credentials: "include",
      }
    );
    return response;
  }
  async view(slug: string) {
    try {
      const response = await apiFetch(`/posts/view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ slug })
      });

      if (!response.ok) {
        throw new Error("ไม่สามารถเพิ่มยอดวิวได้");
      }

      return await response.json();
    } catch (error) {
      console.error("apiService.view Error:", error);
      throw error;
    }
  }


  async createPost(draft: Draft) {
    const { title, author, excerpt, body, slug, coverImage, galleryImages } = draft;

    const finalSlug = (slug && slug.trim() !== "")
      ? generateSlug(slug)
      : generateSlug(title);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("author", author);
      formData.append("excerpt", excerpt);
      formData.append("body", body);
      formData.append("slug", finalSlug);
      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      if (galleryImages && galleryImages.length > 0) {
        galleryImages.forEach((item) => {
          if (item instanceof File) {
            formData.append("galleryImages", item);
          }
        });
      }

      const response = await fetch("/api/posts/create", {
        method: "POST",
        credentials: "include",
        body: formData
      });

      return response;

    } catch (e) {
      throw e;
    }
  }

  async updatePost(postId: string, draft: Draft) {
    try {
      const formData = new FormData();

      formData.append("postId", postId);
      formData.append("title", draft.title);
      formData.append("author", draft.author);
      formData.append("dscription", draft.excerpt);
      formData.append("content", draft.body);
      formData.append("slug", draft.slug);

      if (draft.coverImage instanceof File) {
        formData.append("coverImage", draft.coverImage);
      } else if (typeof draft.coverImage === "string") {
        formData.append("coverImageUrl", draft.coverImage);
      }

      draft.galleryImages.forEach((item) => {
        if (item instanceof File) {
          formData.append("galleryImages", item);
        }
      });
      const remainImageIds = draft.galleryImages
        .filter((item) => !(item instanceof File))
        .map((item) => (item as BlogImage).id);
      formData.append("remainImageIds", JSON.stringify(remainImageIds));

      const response = await fetch(`/api/posts/updates`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "ไม่สามารถอัปเดตโพสต์ได้");
      }

      return await response.json();
    } catch (error) {
      console.error("apiService Error:", error);
      throw error;
    }
  }

  async addcomment(blogId: string, author: string, body: string) {
    try {
      const response = await fetch("/api/comments/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blog_id: blogId,
          author: author,
          body: body,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "ไม่สามารถเพิ่มความคิดเห็นได้");
      }

      return await response.json();
    } catch (error) {
      console.error("apiService Error:", error);
      throw error;
    }
  }

  async approvecomment(cID: string, status: string) {
    try {
      const response = await fetch("/api/comments/status", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ cID, status }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "ไม่สามารถอนุมัติความคิดเห็นได้");
      }
      const data = await response.json();
      return data;

    } catch (error) {
      console.error("apiService Error:", error);
      throw error;
    }
  }

  async getAllPosts(isAdmin:boolean): Promise<Post[]> {
    const response = await apiFetch("/posts/allposts", {
      method: "POST",
      body: JSON.stringify({ isAdmin }),
    });
    const data = await response.json();
    return data.post;
  }

  async PublishPost(id: string, status: string) {
    const response = await apiFetch("/posts/PublishPost", {
      method: "PUT",
      credentials: "include",
      body: JSON.stringify({ id, status }),
    });

    return await response.json();
  }

  async deletePost(id: string) {
    const response = await apiFetch("/posts/deletePost", {
      method: "PUT",
      credentials: "include",
      body: JSON.stringify({ id }),
    });

    return await response.json();
  }


  async getAllComments() {
    const response = await apiFetch("/comments/allcomments", {
      method: "GET",
    });

    return response.json();
  }
}

export const apiService = new ApiService();
