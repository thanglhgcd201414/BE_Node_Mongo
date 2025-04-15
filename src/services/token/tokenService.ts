import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import { IUserDecoded } from "@/types/user";

const privateKey = fs.readFileSync(path.join(__dirname, "private.pem"), "utf8");
const publicKey = fs.readFileSync(path.join(__dirname, "public.pem"), "utf8");

const tokenService = {
  generateToken(user: any): string {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      privateKey,
      {
        expiresIn: "1d",
        algorithm: "RS256",
      }
    );
  },

  verifyToken(accessToken: string): IUserDecoded | null {
    try {
      const decoded = jwt.verify(accessToken, publicKey) as IUserDecoded;
      return decoded;
    } catch (err) {
      return null;
    }
  },
};

export default tokenService;
