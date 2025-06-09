// src/components/CommentsSection.tsx
import React, { useState, useEffect, FormEvent } from "react";
import {
    getProductComments,
    addProductComment,
    ProductComment,
    NewProductComment,
} from "../api/comments/comments";
import { useAppSelector } from "../hooks";
import toast from "react-hot-toast";

interface Props {
    productId: string;
}

const CommentsSection: React.FC<Props> = ({ productId }) => {
    const [comments, setComments] = useState<ProductComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newContent, setNewContent] = useState("");

    // pull the logged-in userId from your store
    const userId = useAppSelector((s) => s.auth.user?.id);

    useEffect(() => {
        (async () => {
            try {
                const list = await getProductComments(productId);
                setComments(list);
            } catch (err) {
                console.error(err);
                toast.error("Could not load comments");
            } finally {
                setLoading(false);
            }
        })();
    }, [productId]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!newContent.trim()) return;
        if (!userId) {
            toast.error("Please log in to comment");
            return;
        }

        setSubmitting(true);
        const payload: NewProductComment = {
            productId,
            userId,
            content: newContent.trim(),
        };

        try {
            const created = await addProductComment(payload);
            setComments((prev) => [...prev, created]);
            setNewContent("");
        } catch (err) {
            console.error(err);
            toast.error("Failed to post comment");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="max-w-screen-lg mx-auto mt-12 px-5">
            <h3 className="text-2xl font-semibold mb-4">
                Comments <span className="text-blue-600">({comments.length})</span>
            </h3>

            {loading ? (
                <p className="text-gray-600">Loading comments…</p>
            ) : comments.length === 0 ? (
                <p className="text-gray-600">No comments yet.</p>
            ) : (
                <ul className="space-y-6">
                    {comments.map((c) => (
                        <li key={c.id} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex justify-between mb-2">
                                <span className="font-semibold">{c.username}</span>
                                <span className="text-sm text-gray-500">
                                    {new Date(c.createdAt).toLocaleString()}
                                </span>
                            </div>
                            <p className="text-gray-800">{c.content}</p>
                        </li>
                    ))}
                </ul>
            )}

            <form onSubmit={handleSubmit} className="mt-6">
                <textarea
                    className="w-full border rounded-lg p-3 focus:outline-none focus:ring"
                    rows={4}
                    placeholder="Write your comment…"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    disabled={submitting}
                />
                <button
                    type="submit"
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    disabled={submitting}
                >
                    {submitting ? "Posting…" : "Post Comment"}
                </button>
            </form>
        </section>
    );
};

export default CommentsSection;
