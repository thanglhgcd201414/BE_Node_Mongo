import { EOrderStatus } from "@/constants/order-status";
import orderService from "@/services/orderService";
import { ERole, IUserDecoded } from "@/types/user";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const orderController = {
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.user as IUserDecoded;
      const rs = await orderService.create(id, req.body);
      res.status(rs.statusCode).json(rs);
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },

  async findOne(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const rs = await orderService.findOne(id);
      res.status(rs.statusCode).json(rs);
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },

  async findAllByUser(req: Request, res: Response): Promise<void> {
    try {
      const { id, role } = req.user as IUserDecoded;
      if (role === ERole.USER) {
        const rs = await orderService.findAllOrderByUserId(id, req.query);
        res.status(rs.statusCode).json(rs);
        return;
      }
      const rs = await orderService.findAllOrderByAdmin(req.query);
      res.status(rs.statusCode).json(rs);
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },

  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const rs = await orderService.updateOrderStatus(id, req.body.orderStatus);
      res.status(rs.statusCode).json(rs);
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },

  async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const rs = await orderService.cancelOrder(id);
      res.status(rs.statusCode).json(rs);
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },
};

export default orderController;
