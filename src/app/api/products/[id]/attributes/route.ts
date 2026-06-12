import {
  deleteProductAttributes,
  formatApiError,
  listProductAttributes,
  upsertProductAttributes,
} from "@/backend/modules/catalog/service";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ProductAttributesRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _req: NextRequest,
  { params }: ProductAttributesRouteContext,
) {
  try {
    const { id } = await params;
    const attributes = await listProductAttributes(id);
    return NextResponse.json({ attributes });
  } catch (error: unknown) {
    const { status, message } = formatApiError(
      error,
      "Product attributes list failed",
    );
    return NextResponse.json({ message }, { status });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: ProductAttributesRouteContext,
) {
  try {
    const { id } = await params;
    const attributes = await upsertProductAttributes(id, await req.json());
    return NextResponse.json({ attributes });
  } catch (error: unknown) {
    const { status, message } = formatApiError(
      error,
      "Product attributes update failed",
    );
    return NextResponse.json({ message }, { status });
  }
}

export async function PATCH(req: NextRequest, ctx: ProductAttributesRouteContext) {
  return PUT(req, ctx);
}

export async function DELETE(
  req: NextRequest,
  { params }: ProductAttributesRouteContext,
) {
  try {
    const { id } = await params;
    const attributes = await deleteProductAttributes(id, await req.json());
    return NextResponse.json({ attributes });
  } catch (error: unknown) {
    const { status, message } = formatApiError(
      error,
      "Product attributes delete failed",
    );
    return NextResponse.json({ message }, { status });
  }
}
