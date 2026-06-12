import {
  deactivateCategory,
  formatApiError,
  getCategory,
  updateCategory,
} from "@/backend/modules/catalog/service";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type CategoryRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, { params }: CategoryRouteContext) {
  try {
    const { id } = await params;
    const category = await getCategory(id);
    return NextResponse.json({ category });
  } catch (error: unknown) {
    const { status, message } = formatApiError(error, "Category get failed");
    return NextResponse.json({ message }, { status });
  }
}

export async function PATCH(req: NextRequest, { params }: CategoryRouteContext) {
  try {
    const { id } = await params;
    const category = await updateCategory(id, await req.json());
    return NextResponse.json({ category });
  } catch (error: unknown) {
    const { status, message } = formatApiError(error, "Category update failed");
    return NextResponse.json({ message }, { status });
  }
}

export async function PUT(req: NextRequest, ctx: CategoryRouteContext) {
  return PATCH(req, ctx);
}

export async function DELETE(
  _req: NextRequest,
  { params }: CategoryRouteContext,
) {
  try {
    const { id } = await params;
    const category = await deactivateCategory(id);
    return NextResponse.json({ category });
  } catch (error: unknown) {
    const { status, message } = formatApiError(
      error,
      "Category deactivate failed",
    );
    return NextResponse.json({ message }, { status });
  }
}
