import contentController from "@/controllers/contentController";
import tokenMiddleware from "@/middlewares/tokenMiddleware";
import express from "express";

const contentRouter = express.Router();

contentRouter.post(
  "/",
  tokenMiddleware.verifyTokenAdmin,
  contentController.create
);

contentRouter.get("/", contentController.findAll);

contentRouter.get("/:slug", contentController.findOne);

contentRouter.put(
  "/:id",
  tokenMiddleware.verifyTokenAdmin,
  contentController.update
);

contentRouter.delete(
  "/:id",
  tokenMiddleware.verifyTokenAdmin,
  contentController.remove
);

export default contentRouter;
