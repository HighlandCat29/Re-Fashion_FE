// src/api/productComments.ts
import axios from "axios";

/** One comment as returned by GET */
export interface ProductComment {
    id: string;
    content: string;
    username: string;
    productId: string;
    createdAt: string;   // ISO timestamp
}

/** What the POST endpoint expects */
export interface NewProductComment {
    productId: string;
    userId: string;
    content: string;
}

/** Your generic wrapper */
interface ApiResponse<T> {
    code: number;
    message: string;
    result: T;
}

/** Fetch all comments for a given productId */
export async function getProductComments(
    productId: string
): Promise<ProductComment[]> {
    const { data } = await axios.get<ApiResponse<ProductComment[]>>(
        `/product-comment-controller/getComments`,
        { params: { productId } }
    );
    return Array.isArray(data.result) ? data.result : [];
}

/** Add a new comment */
export async function addProductComment(
    payload: NewProductComment
): Promise<ProductComment> {
    const { data } = await axios.post<ApiResponse<ProductComment>>(
        `/product-comment-controller/addComment`,
        payload
    );
    return data.result;
}
