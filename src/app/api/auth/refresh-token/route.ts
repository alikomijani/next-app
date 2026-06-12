import { MAX_ACCESS_TOKEN_AGE, MAX_REFRESH_TOKEN_AGE } from "@/backend/lib/jwt";
import newUserController from "@/backend/modules/user/controller/newUserController";
import { NextRequest, NextResponse } from "next/server";

type RefreshTokenBody = {
  refreshToken?: unknown;
  token?: unknown;
};

export async function POST(req: NextRequest) {
  try {
    const body = await readBody(req);
    const bodyToken =
      getStringValue(body.refreshToken) ?? getStringValue(body.token);
    const cookieToken = req.cookies.get("refreshToken")?.value;
    const token = bodyToken ?? cookieToken;

    const userController = await newUserController();
    const { user, accessToken, refreshToken } =
      await userController.refreshToken({ refreshToken: token });

    const response = NextResponse.json({ user, accessToken, refreshToken });

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_ACCESS_TOKEN_AGE,
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_REFRESH_TOKEN_AGE,
    });

    return response;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Invalid refresh token";
    return NextResponse.json({ message }, { status: 401 });
  }
}

async function readBody(req: Request): Promise<RefreshTokenBody> {
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return {};
  }

  try {
    const body = (await req.json()) as RefreshTokenBody;
    return body && typeof body === "object" ? body : {};
  } catch {
    return {};
  }
}

function getStringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
