import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import chatBotService from "@/services/chatBotService";

const chatbotController = {
  handleUserMessage: async (req: Request, res: Response): Promise<any> => {
    try {
      const rs = await chatBotService.handleUserMessage(req.body.message);
      res.status(rs.statusCode).json(rs);
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },
};

export default chatbotController;
