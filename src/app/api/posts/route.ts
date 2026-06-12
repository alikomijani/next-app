import newPostController from "@/backend/modules/posts/controllers/newPostController";
import { validationPaginationParams } from "@/shared/validation/validationParams";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? "1");
    const perPage = Number(searchParams.get("perPage") ?? "10");
    validationPaginationParams(page, perPage);
    const postController = await newPostController();
    const paginatedData = await postController.getPostList(page, perPage);
    return NextResponse.json(paginatedData);
  } catch (e) {
    return NextResponse.json(
      { message: (e as Error).message || "bad request" },
      { status: 400 },
    );
  }
}
