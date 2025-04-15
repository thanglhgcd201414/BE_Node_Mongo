import chatbotController from "@/controllers/chatbotController";
import express from "express";

const chatbotRouter = express.Router();

chatbotRouter.post("/", chatbotController.handleUserMessage);

export default chatbotRouter;
