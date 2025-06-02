import { useState } from "react";
import {
  FaUserCircle,
  FaHeart,
  FaComment,
  FaBookmark,
  FaShare,
} from "react-icons/fa";
import { Comment } from "../components/Comment";
import ProductPreview from "../components/ProductPreview";

const NewsPage = () => {
  // State for comments
  const [comments, setComments] = useState([
    {
      name: "Courtney Henry",
      text: "Love it! Super sleek modern dollar visuals. Was frugal view also look at sometimes. Amazon classic choice. 🔥🔥",
      time: "12h",
      likes: 0,
      comments: 0,
    },
    {
      name: "Renett Richards",
      text: "Warm feeling product! Image parius cum ea fallback markit.",
      time: "8h",
      likes: 0,
      comments: 0,
    },
    {
      name: "Theresa Webb",
      text: "Does well on red Target shirt vibes. Also extended images vibe. Nice size again! graphics convey well.",
      time: "2h",
      likes: 0,
      comments: 0,
    },
  ]);
  const [newComment, setNewComment] = useState("");

  // State for post reactions
  const [postReactions, setPostReactions] = useState({
    likes: 0,
    comments: 0,
    bookmarks: 0,
    shares: 0,
  });

  // Handle comment submission
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      const newCommentObj = {
        name: "Current User",
        text: newComment,
        time: "Just now",
        likes: 0,
        comments: 0,
      };
      setComments([niche, ...comments]);
      setPostReactions((prev) => ({ ...prev, comments: prev.comments + 1 }));
      setNewComment("");
    }
  };

  // Handle post reactions
  const handlePostReaction = (type) => {
    setPostReactions((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
  };

  // Handle comment reactions
  const handleCommentReaction = (index, type) => {
    setComments((prev) =>
      prev.map((comment, i) =>
        i === index ? { ...comment, [type]: comment[type] + 1 } : comment
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <main className="max-w-screen-2xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left: Product Preview */}
        <ProductPreview />

        {/* Right: News/Post Section */}
        <section className="bg-white shadow-md rounded-lg p-6 space-y-4">
          {/* Author Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaUserCircle className="text-3xl" />
              <div>
                <h2 className="font-semibold text-lg">Nguyen Van A</h2>
              </div>
            </div>
            <span className="text-sm text-gray-500">2 days ago</span>
          </div>

          {/* Post Content */}
          <p className="text-gray-700 text-base">
            Experience ultimate comfort with our Men's Wool Sweater, crafted
            from 100% Merino Wool for a soft, breathable, and moisture-wicking
            feel. Designed for versatility, this must-have piece is the perfect
            fit for layering in colder weather or wearing solo for a stylish
            statement. The lightweight warmth and seamless stitching offer
            limitless possibilities.
          </p>

          <p className="text-gray-700 text-base">
            Featuring a classic crew neck design, ribbed cuffs, and relaxed fit,
            this sweater seamlessly blends elegance with practicality. Whether
            you're heading into the office or creating a weekend adventure, this
            piece provides the warmth and durability you need.
          </p>

          {/* Post Action Icons with Counts */}
          <div className="flex items-center gap-6 mt-4 text-xl text-gray-600">
            <div className="flex items-center gap-2">
              <FaHeart
                className="hover:text-red-500 cursor-pointer"
                onClick={() => handlePostReaction("likes")}
              />
              <span className="text-sm">{postReactions.likes}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaComment className="hover:text-blue-500 cursor-pointer" />
              <span className="text-sm">{postReactions.comments}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaBookmark
                className="hover:text-yellow-500 cursor-pointer"
                onClick={() => handlePostReaction("bookmarks")}
              />
              <span className="text-sm">{postReactions.bookmarks}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaShare
                className="hover:text-green-500 cursor-pointer"
                onClick={() => handlePostReaction("shares")}
              />
              <span className="text-sm">{postReactions.shares}</span>
            </div>
          </div>

          {/* Comment Input */}
          <div className="pt-4 border-t">
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Post
              </button>
            </form>
          </div>

          {/* Comments */}
          <div className="pt-4 space-y-4">
            {comments.map((comment, index) => (
              <div key={index} className="border-b pb-2">
                <Comment
                  name={comment.name}
                  text={comment.text}
                  time={comment.time}
                />
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <FaHeart
                      className="hover:text-red-500 cursor-pointer"
                      onClick={() => handleCommentReaction(index, "likes")}
                    />
                    <span>{comment.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaComment
                      className="hover:text-blue-500 cursor-pointer"
                      onClick={() => handleCommentReaction(index, "comments")}
                    />
                    <span>{comment.comments}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-right pt-2 text-sm text-gray-400 underline cursor-pointer">
            See more
          </div>
        </section>
      </main>
    </div>
  );
};

export default NewsPage;
