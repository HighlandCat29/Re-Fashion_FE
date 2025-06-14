import customFetch from "../../axios/custom";

export interface CommentDto {
    id: string;
    content: string;
    username: string;   // ← matches Swagger
    productId: string;
    createdAt: string;
}

interface Envelope<T> {
    code: number;
    message: string | null;
    result: T;
}

/** GET  /api/comments/{productId} */
export const getCommentsByProduct = (productId: string) =>
    customFetch.get<Envelope<CommentDto[]>>(`/comments/${productId}`);

/** POST /api/comments */
export const postComment = (
    productId: string,
    userId: string,
    content: string
) =>
    customFetch.post<Envelope<CommentDto>>("/comments", {
        productId,
        userId,
        content,
    });
