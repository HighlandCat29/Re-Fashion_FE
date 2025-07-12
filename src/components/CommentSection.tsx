import React, { useEffect, useState } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useAppSelector } from "../hooks";
import {
  getCommentsByProduct,
  postComment,
  likeComment,
  unlikeComment,
  CommentDto,
} from "../api/comments";
import { getUserById, UserResponse } from "../api/Users";

type Props = { productId: string };

export const CommentSection: React.FC<Props> = ({ productId }) => {
  const authUser = useAppSelector((s) => s.auth.user);
  const [profile, setProfile] = useState<UserResponse | null>(null);

  const displayName = profile?.username ?? "Anonymous";

  const [comments, setComments] = useState<CommentDto[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (authUser?.id) {
      getUserById(authUser.id)
        .then((u) => u && setProfile(u))
        .catch(console.error);
    }
  }, [authUser?.id]);

  useEffect(() => {
    setLoading(true);
    getCommentsByProduct(productId)
      .then((res) => {
        setComments(res.data.result);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !authUser?.id) return;
    setPosting(true);
    try {
      const res = await postComment(productId, authUser.id, content);
      setComments((prev) => [res.data.result, ...prev]);
      setContent("");
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (commentId: string) => {
    if (!authUser?.id) return;
    const alreadyLiked = likedComments.has(commentId);
    try {
      if (alreadyLiked) {
        await unlikeComment(commentId, authUser.id);
        setLikedComments((prev) => {
          const newSet = new Set(prev);
          newSet.delete(commentId);
          return new Set(newSet);
        });
      } else {
        await likeComment(commentId, authUser.id);
        setLikedComments((prev) => new Set([...prev, commentId]));
      }
      // Optional: update counts (would usually be from backend)
    } catch (err) {
      console.error(err);
    }
  };

  const toggleReply = (commentId: string) => {
    setReplyTo((prev) => (prev === commentId ? null : commentId));
  };

  const handleReplySubmit = async (
    e: React.FormEvent,
    parentCommentId: string
  ) => {
    e.preventDefault();
    if (!replyContent.trim() || !authUser?.id) return;
    try {
      const res = await postComment(
        productId,
        authUser.id,
        replyContent,
        parentCommentId
      );
      // Insert the new reply under its parent
      setComments((prev) => addReplyToTree(prev, parentCommentId, res.data.result));
      setReplyTo(null);
      setReplyContent("");
    } catch (err) {
      console.error(err);
    }
  };

  const addReplyToTree = (
    comments: CommentDto[],
    parentId: string,
    newReply: CommentDto
  ): CommentDto[] => {
    return comments.map((c) => {
      if (c.id === parentId) {
        return { ...c, replies: [newReply, ...c.replies] };
      } else if (c.replies && c.replies.length > 0) {
        return { ...c, replies: addReplyToTree(c.replies, parentId, newReply) };
      }
      return c;
    });
  };

  const renderComments = (comments: CommentDto[], level = 0) => {
    return comments.map((c) => {
      const isCurrentUserComment = profile && c.username === profile.username;
      const avatar = isCurrentUserComment ? profile.profilePicture : null;
      const name = c.username;

      return (
        <div key={c.id} className={`mt-4 ${level > 0 ? "ml-6 border-l pl-4" : ""}`}>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-medium text-gray-600">
                  {name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline space-x-2">
                <strong className="font-semibold text-gray-900">{name}</strong>
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
              <div className="mt-2 flex items-center text-sm space-x-4">
                <button
                  className={`flex items-center space-x-1 font-medium transition-transform duration-150 ${likedComments.has(c.id)
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-black"
                    }`}
                  onClick={() => toggleLike(c.id)}
                >
                  <span>Like</span>
                  <span>{c.likeCount}</span>
                </button>
                <button
                  className="flex items-center space-x-1 text-gray-500 hover:text-primary transition"
                  onClick={() => toggleReply(c.id)}
                >
                  💬 Reply
                </button>
              </div>
              {replyTo === c.id && (
                <form
                  onSubmit={(e) => handleReplySubmit(e, c.id)}
                  className="mt-2"
                >
                  <textarea
                    className="w-full bg-gray-100 rounded-md p-2"
                    rows={2}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    required
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      className="px-3 py-1 bg-black text-white rounded-md"
                    >
                      Reply
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
          {/* Recursively render replies */}
          {c.replies && c.replies.length > 0 && renderComments(c.replies, level + 1)}
        </div>
      );
    });
  };

  return (
    <div className="bg-white rounded-lg p-6 mt-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Community Comments
      </h3>

      {authUser ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {profile?.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-medium text-gray-600">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <textarea
                placeholder={`Commenting publicly as ${displayName}...`}
                className="w-full bg-gray-100 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black transition"
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={posting}
                required
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-transparent text-black font-semibold rounded-md border border-black hover:bg-gray-100 transition"
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

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 border-t">
          <p className="text-gray-500 mt-4">Be the first to comment!</p>
        </div>
      ) : (
        <div className="border-t pt-6">{renderComments(comments)}</div>
      )}
    </div>
  );
};
