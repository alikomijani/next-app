import {
  createProductVariant,
  formatApiError,
  listProductVariants,
  upsertProductVariants,
} from "@/backend/modules/catalog/service";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ProductVariantsRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _req: NextRequest,
  { params }: ProductVariantsRouteContext,
) {
  try {
    const { id } = await params;
    const variants = await listProductVariants(id);
    return NextResponse.json({ variants });
  } catch (error: unknown) {
    const { status, message } = formatApiError(
      error,
      "Product variants list failed",
    );
    return NextResponse.json({ message }, { status });
  }
}

export async function POST(
  req: NextRequest,
  { params }: ProductVariantsRouteContext,
) {
  try {
    const { id } = await params;
    const variant = await createProductVariant(id, await req.json());
    return NextResponse.json({ variant }, { status: 201 });
  } catch (error: unknown) {
    const { status, message } = formatApiError(
      error,
      "Product variant create failed",
    );
    return NextResponse.json({ message }, { status });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: ProductVariantsRouteContext,
) {
  try {
    const { id } = await params;
    const variants = await upsertProductVariants(id, await req.json());
    return NextResponse.json({ variants });
  } catch (error: unknown) {
    const { status, message } = formatApiError(
      error,
      "Product variants update failed",
    );
    return NextResponse.json({ message }, { status });
  }
}

export async function PATCH(req: NextRequest, ctx: ProductVariantsRouteContext) {
  return PUT(req, ctx);
}
