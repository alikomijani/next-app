import { use } from "react";
import { getComments } from "./api";

type Comment = {
  author: {
    userID: number;
    firstName: string;
    lastName: string;
  };
  postID: number;
  content: string;
};

export default function CommentsSection({
  commentsPromise,
}: {
  commentsPromise: Promise<{
    list: Comment[];
    count: number;
  }>;
}) {
  // اینجا await نداریم → use() خودش Promise را resolve می‌کند
  const data = use(commentsPromise);

  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-xl font-semibold mb-4">نظرات کاربران</h2>

      {data.list.length === 0 ? (
        <div className="text-gray-400">نظری ثبت نشده است.</div>
      ) : (
        <div className="space-y-4">
          {data.list.map((c: Comment, i: number) => (
            <div key={i} className="p-3 border rounded-lg">
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
