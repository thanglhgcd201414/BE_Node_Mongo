import { env } from "@/common/utils/envConfig";
import paymentService from "@/services/paymentService";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const paymentController = {
  async createPayment(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.body;
      const rs = await paymentService.createPayment(orderId);
      res.status(rs.statusCode).json(rs);
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },

  async updateOrderStatus(req: Request, res: Response) {
    try {
      const { vnp_OrderInfo, vnp_TransactionStatus, secretToken } = req.query;
      if (vnp_TransactionStatus === "00") {
        await paymentService.updatePaymentStatus(
          vnp_OrderInfo?.toString() ?? "",
          secretToken?.toString() ?? ""
        );
        res.redirect(
          `${env.CORS_ORIGIN}/payment-success/${vnp_OrderInfo?.toString()}`
        );
      } else {
        res.redirect(
          `${env.CORS_ORIGIN}/payment-error/${vnp_OrderInfo?.toString()}`
        );
      }
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },
};

export default paymentController;
