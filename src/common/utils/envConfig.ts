import dotenv from "dotenv";
import { cleanEnv, host, num, port, str, testOnly } from "envalid";

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    devDefault: testOnly("test"),
    choices: ["development", "production", "test"],
  }),
  PREFIX_URL: str({
    devDefault: "api",
  }),
  VERSION: str({
    devDefault: testOnly("v1"),
  }),
  HOST: host({ devDefault: testOnly("localhost") }),
  PORT: port({ devDefault: testOnly(3000) }),
  CORS_ORIGIN: str({ devDefault: testOnly("http://localhost:3000") }),
  COMMON_RATE_LIMIT_MAX_REQUESTS: num({ devDefault: testOnly(1000) }),
  COMMON_RATE_LIMIT_WINDOW_MS: num({ devDefault: testOnly(1000) }),

  // Database Configuration
  MONGODB_URI: str({
    devDefault: testOnly("mongodb://localhost:27017/db_e_commerce"),
  }),
  MONGODB_DB_NAME: str({ devDefault: testOnly("db_e_commerce") }),

  GEMINI_API_KEY: str({
    devDefault: testOnly("AIzaSyAQ2Ucq8KlrTQMtyQ3F92xfiaP7OLs_QVM"),
  }),

  VN_PAY_MERCHANT_ID: str({
    devDefault: "WPJF2Y8A",
  }),
  VN_PAY_HASH_SECRET: str({
    devDefault: "07SPR6O7FDVRDJ2A568HLWXQ5AU018U4",
  }),
  VN_PAY_URL: str({
    devDefault: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  }),
  VN_PAY_HASH_KEY: str({
    devDefault: "jfdshgfdgNyhdgasUrgfe932@324sdfsdafs",
  }),
});
