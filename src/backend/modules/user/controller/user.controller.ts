// user.controller.ts

import { createAccessToken, createRefreshToken } from "@/backend/lib/jwt";

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
    return user;
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
    const { password, ...restUserData } = user;
    return restUserData;
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

    const { password, ...restUserData } = user;
    return { user: restUserData, accessToken, refreshToken };
  }
  async getUserProfile(userID: number) {
    const user = this.userModel.getUserByID(userID);
    return user;
  }
}

export interface HasherInterface {
  hash: (input: string, rounds: number) => Promise<string>;
  compare: (plain: string, hashed: string) => Promise<boolean>;
}

export interface UserModelInterface {
  getUserByEmail: (email: string) => Promise<undefined | User>;
  getUserByID: (userID: number) => Promise<undefined | User>;
  createUser: (user: CreateUserDto) => Promise<User>;
  updateUser: (id: number, newUserData: CreateUserDto) => Promise<User>;
}

export type CreateUserDto = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type User = {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};
