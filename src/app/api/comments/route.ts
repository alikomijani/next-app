// app/api/comments/route.ts
import { NextResponse } from "next/server";

type Comment = {
  author: {
    userID: number;
    firstName: string;
    lastName: string;
  };
  postID: number;
  content: string;
};

// Mock data (10 comments)
let comments: Comment[] = [
  {
    author: { userID: 1, firstName: "علی", lastName: "کریمی" },
    postID: 1,
    content: "پست خیلی جالبی بود، ممنون!",
  },
  {
    author: { userID: 2, firstName: "مریم", lastName: "قاسمی" },
    postID: 1,
    content: "خیلی خوب توضیح دادید.",
  },
  {
    author: { userID: 3, firstName: "رضا", lastName: "حسینی" },
    postID: 2,
    content: "به نظرم نیاز به توضیح بیشتر دارد.",
  },
  {
    author: { userID: 4, firstName: "نرگس", lastName: "پوری" },
    postID: 2,
    content: "عالی بود، لذت بردم!",
  },
  {
    author: { userID: 5, firstName: "حمید", lastName: "سجادی" },
    postID: 3,
    content: "ممنون بابت اشتراک‌گذاری.",
  },
  {
    author: { userID: 6, firstName: "مهسا", lastName: "پاکدل" },
    postID: 3,
    content: "خوشم اومد از سبک نوشتارت.",
  },
  {
    author: { userID: 7, firstName: "کیوان", lastName: "نعمتی" },
    postID: 3,
    content: "جالب بود اما کوتاه.",
  },
  {
    author: { userID: 8, firstName: "زهرا", lastName: "صفری" },
    postID: 4,
    content: "خیلی حرفه‌ای نوشته شده!",
  },
  {
    author: { userID: 9, firstName: "فرهاد", lastName: "رحیمی" },
    postID: 4,
    content: "مطلب جدید یاد گرفتم.",
  },
  {
    author: { userID: 10, firstName: "شادی", lastName: "گلستان" },
    postID: 2,
    content: "ادامه این موضوع رو هم بنویسید لطفا.",
  },
];

// GET → list comments (filter by postID ?)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const postID = searchParams.get("postID");

  let list = comments;

  if (postID) {
    const id = Number(postID);
    list = comments.filter((c) => c.postID === id);
  }

  return NextResponse.json({
    count: list.length,
    list,
  });
}

// POST → create a new comment
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newComment: Comment = {
      author: {
        userID: body.author?.userID ?? 0,
        firstName: body.author?.firstName ?? "",
        lastName: body.author?.lastName ?? "",
      },
      postID: Number(body.postID),
      content: body.content ?? "",
    };

    comments.push(newComment);

    return NextResponse.json(
      {
        message: "comment created",
        comment: newComment,
      },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
}
