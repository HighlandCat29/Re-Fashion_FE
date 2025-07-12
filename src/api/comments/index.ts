import customFetch from "../../axios/custom";

export interface CommentDto {
    id: string;
    content: string;
    username: string;
    createdAt: string;
    likeCount: number;
    replies: CommentDto[];  // 🔥 fix type here
}




interface Envelope<T> {
    code: number;
    message: string | null;
    result: T;
}

/** GET  /api/comments/{productId} */
export const getCommentsByProduct = (productId: string) =>
    customFetch.get<Envelope<CommentDto[]>>(`/comments/${productId}`);

export const postComment = (
    productId: string,
    userId: string,
    content: string,
    parentCommentId?: string
) =>
    customFetch.post<Envelope<CommentDto>>("/comments", {
        productId,
        userId,
        content,
        parentCommentId,  // will be `undefined` if not a reply, totally fine
    });


/** POST /comments/like */
export const likeComment = (commentId: string, userId: string) =>
    customFetch.post<Envelope<CommentDto>>("/comments/like", {
        commentId,
        userId,
    });

/** POST /comments/unlike */
export const unlikeComment = (commentId: string, userId: string) =>
    customFetch.post<Envelope<CommentDto>>("/comments/unlike", {
        commentId,
        userId,
    });

