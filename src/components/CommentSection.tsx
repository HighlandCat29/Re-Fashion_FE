// src/components/CommentSection.tsx
import React, { useEffect, useState, useMemo } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useAppSelector } from "../hooks";
import { getUserById, UserResponse } from "../api/Users";
import { getCommentsByProduct, postComment, CommentDto } from "../api/comments";

type Props = { productId: string };

export const CommentSection: React.FC<Props> = ({ productId }) => {
  // ─── Auth & profile ─────────────────────────────────
  const authUser = useAppSelector((s) => s.auth.user);
  const [profile, setProfile] = useState<UserResponse | null>(null);

  useEffect(() => {
    if (authUser?.id) {
      getUserById(authUser.id)
        .then((u) => u && setProfile(u))
        .catch(console.error);
    }
  }, [authUser?.id]);

  const displayName = profile?.username ?? "Anonymous";

  // ─── Comments state ────────────────────────────────
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  // ─── Pagination state ─────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const pageCount = Math.ceil(comments.length / pageSize);

  // Load & sort newest-first
  useEffect(() => {
    setLoading(true);
    getCommentsByProduct(productId)
      .then((res) =>
        setComments(
          [...res.data.result].sort(
            (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
          )
        )
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId]);

  // Build the sliding window of pages
  const { pages, leftDots, rightDots } = useMemo(() => {
    const total = pageCount;
    const current = currentPage;
    const windowSize = 5;
    // calculate start/end for window
    let start = current - Math.floor(windowSize / 2);
    if (start < 1) start = 1;
    let end = start + windowSize - 1;
    if (end > total) {
      end = total;
      start = Math.max(1, end - windowSize + 1);
    }
    // helper to build array
    const range = (s: number, e: number) =>
      Array.from({ length: e - s + 1 }, (_, i) => s + i);
    return {
      pages: range(start, end),
      leftDots: start > 1,
      rightDots: end < total,
    };
  }, [pageCount, currentPage]);

  // Slice comments for current page
  const pagedComments = comments.slice(
    (currentPage - 1) * pageSize,
    (currentPage - 1) * pageSize + pageSize
  );

  // ─── Submit handler ────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !authUser?.id) return;
    setPosting(true);
    try {
      const res = await postComment(productId, authUser.id, content);

      // override createdAt so we get "just now"
      const fresh: CommentDto = {
        ...res.data.result,
        createdAt: new Date().toISOString(),
      };

      setComments((prev) => [fresh, ...prev]);
      setCurrentPage(1);
      setContent("");
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="mt-8 space-y-4 border-t pt-6 bg-black bg-opacity-20 p-6 rounded-lg">
      <h3 className="text-2xl font-semibold text-black">Comments</h3>

      {/* New comment form - only show if user is logged in */}
      {authUser ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="text-sm text-gray-900">
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
      ) : (
        <div className="text-sm text-gray-700">
          Please{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            log in
          </a>{" "}
          to leave a comment.
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <p className="text-gray-100">Loading comments…</p>
      ) : pagedComments.length === 0 ? (
        <p className="text-gray-100">No comments yet.</p>
      ) : (
        <ul className="space-y-4">
          {pagedComments.map((c) => (
            <li key={c.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-4">
                {/* ─── Avatar ────────────────────────────── */}
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {c.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* ─── Comment body ───────────────────────── */}
                <div className="flex-1">
                  {/* Username · time ago */}
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <strong className="text-gray-900">{c.username}</strong>
                  </div>

                  {/* The comment text */}
                  <p className="mt-1 text-gray-800">{c.content}</p>

                  {/* Like · Reply */}
                  <div className="mt-2 flex items-center text-xs text-gray-500 space-x-1">
                    <button className="hover:underline">Like</button>
                    <span>·</span>
                    <button className="hover:underline">Reply</button>
                    <span>·</span>
                    <span>
                      {formatDistanceToNow(
                        parseISO(
                          c.createdAt.endsWith("Z")
                            ? c.createdAt
                            : `${c.createdAt}Z`
                        ),
                        { addSuffix: true }
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded disabled:opacity-50 text-gray-100"
          >
            ‹
          </button>

          {leftDots && (
            <span className="px-2 text-gray-100 select-none">…</span>
          )}

          {pages.map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`px-3 py-1 rounded ${
                currentPage === p ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {p}
            </button>
          ))}

          {rightDots && (
            <span className="px-2 text-gray-100 select-none">…</span>
          )}

          <button
            onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
            disabled={currentPage === pageCount}
            className="px-2 py-1 rounded disabled:opacity-50 text-gray-100"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};
