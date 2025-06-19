// src/components/BlogSection.tsx

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
// Adjusted import path to match file structure
import { getBlogPosts, BlogPost } from "../api/blog/blog";

/**
 * Renders a preview grid of recent blog posts (News This Week).
 * Displays a 3-image collage plus title/excerpt per post.
 */
const BlogSection: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getBlogPosts();
        setPosts(data);
      } catch (err) {
        console.error("Error loading blog posts", err);
        toast.error("Failed to load blog posts");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section>
      {/* Heading with count */}
      <div className="max-w-screen-2xl mx-auto mt-24 px-5 max-[400px]:px-3">
        <h2 className="text-black text-5xl font-normal tracking-[1.56px] max-sm:text-4xl">
          News This Week <span className="text-black">({posts.length})</span>
        </h2>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-600">Loading posts…</div>
      ) : (
        <div className="max-w-screen-2xl mx-auto px-5 mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {posts.map((post) => (
            <Link key={post.id} to={`/post/${post.id}`} className="group block">
              {/* 3-image collage: large + two thumbs */}
              <div className="grid grid-cols-3 grid-rows-2 gap-2 h-80">
                {post.imageUrls.map((url: string, idx: number) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`${post.title} image ${idx + 1}`}
                    className={
                      idx === 0
                        ? "row-span-2 col-span-1 w-full h-full object-cover rounded-lg"
                        : "col-span-1 row-span-1 w-full h-full object-cover rounded-lg"
                    }
                  />
                ))}
              </div>
              {/* Title & excerpt */}
              <div className="mt-4 p-6 border border-gray-300 rounded-lg group-hover:border-blue-600 transition">
                <h3 className="text-xl font-semibold text-gray-800">
                  {post.title}
                </h3>
                <p className="mt-2 text-gray-600 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default BlogSection;
