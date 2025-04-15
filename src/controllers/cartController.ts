import { Request, Response } from "express";
import cartService from "@/services/cartService";
import { BaseErrorResponse } from "@/config/baseResponse";
import { IUserDecoded } from "@/types/user";
import { StatusCodes } from "http-status-codes";

const cartController = {
  async createCart(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as IUserDecoded;
      const response = await cartService.createCart(user.id);
      res.status(201).json(response);
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(new BaseErrorResponse({ message: error.message }));
    }
  },

  async getCart(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as IUserDecoded;
      const response = await cartService.findOne(user.id);
      res.status(200).json(response);
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(new BaseErrorResponse({ message: error.message }));
    }
  },

  async updateCart(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as IUserDecoded;
      const cartId = req.params.id;
      const updateCartDto = req.body;
      const response = await cartService.update(cartId, user.id, updateCartDto);
      res.status(200).json(response);
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(new BaseErrorResponse({ message: error.message }));
    }
  },

  async addItemToCart(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as IUserDecoded;
      const cartId = req.params.id;
      const item = req.body;
      const response = await cartService.addItemToCart(cartId, user.id, item);
      res.status(200).json(response);
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(new BaseErrorResponse({ message: error.message }));
    }
  },
};

export default cartController;
