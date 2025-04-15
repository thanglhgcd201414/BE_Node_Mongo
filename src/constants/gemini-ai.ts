import { env } from "@/common/utils/envConfig";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export { genAI };
