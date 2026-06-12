"use client";

import { useEffect, useState } from "react";

type Comment = {
  author: {
    userID: number;
    firstName: string;
    lastName: string;
  };
  postID: number;
  content: string;
};

export default function CommentsSectionClient({ postID }: { postID: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("کاربر تستی");

  // load comments on mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/comments?postID=${postID}`);
      const data = await res.json();
      setComments(data.list);
      setLoading(false);
    }
    load();
  }, [postID]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newComment = {
      author: {
        userID: Math.floor(Math.random() * 10000),
        firstName: authorName,
        lastName: "",
      },
      postID,
      content,
    };

    await fetch("/api/comments", {
      method: "POST",
      body: JSON.stringify(newComment),
      headers: {
        "Content-Type": "application/json",
      },
    });

    setContent("");

    // Refresh comment list
    const res = await fetch(`/api/comments?postID=${postID}`);
    const data = await res.json();
    setComments(data.list);
  }

  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-xl font-semibold mb-4">نظرات کاربران</h2>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 space-y-3 p-4 border rounded-lg"
      >
        <input
          type="text"
          className="w-full border p-2 rounded"
          placeholder="نام شما"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
        />

        <textarea
          className="w-full border p-2 rounded"
          placeholder="متن کامنت..."
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          ارسال نظر
        </button>
      </form>

      {/* List */}
      {loading ? (
        <div className="text-gray-500">در حال بارگذاری...</div>
      ) : comments.length === 0 ? (
        <div className="text-gray-400">هنوز نظری ثبت نشده است.</div>
      ) : (
        <div className="space-y-4 ">
          {comments.map((c, i) => (
            <div key={i} className="p3 border rounded-lg p-4">
              <div className="font-medium">
                {c.author.firstName} {c.author.lastName}
              </div>
              <div className="text-gray-700 mt-1">{c.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
