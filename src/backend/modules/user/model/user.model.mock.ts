// user.model.ts
import {
  UserModelInterface,
  User,
  CreateUserDto,
} from "../controller/user.controller";

const users: User[] = [];
let id = 1;
class UserModelMock implements UserModelInterface {
  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = users.find((u) => u.email === email);
    return user;
  }

  async createUser(user: CreateUserDto): Promise<User> {
    const newUser = { ...user, id: id++ };

    users.push(newUser);
    return newUser;
  }

  async updateUser(id: number, updatedUserData: CreateUserDto): Promise<User> {
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
      throw new Error("User not found");
    }
    const oldUser = users[index];
    const updatedUser = { ...oldUser, ...updatedUserData };
    users[index] = updatedUser;
    return updatedUser;
  }
  async getUserByID(userID: number): Promise<User | undefined> {
    const user = users.find((u) => u.id === userID);
    return user;
  }
}

export default UserModelMock;
