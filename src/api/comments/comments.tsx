// src/api/productComments.ts

import customFetch from "../../axios/custom";   // ← same customFetch you use elsewhere
import { toast } from "react-hot-toast";

/** One comment returned by GET /comments/{productId} */
export interface CommentDto {
    id: string;
    content: string;
    username: string;
    productId: string;
    createdAt: string;
}

/** Payload for POST /comments */
export interface NewProductComment {
    productId: string;
    userId: string;
    content: string;
}

/** Wraps your API’s { code, message, result } */
interface ApiResponse<T> {
    code: number;
    message: string;
    result: T;
}

/** GET all comments for a product */
export const getProductComments = async (
    productId: string
): Promise<CommentDto[] | null> => {
    try {
        const response = await customFetch.get<ApiResponse<CommentDto[]>>(
            `/comments/${productId}`
        );
        return response.data.result;
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        toast.error("Failed to load comments: " + msg);
        return null;
    }
};

/** POST a new comment */
export const addProductComment = async (
    payload: NewProductComment
): Promise<CommentDto | null> => {
    try {
        const response = await customFetch.post<ApiResponse<CommentDto>>(
            `/comments`,
            payload
        );
        return response.data.result;
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        toast.error("Failed to post comment: " + msg);
        return null;
    }
};
