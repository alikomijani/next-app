import bcrypt from "bcrypt";

import { HasherInterface } from "../modules/user/controller/user.controller";

export default class Bcrypt implements HasherInterface {
  compare(plain: string, hashed: string) {
    return bcrypt.compare(plain, hashed);
  }
  hash(input: string, rounds: number) {
    return bcrypt.hash(input, rounds);
  }
}
