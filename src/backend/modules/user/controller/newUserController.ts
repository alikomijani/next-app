import { UserController } from "./user.controller";
import { modelFactories, ModelType } from "../model/modelFactory";
import Bcrypt from "@/backend/lib/bycript";

export default async function newUserController() {
  const modelType = (process.env.DATABASE_MODE as ModelType) || "MOCK";
  const factory = modelFactories[modelType];

  const model = await factory.createModel();
  const hasher = new Bcrypt();

  return new UserController(model, hasher);
}
