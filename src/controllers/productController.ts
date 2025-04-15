import { Request, Response } from "express";
import productService from "@/services/productService";
import { StatusCodes } from "http-status-codes";
import { IUserDecoded } from "@/types/user";

const productController = {
  async createProduct(req: Request, res: Response) {
    try {
      const result = await productService.create(req.body);
      res.status(result.statusCode).json(result);
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },

  async getAllProducts(req: Request, res: Response) {
    try {
      const result = await productService.findAll(req.query);
      res.status(result.statusCode).json(result);
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },

  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await productService.findOne(id);
      res.status(result.statusCode).json(result);
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },

  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await productService.update(id, req.body);
      res.status(result.statusCode).json(result);
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },

  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await productService.remove(id);
      res.status(result.statusCode).json(result);
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },

  async addToMyFavoriteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user as IUserDecoded;
      const result = await productService.addToMyFavoriteProduct(user.id, id);
      res.status(result.statusCode).json(result);
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },

  async removeFromMyFavoriteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user as IUserDecoded;
      const result = await productService.removeFromMyFavoriteProduct(
        user.id,
        id
      );
      res.status(result.statusCode).json(result);
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },

  async getMyFavoriteProducts(req: Request, res: Response) {
    try {
      const user = req.user as IUserDecoded;
      const result = await productService.getMyFavoriteProducts(
        user.id,
        req.query
      );
      res.status(result.statusCode).json(result);
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },

  async checkFavoriteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user as IUserDecoded;
      const result = await productService.checkFavoriteProduct(id, user.id);
      res.status(result.statusCode).json(result);
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },
};

export default productController;
