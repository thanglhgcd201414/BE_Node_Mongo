import reviewController from "@/controllers/reviewController";
import tokenMiddleware from "@/middlewares/tokenMiddleware";
import express from "express";

const reviewRouter = express.Router();

reviewRouter.post(
  "/",
  tokenMiddleware.verifyToken,
  reviewController.createReview
);

reviewRouter.get("/:id", reviewController.getReviewsByProduct);

export default reviewRouter;
