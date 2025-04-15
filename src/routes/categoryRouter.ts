import categoryController from "@/controllers/categoryController";
import tokenMiddleware from "@/middlewares/tokenMiddleware";
import express from "express";

const categoryRouter = express.Router();

categoryRouter.post(
  "/",
  tokenMiddleware.verifyTokenAdmin,
  categoryController.createCategory
);

categoryRouter.get("/", categoryController.getAllCategories);

categoryRouter.get("/:id", categoryController.getCategoryById);

categoryRouter.put(
  "/:id",
  tokenMiddleware.verifyTokenAdmin,
  categoryController.updateCategory
);

categoryRouter.delete(
  "/:id",
  tokenMiddleware.verifyTokenAdmin,
  categoryController.deleteCategory
);

export default categoryRouter;
