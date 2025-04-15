"use strict";
import express from "express";
import tokenMiddleware from "@/middlewares/tokenMiddleware";
import { upload } from "@/config/multer";
import uploadController from "@/controllers/uploadController";

const uploadRouter = express.Router();

uploadRouter.post(
  "/upload-single",
  tokenMiddleware.verifyToken,
  upload.single("image"),
  uploadController.handleUploadSingle
);

uploadRouter.post(
  "/upload-multi",
  tokenMiddleware.verifyToken,
  upload.array("image", 5),
  uploadController.handleUploadMulti
);

uploadRouter.post(
  "/delete-images",
  tokenMiddleware.verifyToken,
  uploadController.deleteMulti
);

export default uploadRouter;
