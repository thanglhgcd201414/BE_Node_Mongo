import { logger } from "@/server";
import authService from "@/services/auth/authService";
import tokenService from "@/services/token/tokenService";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const authController = {
  login: async (req: Request, res: Response): Promise<any> => {
    try {
      const { email, password }: { email: string; password: string } = req.body;
      const rs = await authService.login({ email, password });
      return res.status(rs.statusCode).json(rs);
    } catch (error: any) {
      // Type error as any for simplicity, could be more specific
      logger.error(error.message);
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  },

  register: async (req: Request, res: Response): Promise<any> => {
    try {
      const {
        email,
        password,
        name,
      }: { email: string; password: string; name: string } = req.body;
      const rs = await authService.register({ email, password, name });
      res.status(rs.statusCode).json(rs);
    } catch (error: any) {
      // Type error as any for simplicity, could be more specific
      logger.error(error.message);
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  },
};

export default authController;
