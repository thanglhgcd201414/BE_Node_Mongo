import { Request, Response } from "express";
import reviewService from "@/services/reviewService";
import { IUserDecoded } from "@/types/user";
import { StatusCodes } from "http-status-codes";

const reviewController = {
  createReview: async (req: Request, res: Response): Promise<any> => {
    try {
      const user = req.user as IUserDecoded;
      const rs = await reviewService.create(user.id, req.body);
      res.status(rs.statusCode).json(rs);
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },

  getReviewsByProduct: async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params;
      const rs = await reviewService.getAllReviewByProductId(id, req.query);
      res.status(rs.statusCode).json(rs);
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },
};

export default reviewController;
