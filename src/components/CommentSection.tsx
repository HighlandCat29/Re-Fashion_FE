// src/components/CommentSection.tsx
import React, { useEffect, useState } from "react";
import { useAppSelector } from "../hooks";

// 1️⃣ Import your Users API
import { getUserById, UserResponse } from "../api/Users";
// 2️⃣ Import your Comments API
import {
    getCommentsByProduct,
    postComment,
    CommentDto,
} from "../api/comments";

type Props = { productId: string };

export const CommentSection: React.FC<Props> = ({ productId }) => {
    // a) Grab only the minimal auth object from Redux
    const authUser = useAppSelector((s) => s.auth.user)!;

    // b) Local state to hold the full UserResponse
    const [profile, setProfile] = useState<UserResponse | null>(null);

    // c) Fetch the full profile once we know authUser.id
    useEffect(() => {
        if (!authUser?.id) return;
        getUserById(authUser.id)
            .then((data) => {
                if (data) setProfile(data);
            })
            .catch((err) => {
                console.error("Failed to load user profile", err);
            });
    }, [authUser.id]);

    // d) Compute the display name
    const displayName =
        profile?.username ?? profile?.fullName ?? "Anonymous";

    // Comments state
    const [comments, setComments] = useState<CommentDto[]>([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Load existing comments
    useEffect(() => {
        setLoading(true);
        getCommentsByProduct(productId)
            .then((res) => setComments(res.data.result))
            .catch((err) => console.error("Load comments failed", err))
            .finally(() => setLoading(false));
    }, [productId]);

    // Post a new comment
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setSubmitting(true);
        try {
            const res = await postComment(productId, authUser.id, content);
            setComments((prev) => [...prev, res.data.result]);
            setContent("");
        } catch (err) {
            console.error("Post comment failed", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mt-8 border-t pt-6 bg-black bg-opacity-20 p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4">Comments</h3>

            {loading ? (
                <p>Loading comments…</p>
            ) : comments.length === 0 ? (
                <p className="text-gray-600">No comments yet. Be the first!</p>
            ) : (
                <ul className="space-y-6">
                    {comments.map((c) => (
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

            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
                <div className="text-sm text-gray-700">
                    Commenting as <strong>{displayName}</strong>
                </div>

                <textarea
                    placeholder="Write a comment…"
                    className="w-full border rounded px-3 py-2"
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={submitting}
                    required
                />

                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                    disabled={submitting}
                >
                    {submitting ? "Posting…" : "Post Comment"}
                </button>
            </form>
        </div>
    );
};
