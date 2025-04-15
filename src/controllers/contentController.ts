import { Request, Response } from "express";
import contentService from "@/services/contentService";
import { StatusCodes } from "http-status-codes";

const contentController = {
  async create(req: Request, res: Response): Promise<any> {
    try {
      const rs = await contentService.create(req.body);
      res.status(rs.statusCode).json(rs);
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },

  async findAll(req: Request, res: Response): Promise<any> {
    try {
      const rs = await contentService.findAll(req.query);
      res.status(rs.statusCode).json(rs);
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },

  async findOne(req: Request, res: Response): Promise<any> {
    try {
      const { slug } = req.params;
      const rs = await contentService.findOne(slug);
      res.status(rs.statusCode).json(rs);
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },

  async update(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const rs = await contentService.update(id, req.body);
      res.status(rs.statusCode).json(rs);
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },

  async remove(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const rs = await contentService.remove(id);
      res.status(rs.statusCode).json(rs);
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },
};

export default contentController;
