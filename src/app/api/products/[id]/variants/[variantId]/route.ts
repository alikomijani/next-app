import {
  deleteProductVariant,
  formatApiError,
  updateProductVariant,
} from "@/backend/modules/catalog/service";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ProductVariantRouteContext = {
  params: Promise<{ id: string; variantId: string }>;
};

export async function PATCH(
  req: NextRequest,
  { params }: ProductVariantRouteContext,
) {
  try {
    const { id, variantId } = await params;
    const variant = await updateProductVariant(id, variantId, await req.json());
    return NextResponse.json({ variant });
  } catch (error: unknown) {
    const { status, message } = formatApiError(
      error,
      "Product variant update failed",
    );
    return NextResponse.json({ message }, { status });
  }
}

export async function PUT(req: NextRequest, ctx: ProductVariantRouteContext) {
  return PATCH(req, ctx);
}

export async function DELETE(
  _req: NextRequest,
  { params }: ProductVariantRouteContext,
) {
  try {
    const { id, variantId } = await params;
    const variant = await deleteProductVariant(id, variantId);
    return NextResponse.json({ variant });
  } catch (error: unknown) {
    const { status, message } = formatApiError(
      error,
      "Product variant delete failed",
    );
    return NextResponse.json({ message }, { status });
  }
}
