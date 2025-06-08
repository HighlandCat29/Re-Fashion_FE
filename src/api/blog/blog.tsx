// src/api/blog/blog.tsx

import axios from "axios";

/** Generic API response wrapper */
interface ApiResponse<T> {
    code: number;
    message: string;
    result: T;
}

/** Backend blog post model (Swagger) */
interface ApiBlogPost {
    id: string;
    title: string;
    content: string;
    authorUsername: string;
    products: Array<{
        imageUrls: string[];
    }>;
    createdAt: string;
}

/** Frontend list-view model */
export interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    imageUrls: string[];
}

/** Frontend detail-view model */
export interface BlogPostDetail {
    id: string;
    title: string;
    content: string;
    authorUsername: string;
    imageUrls: string[];
    createdAt: string;
}

/** Payload for creating a new post */
export interface NewBlogPost {
    title: string;
    content: string;
    authorId: string;
    productIds: string[];
}

/** Fetches all blog posts (list view) */
export async function getBlogPosts(): Promise<BlogPost[]> {
    // Fetch the wrapped response
    const response = await axios.get<ApiResponse<ApiBlogPost[]>>("/api/blogs");
    const rawPosts = Array.isArray(response.data.result) ? response.data.result : [];

    // Map raw API posts into frontend-friendly objects
    const posts: BlogPost[] = rawPosts.map((post) => {
        const excerpt = post.content.length > 200
            ? post.content.slice(0, 200) + "…"
            : post.content;
        // flatten first 3 images from all products
        const imgs = post.products.flatMap((p) => p.imageUrls).slice(0, 3);
        while (imgs.length < 3) imgs.push(imgs[0] || "");
        return { id: post.id, title: post.title, excerpt, imageUrls: imgs };
    });

    return posts;
}

/** Fetches a single blog post by ID (detail view) */
export async function getBlogPostById(id: string): Promise<BlogPostDetail> {
    // Fetch the wrapped response
    const response = await axios.get<ApiResponse<ApiBlogPost>>(`/api/blogs/${id}`);
    const post = response.data.result;

    // flatten all images from associated products
    const imgs = post.products.flatMap((p) => p.imageUrls);

    const detail: BlogPostDetail = {
        id: post.id,
        title: post.title,
        content: post.content,
        authorUsername: post.authorUsername,
        imageUrls: imgs,
        createdAt: post.createdAt,
    };

    return detail;
}

/** Creates a new blog post on the server */
export async function createBlogPost(payload: NewBlogPost): Promise<BlogPostDetail> {
    const response = await axios.post<ApiResponse<ApiBlogPost>>("/api/blogs", payload);
    const post = response.data.result;

    const imgs = post.products.flatMap((p) => p.imageUrls);

    const detail: BlogPostDetail = {
        id: post.id,
        title: post.title,
        content: post.content,
        authorUsername: post.authorUsername,
        imageUrls: imgs,
        createdAt: post.createdAt,
    };

    return detail;
}
