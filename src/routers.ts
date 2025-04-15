import { Express } from "express";
import authRouter from "./routes/authRouter";
import profileRouter from "./routes/profileRouter";
import categoryRouter from "./routes/categoryRouter";
import productRouter from "./routes/productRouter";
import cartRouter from "./routes/cartRouter";
import reviewRouter from "./routes/reviewRouter";
import uploadRouter from "./routes/uploadRouter";
import orderRouter from "./routes/orderRouter";
import { env } from "./common/utils/envConfig";
import paymentRouter from "./routes/paymentRouter";
import chatbotRouter from "./routes/chatbotRouter";
import contentRouter from "./routes/contentRouter";

export const prefixURL = `/${env.PREFIX_URL}/${env.VERSION}`;

const buildUrl = (path: string) => {
  return `${prefixURL}/${path}`;
};

const setUpRouters = (app: Express) => {
  app.use(buildUrl("auth"), authRouter);
  app.use(buildUrl("profile"), profileRouter);
  app.use(buildUrl("category"), categoryRouter);
  app.use(buildUrl("products"), productRouter);
  app.use(buildUrl("cart"), cartRouter);
  app.use(buildUrl("review"), reviewRouter);
  app.use(buildUrl("uploads"), uploadRouter);
  app.use(buildUrl("order"), orderRouter);
  app.use(buildUrl("payment"), paymentRouter);
  app.use(buildUrl("blog"), contentRouter);
  app.use(buildUrl("chatbot"), chatbotRouter);
};

export default setUpRouters;
