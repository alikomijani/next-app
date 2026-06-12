import {
  createBrand,
  formatApiError,
  listBrands,
} from "@/backend/modules/catalog/service";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const result = await listBrands(req.nextUrl.searchParams);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const { status, message } = formatApiError(error, "Brands list failed");
    return NextResponse.json({ message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const brand = await createBrand(await req.json());
    return NextResponse.json({ brand }, { status: 201 });
  } catch (error: unknown) {
    const { status, message } = formatApiError(error, "Brand create failed");
    return NextResponse.json({ message }, { status });
  }
}
