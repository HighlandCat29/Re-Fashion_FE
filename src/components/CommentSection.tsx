// src/components/CommentSection.tsx
import React, { useEffect, useState } from "react";
import { useAppSelector } from "../hooks";
import { getUserById, UserResponse } from "../api/Users";
import {
    getCommentsByProduct,
    postComment,
    CommentDto,
} from "../api/comments";

type Props = { productId: string };

export const CommentSection: React.FC<Props> = ({ productId }) => {
    // 1) Minimal auth info from Redux (only has id + role)
    const authUser = useAppSelector((s) => s.auth.user)!;

    // 2) Local state for full profile
    const [profile, setProfile] = useState<UserResponse | null>(null);

    // 3) Fetch full profile so we can read profile.username
    useEffect(() => {
        getUserById(authUser.id)
            .then((u) => u && setProfile(u))
            .catch(console.error);
    }, [authUser.id]);

    // 4) Compute the display name from username
    const displayName = profile?.username ?? "Anonymous";

    // ───────────────────────────────────────────────────────────
    // Comments list & paging state
    const [comments, setComments] = useState<CommentDto[]>([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);

    const [page, setPage] = useState(1);
    const pageSize = 5;
    const pageCount = Math.ceil(comments.length / pageSize);
    const pagedComments = comments.slice(
        (page - 1) * pageSize,
        (page - 1) * pageSize + pageSize
    );

    // Load comments on mount / when productId changes
    useEffect(() => {
        setLoading(true);
        getCommentsByProduct(productId)
            .then((res) => setComments(res.data.result))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [productId]);

    // Handle posting a new comment
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setPosting(true);
        try {
            const res = await postComment(productId, authUser.id, content);
            setComments((prev) => [...prev, res.data.result]);
            setContent("");
            setPage(pageCount + 1); // jump to last page when new comment arrives
        } catch (err) {
            console.error(err);
        } finally {
            setPosting(false);
        }
    };

    return (
        <div className="mt-8 space-y-4">
            <h3 className="text-2xl font-semibold">Comments</h3>

            {/* ─── New comment form at top ────────────────────────── */}
            <form onSubmit={handleSubmit} className="space-y-2">
                <div className="text-sm text-gray-700">
                    Commenting as <strong>{displayName}</strong>
                </div>
                <textarea
                    placeholder="Write a comment…"
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={posting}
                    required
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                    disabled={posting}
                >
                    {posting ? "Posting…" : "Post Comment"}
                </button>
            </form>

            {/* ─── Paged comments list ───────────────────────────── */}
            {loading ? (
                <p>Loading comments…</p>
            ) : pagedComments.length === 0 ? (
                <p className="text-gray-600">No comments yet.</p>
            ) : (
                <ul className="space-y-4 max-h-96 ">
                    {pagedComments.map((c) => (
                        <li key={c.id} className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-500">
                                {new Date(c.createdAt).toLocaleString()} by{" "}
                                <strong>{c.username}</strong>
                            </div>
                            <p className="mt-1">{c.content}</p>
                        </li>
                    ))}
                </ul>
            )}

            {/* ─── Pagination controls ─────────────────────────────:**/}
            {pageCount > 1 && (
                <div className="flex justify-center space-x-2">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 rounded disabled:opacity-50"
                    >
                        ‹ Prev
                    </button>

                    {Array.from({ length: pageCount }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`px-3 py-1 rounded ${page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                        disabled={page === pageCount}
                        className="px-3 py-1 rounded disabled:opacity-50"
                    >
                        Next ›
                    </button>
                </div>
            )}
        </div>
    );
};
