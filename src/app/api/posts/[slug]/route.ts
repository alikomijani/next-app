import newPostController from "@/backend/modules/posts/controllers/newPostController";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const params = context.params;
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json(
        { message: "slug parameter is required" },
        { status: 400 },
      );
    }

    const postController = await newPostController();
    const post = await postController.getPostBySlug(slug);

    if (!post) {
      return NextResponse.json({ message: "post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (e) {
    return NextResponse.json(
      { message: (e as Error).message || "bad request" },
      { status: 500 },
    );
  }
}
