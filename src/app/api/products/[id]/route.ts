import {
  deactivateProduct,
  formatApiError,
  getProduct,
  updateProduct,
} from "@/backend/modules/catalog/service";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ProductRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, { params }: ProductRouteContext) {
  try {
    const { id } = await params;
    const result = await getProduct(id);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const { status, message } = formatApiError(error, "Product get failed");
    return NextResponse.json({ message }, { status });
  }
}

export async function PATCH(req: NextRequest, { params }: ProductRouteContext) {
  try {
    const { id } = await params;
    const product = await updateProduct(id, await req.json());
    return NextResponse.json({ product });
  } catch (error: unknown) {
    const { status, message } = formatApiError(error, "Product update failed");
    return NextResponse.json({ message }, { status });
  }
}

export async function PUT(req: NextRequest, ctx: ProductRouteContext) {
  return PATCH(req, ctx);
}

export async function DELETE(
  _req: NextRequest,
  { params }: ProductRouteContext,
) {
  try {
    const { id } = await params;
    const product = await deactivateProduct(id);
    return NextResponse.json({ product });
  } catch (error: unknown) {
    const { status, message } = formatApiError(
      error,
      "Product deactivate failed",
    );
    return NextResponse.json({ message }, { status });
  }
}
