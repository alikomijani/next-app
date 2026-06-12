import {
  createProduct,
  formatApiError,
  listProducts,
} from "@/backend/modules/catalog/service";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const result = await listProducts(req.nextUrl.searchParams);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const { status, message } = formatApiError(error, "Products list failed");
    return NextResponse.json({ message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const result = await createProduct(await req.json());
    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    const { status, message } = formatApiError(error, "Product create failed");
    return NextResponse.json({ message }, { status });
  }
}
