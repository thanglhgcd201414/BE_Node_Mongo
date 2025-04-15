import orderController from "@/controllers/orderController";
import tokenMiddleware from "@/middlewares/tokenMiddleware";
import express from "express";

const orderRouter = express.Router();

orderRouter.post("/", tokenMiddleware.verifyToken, orderController.createOrder);
orderRouter.delete(
  "/:id",
  tokenMiddleware.verifyToken,
  orderController.cancelOrder
);

orderRouter.get("/:id", tokenMiddleware.verifyToken, orderController.findOne);

orderRouter.get(
  "/",
  tokenMiddleware.verifyToken,
  orderController.findAllByUser
);

orderRouter.put(
  "/order-status/:id",
  tokenMiddleware.verifyTokenAdmin,
  orderController.updateOrderStatus
);

export default orderRouter;
