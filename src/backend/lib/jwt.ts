import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export interface JwtPayload {
  userID: number;
  iat: number;
  exp: number;
}
export const MAX_ACCESS_TOKEN_AGE = 10 * 60;
export const MAX_REFRESH_TOKEN_AGE = 7 * 24 * 60 * 60;
export function createAccessToken(userID: number) {
  return jwt.sign({ userID }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: "10m",
  });
}

export function createRefreshToken(userID: number) {
  return jwt.sign({ userID }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "7d",
  });
}

export function verifyToken(
  token: string,
  type: "ACCESS" | "REFRESH",
): JwtPayload {
  const secret =
    type === "ACCESS"
      ? process.env.JWT_ACCESS_SECRET!
      : process.env.JWT_REFRESH_SECRET!;

  try {
    const decoded = jwt.verify(token, secret);

    if (isJwtPayload(decoded)) {
      return decoded;
    }

    throw new Error("Malformed token payload");
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "TokenExpiredError") {
      throw new Error("TokenExpired");
    }
    if (err instanceof Error && err.name === "JsonWebTokenError") {
      throw new Error("InvalidToken");
    }
    throw new Error("TokenVerificationFailed");
  }
}

function isJwtPayload(decoded: string | jwt.JwtPayload): decoded is JwtPayload {
  return (
    typeof decoded === "object" &&
    decoded !== null &&
    typeof decoded.userID === "number" &&
    typeof decoded.iat === "number" &&
    typeof decoded.exp === "number"
  );
}

export function getAccessToken(req: NextRequest) {
  const header = req.headers.get("authorization");
  const token = getBearerToken(header) ?? req.cookies.get("accessToken")?.value;

  if (!token) {
    throw new Error("Access token not found");
  }

  return verifyToken(token, "ACCESS");
}

function getBearerToken(header: string | null) {
  if (!header) {
    return undefined;
  }
  if (!header.startsWith("Bearer ")) {
    throw new Error("Authorization header must start with 'Bearer '");
  }

  const token = header.substring(7).trim();
  if (!token) {
    throw new Error("Bearer token is empty");
  }

  return token;
}
