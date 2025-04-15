import { logger } from "@/server";
import profileService from "@/services/profileService";
import { IUserDecoded } from "@/types/user";
import { Request, Response } from "express";

const profileController = {
  updateProfile: async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.user as IUserDecoded;
      const rs = await profileService.updateProfile(id, req.body);
      res.status(rs.statusCode).json(rs);
    } catch (error: any) {
      logger.error(error.message);
      res.status(error.status).json(error.message);
    }
  },

  getProfile: async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.user as IUserDecoded;
      const rs = await profileService.getProfile(id);
      res.status(rs.statusCode).json(rs);
    } catch (error: any) {
      logger.error(error.message);
      res.status(error.status).json(error.message);
    }
  },
};

export default profileController;
