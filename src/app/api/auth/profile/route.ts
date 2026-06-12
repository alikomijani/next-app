import { getAccessToken } from "@/backend/lib/jwt";
import newUserController from "@/backend/modules/user/controller/newUserController";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const payload = getAccessToken(req);
    const userController = await newUserController();
    const user = userController.getUserProfile(payload.userID);
    if (!user) {
      return NextResponse.json({ message: "user not found" }, { status: 404 });
    }
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message || "invalid token" },
      { status: 401 },
    );
  }
}
