import productController from "@/controllers/productController";
import tokenMiddleware from "@/middlewares/tokenMiddleware";
import express from "express";

const productRouter = express.Router();

productRouter.post(
  "/",
  tokenMiddleware.verifyTokenAdmin,
  productController.createProduct
);

productRouter.get("/", productController.getAllProducts);

productRouter.get("/:id", productController.getProductById);

productRouter.put(
  "/:id",
  tokenMiddleware.verifyTokenAdmin,
  productController.updateProduct
);

productRouter.put(
  "/favorite-product/:id",
  tokenMiddleware.verifyToken,
  productController.addToMyFavoriteProduct
);

productRouter.delete(
  "/favorite-product/:id",
  tokenMiddleware.verifyToken,
  productController.removeFromMyFavoriteProduct
);

productRouter.get(
  "/favorite-product",
  tokenMiddleware.verifyToken,
  productController.getMyFavoriteProducts
);

productRouter.get(
  "/favorite-product/:id",
  tokenMiddleware.verifyToken,
  productController.checkFavoriteProduct
);

productRouter.delete(
  "/:id",
  tokenMiddleware.verifyTokenAdmin,
  productController.deleteProduct
);

export default productRouter;
