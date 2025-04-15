import cors from "cors";
import express, {
  NextFunction,
  Request,
  Response,
  type Express,
} from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { pino } from "pino";
import { join } from "path";

import errorHandler from "@/common/middleware/errorHandler";
import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";
import { env } from "@/common/utils/envConfig";
import connectDB from "./config/connectDB";
import setUpRouters from "./routers";

const logger = pino({ name: "SERVER" });
const app: Express = express();

connectDB();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 200,
    allowedHeaders: ["Content-Type", "Authorization", "token"],
    exposedHeaders: ["X-Total-Count", "token"],
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(rateLimiter);
app.use(cookieParser());
app.use(express.static(join(__dirname, "..", "public")));
app.use(express.static(join(__dirname, "uploads")));

app.use((req: Request, res: Response, next: NextFunction) => {
  res.set("Cache-Control", "no-store");
  next();
});

/**
 * Router setup
 */
setUpRouters(app);

// Request logging
app.use(requestLogger);

// Error handlers
app.use(errorHandler());

export { app, logger };
