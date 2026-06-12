import { Post } from "@/backend/modules/posts/controllers/post.controller";
import CommentsSection from "./CommentsSectionServer";
import { Suspense } from "react";
import { getComments } from "./api";

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  // Next.js 16: params → Promise
  const { slug } = await props.params;

  // fetch post
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/posts/${slug}`,
    {
      cache: "force-cache",
    },
  );

  if (!res.ok) {
    return (
      <div className="p-10 text-red-600 text-center">
        خطا در دریافت اطلاعات پست
      </div>
    );
  }

  const post: Post = await res.json();
  const commentsPromise = getComments(post.id);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">{post.title}</h1>

      <div className="text-gray-500 text-sm">
        نویسنده: {post.author.firstName} {post.author.lastName}
      </div>

      <div className="prose prose-lg leading-8">{post.content}</div>

      <div className="text-gray-400 text-xs mt-8">
        تاریخ ایجاد: {new Date(post.createdAt).toLocaleDateString("fa-IR")}
      </div>
      {/* بخش کامنت‌ها */}
      <Suspense
        fallback={
          <div className="text-gray-500">در حال بارگذاری کامنت‌ها...</div>
        }
      >
        <CommentsSection commentsPromise={commentsPromise} />
      </Suspense>
    </div>
  );
}
