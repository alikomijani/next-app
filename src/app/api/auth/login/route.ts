import { NextResponse } from "next/server";
import newUserController from "@/backend/modules/user/controller/newUserController";
import { MAX_ACCESS_TOKEN_AGE, MAX_REFRESH_TOKEN_AGE } from "@/backend/lib/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userController = await newUserController();
    const { user, accessToken, refreshToken } =
      await userController.login(body);

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
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 401 });
  }
}
