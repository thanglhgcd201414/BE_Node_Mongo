import { Request, Response } from "express";
import categoryService from "@/services/categoryService";
import { StatusCodes } from "http-status-codes";

const categoryController = {
  createCategory: async (req: Request, res: Response): Promise<any> => {
    try {
      const rs = await categoryService.create(req.body);
      res.status(rs.statusCode).json(rs);
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },

  getAllCategories: async (req: Request, res: Response): Promise<any> => {
    try {
      const rs = await categoryService.findAll(req.query);
      res.status(rs.statusCode).json(rs);
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },

  getCategoryById: async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params;
      const rs = await categoryService.findOne(id);
      res.status(rs.statusCode).json(rs);
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },

  updateCategory: async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params;
      const rs = await categoryService.update(id, req.body);
      res.status(rs.statusCode).json(rs);
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },

  deleteCategory: async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params;
      const rs = await categoryService.remove(id);
      res.status(rs.statusCode).json(rs);
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },
};

export default categoryController;
