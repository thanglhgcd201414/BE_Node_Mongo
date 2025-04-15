import tokenMiddleware from "@/middlewares/tokenMiddleware";
import express from "express";
import profileController from "src/controllers/profileController";
const profileRouter = express.Router();

profileRouter.put(
  "/",
  tokenMiddleware.verifyToken,
  profileController.updateProfile
);

profileRouter.get(
  "/",
  tokenMiddleware.verifyToken,
  profileController.getProfile
);

export default profileRouter;
