import React, { useEffect, useState } from "react";
import { useAppSelector } from "../hooks";
import { getCommentsByProduct, postComment, CommentDto } from "../api/comments";

export const CommentSection: React.FC<{ productId: string }> = ({ productId }) => {
    const authUser = useAppSelector((s) => s.auth.user)!;
    const userId = authUser.id;

    const [comments, setComments] = useState<CommentDto[]>([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        setLoading(true);
        getCommentsByProduct(productId)
            .then((res) => setComments(res.data.result))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [productId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setPosting(true);
        try {
            const res = await postComment(productId, userId, content);
            setComments((prev) => [...prev, res.data.result]);
            setContent("");
        } catch (err) {
            console.error(err);
        } finally {
            setPosting(false);
        }
    };

    return (
        <div className="mt-8 border-t pt-6">
            <h3 className="text-2xl font-semibold mb-4">Comments</h3>

            {loading ? (
                <p>Loading comments…</p>
            ) : comments.length === 0 ? (
                <p className="text-gray-600">No comments yet. Be the first!</p>
            ) : (
                <ul className="space-y-4">
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
                    Commenting as <strong>{authUser.name} {authUser.lastname}</strong>
                </div>
                <textarea
                    placeholder="Write a comment…"
                    className="w-full border rounded px-3 py-2"
                    rows={4}
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
        </div>
    );
};
