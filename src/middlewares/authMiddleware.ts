import { Request, Response, NextFunction } from "express";
import authService from "../services/auth/authService";
import { StatusCodes } from "http-status-codes";

const authMiddleware = {
  checkUserExist: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email } = req.body;

      const rs = await authService.checkUserExists(email);

      if (rs) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Tài khoản đã tồn tại" });
        return;
      }

      next();
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json(error);
      } else {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "Internal Server Error" });
      }
    }
  },
};

export default authMiddleware;
