import { getAccessToken } from "@/backend/lib/jwt";
import newUserController from "@/backend/modules/user/controller/newUserController";
import { NextRequest, NextResponse } from "next/server";

type UpdatePasswordBody = {
  currentPassword?: unknown;
  oldPassword?: unknown;
  newPassword?: unknown;
};

export async function PATCH(req: NextRequest) {
  return updatePassword(req);
}

export async function PUT(req: NextRequest) {
  return updatePassword(req);
}

async function updatePassword(req: NextRequest) {
  try {
    const payload = getAccessToken(req);
    const body = await readBody(req);
    const currentPassword =
      getStringValue(body.currentPassword) ?? getStringValue(body.oldPassword);
    const newPassword = getStringValue(body.newPassword);

    const userController = await newUserController();
    const user = await userController.updateUserPassword({
      userID: payload.userID,
      currentPassword,
      newPassword: newPassword ?? "",
    });

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Password update failed";
    return NextResponse.json({ message }, { status: getErrorStatus(message) });
  }
}

async function readBody(req: Request): Promise<UpdatePasswordBody> {
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return {};
  }

  try {
    const body = (await req.json()) as UpdatePasswordBody;
    return body && typeof body === "object" ? body : {};
  } catch {
    return {};
  }
}

function getStringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getErrorStatus(message: string) {
  if (message.includes("required")) {
    return 400;
  }
  if (message === "User not found") {
    return 404;
  }
  return 401;
}
