import {
  createAccessToken,
  createRefreshToken,
  verifyToken,
} from "@/backend/lib/jwt";

export class UserController {
  hasher: HasherInterface;
  userModel: UserModelInterface;
  constructor(userModel: UserModelInterface, hasher: HasherInterface) {
    this.userModel = userModel;
    this.hasher = hasher;
  }
  async updateUser(data: CreateUserDto) {
    const existingUser = await this.userModel.getUserByEmail(data.email);
    if (!existingUser) {
      throw new Error("User not found!");
    }
    const user = await this.userModel.updateUser(existingUser.id, data);
    return toPublicUser(user);
  }
  async register(data: CreateUserDto) {
    const existingUser = await this.userModel.getUserByEmail(data.email);

    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await this.hasher.hash(data.password, 10);

    const user = await this.userModel.createUser({
      ...data,
      password: hashedPassword,
    });
    return toPublicUser(user);
  }
  async login(data: { email: string; password: string }) {
    const user = await this.userModel.getUserByEmail(data.email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValid = await this.hasher.compare(data.password, user.password);

    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    const accessToken = createAccessToken(user.id);
    const refreshToken = createRefreshToken(user.id);

    return { user: toPublicUser(user), accessToken, refreshToken };
  }
  async refreshToken(data: string | RefreshTokenDto) {
    const token =
      typeof data === "string" ? data : data.refreshToken ?? data.token;

    if (!token) {
      throw new Error("Refresh token is required");
    }

    const payload = verifyToken(token, "REFRESH");
    const user = await this.userModel.getUserByID(payload.userID);

    if (!user) {
      throw new Error("Invalid refresh token");
    }

    const accessToken = createAccessToken(user.id);
    const refreshToken = createRefreshToken(user.id);

    return { user: toPublicUser(user), accessToken, refreshToken };
  }
  async updateUserPassword(data: UpdateUserPasswordDto) {
    const currentPassword = data.currentPassword ?? data.oldPassword;

    if (!data.userID) {
      throw new Error("User id is required");
    }
    if (!currentPassword) {
      throw new Error("Current password is required");
    }
    if (!data.newPassword) {
      throw new Error("New password is required");
    }

    const user = await this.userModel.getUserByID(data.userID);

    if (!user) {
      throw new Error("User not found");
    }

    const isValid = await this.hasher.compare(currentPassword, user.password);

    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    const hashedPassword = await this.hasher.hash(data.newPassword, 10);
    const updatedUser = await this.userModel.updateUser(user.id, {
      password: hashedPassword,
    });

    return toPublicUser(updatedUser);
  }
  async updatePassword(data: UpdateUserPasswordDto) {
    return this.updateUserPassword(data);
  }
  async getUserProfile(userID: number) {
    const user = await this.userModel.getUserByID(userID);
    return user ? toPublicUser(user) : undefined;
  }
}

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

export interface HasherInterface {
  hash: (input: string, rounds: number) => Promise<string>;
  compare: (plain: string, hashed: string) => Promise<boolean>;
}

export interface UserModelInterface {
  getUserByEmail: (email: string) => Promise<undefined | User>;
  getUserByID: (userID: number) => Promise<undefined | User>;
  createUser: (user: CreateUserDto) => Promise<User>;
  updateUser: (id: number, newUserData: UpdateUserDto) => Promise<User>;
}

export type CreateUserDto = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type UpdateUserDto = Partial<CreateUserDto>;

export type RefreshTokenDto = {
  refreshToken?: string;
  token?: string;
};

export type UpdateUserPasswordDto = {
  userID: number;
  currentPassword?: string;
  oldPassword?: string;
  newPassword: string;
};

export type User = {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type PublicUser = Omit<User, "password">;
