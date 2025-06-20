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
    <div className="bg-white rounded-lg p-6 mt-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Community Comments ({comments.length})
      </h3>

      {/* New comment form - only show if user is logged in */}
      {authUser ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-lg font-medium text-gray-600">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <textarea
                placeholder={`Commenting publicly as ${displayName}...`}
                className="w-full bg-gray-100 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50 transition"
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={posting}
                required
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-transparent text-black font-semibold rounded-md border border-black hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 transition"
                  disabled={posting || !content.trim()}
                >
                  {posting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="text-center py-4 border-y my-6">
          <p className="text-gray-600">
            <a
              href="/login"
              className="text-primary font-semibold hover:underline"
            >
              Log in
            </a>{" "}
            to join the discussion.
          </p>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 border-t">
          <p className="text-gray-500 mt-4">Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-6 border-t pt-6">
          {pagedComments.map((c) => (
            <div key={c.id} className="flex items-start space-x-4">
              <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-gray-600">
                  {c.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-baseline space-x-2">
                  <strong className="font-semibold text-gray-900">
                    {c.username}
                  </strong>
                  <span className="text-xs text-gray-500">
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
                <p className="mt-1 text-gray-700 whitespace-pre-wrap">
                  {c.content}
                </p>
                <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                  <button className="flex items-center space-x-1 hover:text-primary transition">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      ></path>
                    </svg>
                    <span>Reply</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition"
          >
            ‹ Prev
          </button>

          {leftDots && (
            <span className="px-2 text-gray-400 select-none">…</span>
          )}

          {pages.map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`px-3 py-1 rounded-md transition ${
                currentPage === p
                  ? "bg-black text-white font-semibold"
                  : "bg-white text-gray-700 hover:bg-gray-200"
              }`}
            >
              {p}
            </button>
          ))}

          {rightDots && (
            <span className="px-2 text-gray-400 select-none">…</span>
          )}

          <button
            onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
            disabled={currentPage === pageCount}
            className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition"
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
};
