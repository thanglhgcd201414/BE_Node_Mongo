import cartController from "@/controllers/cartController";
import tokenMiddleware from "@/middlewares/tokenMiddleware";
import express from "express";

const cartRouter = express.Router();

cartRouter.get("/", tokenMiddleware.verifyToken, cartController.getCart);

cartRouter.put("/:id", tokenMiddleware.verifyToken, cartController.updateCart);

cartRouter.post(
  "/:id",
  tokenMiddleware.verifyToken,
  cartController.addItemToCart
);

export default cartRouter;
