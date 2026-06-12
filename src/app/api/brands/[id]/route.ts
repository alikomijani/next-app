import {
  deactivateBrand,
  formatApiError,
  getBrand,
  updateBrand,
} from "@/backend/modules/catalog/service";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type BrandRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, { params }: BrandRouteContext) {
  try {
    const { id } = await params;
    const brand = await getBrand(id);
    return NextResponse.json({ brand });
  } catch (error: unknown) {
    const { status, message } = formatApiError(error, "Brand get failed");
    return NextResponse.json({ message }, { status });
  }
}

export async function PATCH(req: NextRequest, { params }: BrandRouteContext) {
  try {
    const { id } = await params;
    const brand = await updateBrand(id, await req.json());
    return NextResponse.json({ brand });
  } catch (error: unknown) {
    const { status, message } = formatApiError(error, "Brand update failed");
    return NextResponse.json({ message }, { status });
  }
}

export async function PUT(req: NextRequest, ctx: BrandRouteContext) {
  return PATCH(req, ctx);
}

export async function DELETE(_req: NextRequest, { params }: BrandRouteContext) {
  try {
    const { id } = await params;
    const brand = await deactivateBrand(id);
    return NextResponse.json({ brand });
  } catch (error: unknown) {
    const { status, message } = formatApiError(
      error,
      "Brand deactivate failed",
    );
    return NextResponse.json({ message }, { status });
  }
}
