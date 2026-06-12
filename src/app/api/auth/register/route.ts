import { NextResponse } from "next/server";
import newUserController from "@/backend/modules/user/controller/newUserController";
export async function POST(req: Request) {
  try {
    // اطلاعات رو از رکوئست بگیر
    const body = await req.json();

    // کنترلر رو میسازه و بهش میگه تو حالت ماک هستی
    const userController = await newUserController();

    // اینجا فانکشن رجیستر کاربر فراخوانی میشه
    const user = await userController.register(body);

    // اینجا نتیجه نهایی در ریسپانس به کاربر ارسال میشه
    return NextResponse.json(user);
  } catch (error: any) {
    // اگه خطا داشتیم متن خطا با کد ۴۰۰ ارسال بشه
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
