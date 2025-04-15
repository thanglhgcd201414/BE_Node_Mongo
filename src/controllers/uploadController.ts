import { BaseSuccessResponse } from "@/config/baseResponse";
import uploadService from "@/services/uploadService";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const uploadController = {
  async handleUploadSingle(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "No file uploaded" });
      }
      res.status(StatusCodes.OK).json(
        new BaseSuccessResponse({
          data: `/${req.file?.filename}`,
          message: "Image uploaded successfully",
        })
      );
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },
  async handleUploadMulti(req: Request, res: Response): Promise<void> {
    try {
      if (!req.files) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "No file uploaded" });
      }
      const filePaths = (req.files as Express.Multer.File[]).map((file) => {
        return `/${file.filename}`;
      });
      res.status(StatusCodes.OK).json(
        new BaseSuccessResponse({
          data: filePaths,
          message: "Image uploaded successfully",
        })
      );
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },
  async deleteMulti(req: Request, res: Response): Promise<void> {
    try {
      const rs = await uploadService.deleteImages(req.body.imageUrls);
      res.status(StatusCodes.OK).json({
        message: "Delete files success",
      });
    } catch (error: any) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(error);
    }
  },
};

export default uploadController;
