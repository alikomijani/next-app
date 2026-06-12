import {
  createCategory,
  formatApiError,
  listCategories,
} from "@/backend/modules/catalog/service";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const result = await listCategories(req.nextUrl.searchParams);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const { status, message } = formatApiError(error, "Categories list failed");
    return NextResponse.json({ message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const category = await createCategory(await req.json());
    return NextResponse.json({ category }, { status: 201 });
  } catch (error: unknown) {
    const { status, message } = formatApiError(error, "Category create failed");
    return NextResponse.json({ message }, { status });
  }
}
