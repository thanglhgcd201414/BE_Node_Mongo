import paymentController from "@/controllers/paymentController";
import tokenMiddleware from "@/middlewares/tokenMiddleware";
import express from "express";

const paymentRouter = express.Router();

paymentRouter.post(
  "/",
  tokenMiddleware.verifyToken,
  paymentController.createPayment
);

paymentRouter.get("/", paymentController.updateOrderStatus);

export default paymentRouter;
