import { BaseErrorResponse, BaseSuccessResponse } from "@/config/baseResponse";
import { IUser, User } from "@/db/models/user";
import bcrypt from "bcrypt";
import cartService from "../cartService";
import { logger } from "@/server";
import tokenService from "../token/tokenService";

const authService = {
  async register(
    userDto: any
  ): Promise<BaseErrorResponse | BaseSuccessResponse<any>> {
    try {
      const existingUser = await User.findOne({ email: userDto.email }).lean();
      if (existingUser) {
        return new BaseErrorResponse({ message: "Email already exists" });
      }

      const newUser = new User(userDto) as IUser & { _id: string };
      await newUser.save();
      await cartService.createCart(newUser._id.toString());

      const userObject = newUser.toObject();
      delete userObject.password;

      return new BaseSuccessResponse({
        data: userObject,
        message: "User registered successfully",
      });
    } catch (error: any) {
      logger.error(`Registration error: ${error.message}`);
      throw new BaseErrorResponse({ message: "Internal Server Error" });
    }
  },

  async login(
    userDto: any
  ): Promise<BaseErrorResponse | BaseSuccessResponse<any>> {
    try {
      const user = await User.findOne({ email: userDto.email })
        .select("+password")
        .lean();
      if (!user) {
        throw new BaseErrorResponse({ message: "Không tìm thấy tài khoản" });
      }

      const isValidPassword = await bcrypt.compare(
        userDto.password,
        user.password
      );
      if (!isValidPassword) {
        return new BaseErrorResponse({ message: "Password incorrect" });
      }

      const accessToken = tokenService.generateToken(user);
      const { password, ...dataRes } = user;

      return new BaseSuccessResponse({
        data: { user: dataRes, accessToken },
        message: "User logged in successfully",
      });
    } catch (error: any) {
      logger.error(`Login error: ${error.message}`);
      throw new BaseErrorResponse({ message: "Internal Server Error" });
    }
  },

  async checkUserExists(email: string) {
    try {
      const existingUser = await User.findOne({ email }).lean();
      if (existingUser) {
        return true;
      }

      return false;
    } catch (error: any) {
      logger.error(`Login error: ${error.message}`);
      throw new BaseErrorResponse({ message: "Internal Server Error" });
    }
  },

  async comparePassword(
    password: string,
    hashPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashPassword);
  },
};

export default authService;
