import mongoose, { Schema, Model } from "mongoose";
import {
  CreateUserDto,
  User,
  UserModelInterface,
} from "../controller/user.controller";

const AutoIncrementFactory = require("mongoose-sequence")(mongoose);

const AutoIncrement = AutoIncrementFactory(mongoose);

/* 1. User Schema مطابق همان type User */
const UserSchema = new Schema<User>({
  id: { type: Number, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
});

UserSchema.plugin(AutoIncrement, { inc_field: "id" });

/* 2. جلوگیری از دوباره ساختن مدل در هات‌ریلود */
const UserModel: Model<User> =
  mongoose.models.User || mongoose.model<User>("User", UserSchema);

/* 3. پیاده‌سازی UserModelInterface */
class UserModelMongo implements UserModelInterface {
  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email }).lean();
    return user ?? undefined;
  }

  async createUser(user: CreateUserDto): Promise<User> {
    const created = await UserModel.create(user);
    return created.toObject();
  }

  async updateUser(id: number, user: CreateUserDto): Promise<User> {
    const updated = await UserModel.findOneAndUpdate({ id: id }, user, {
      new: true,
    }).lean();

    if (!updated) {
      throw new Error("User not found");
    }

    return updated;
  }
  async getUserByID(userID: number): Promise<User | undefined> {
    const user = await UserModel.findOne({ id: userID });
    return user?.toObject();
  }
}

export default UserModelMongo;
