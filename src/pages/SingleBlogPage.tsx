// src/pages/SingleBlogPage.tsx

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getBlogPostById, BlogPostDetail } from "../api/blog/blog";
import toast from "react-hot-toast";

const SingleBlogPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<BlogPostDetail | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const data = await getBlogPostById(id);
                setPost(data);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load blog post");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading || !post) {
        return <div className="py-16 text-center">Loading...</div>;
    }

    const { title, content, authorUsername, imageUrls, createdAt } = post;
    const prev = () => setCurrentIndex((ix) => (ix - 1 + imageUrls.length) % imageUrls.length);
    const next = () => setCurrentIndex((ix) => (ix + 1) % imageUrls.length);

    return (
        <div className="max-w-screen-2xl mx-auto mt-24 px-5 flex flex-col lg:flex-row gap-8">
            {/* Image carousel */}
            <div className="relative w-full lg:w-1/2">
                <img
                    src={imageUrls[currentIndex]}
                    alt={`${title} ${currentIndex + 1}`}
                    className="w-full h-[400px] object-cover rounded-lg"
                />
                <button
                    onClick={prev}
                    className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow"
                >
                    ‹
                </button>
                <button
                    onClick={next}
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow"
                >
                    ›
                </button>
                <div className="mt-4 flex space-x-2">
                    {imageUrls.map((url, idx) => (
                        <img
                            key={idx}
                            src={url}
                            alt={`${title} thumb ${idx + 1}`}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 ${idx === currentIndex ? "border-blue-600" : "border-transparent"
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Content panel */}
            <div className="w-full lg:w-1/2 border border-gray-300 rounded-lg p-6">
                <header className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {/* User icon placeholder */}
                            <span className="text-xl">👤</span>
                        </div>
                        <span className="font-semibold">{authorUsername}</span>
                    </div>
                    <span className="text-gray-500">
                        {new Date(createdAt).toLocaleDateString()}
                    </span>
                </header>
                <h1 className="text-2xl font-bold mb-4">{title}</h1>
                <div className="prose max-w-none">
                    {content.split("\n").map((line, idx) => (
                        <p key={idx}>{line}</p>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SingleBlogPage;
