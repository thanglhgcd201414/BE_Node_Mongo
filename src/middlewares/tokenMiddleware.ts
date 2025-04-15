import { Response, NextFunction, Request } from "express";
import tokenService from "../services/token/tokenService";
import { IUserDecoded } from "@/types/user";

const tokenMiddleware = {
  verifyToken: (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization;
    if (!token) {
      res.status(401).json({ message: "Token is required" });
      return;
    }

    const accessToken = token.split(" ")[1];

    const user = tokenService.verifyToken(accessToken) as IUserDecoded | null;
    if (!user) {
      res.status(403).json({ message: "Invalid token" });
      return;
    }

    req.user = user;
    next();
  },

  verifyTokenAdmin: (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization;
    if (!token) {
      res.status(401).json({ message: "Token is required" });
      return;
    }

    const accessToken = token.split(" ")[1];

    const user = tokenService.verifyToken(accessToken) as IUserDecoded | null;
    if (!user) {
      res.status(403).json({ message: "Invalid token" });
      return;
    }

    if (user.role !== "ADMIN") {
      res.status(403).json({
        message: "Unauthorized access for user (only admin)",
      });
      return;
    }

    req.user = user;
    next();
  },
};

export default tokenMiddleware;
