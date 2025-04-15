import { genAI } from "@/constants/gemini-ai";
import { SYSTEM_PROMPT } from "@/constants/prompt";
import { logger } from "@/server";
import productService from "./productService";
import { BaseSuccessResponse } from "@/config/baseResponse";
import { IResponseGemini } from "@/types/chat";

const chatBotService = {
  async analyzeQuery(userMessage: string): Promise<IResponseGemini> {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro-latest",
      });

      const result = await model.generateContent(
        `${SYSTEM_PROMPT}\n\n${userMessage}`
      );
      const response = result.response;
      return JSON.parse(
        response
          .text()
          .replace(/```json/g, "")
          .replace(/```/g, "")
      );
    } catch (error: any) {
      console.log("🚀 ~ analyzeQuery ~ error:", error);
      logger.error(`Error analyzing query: ${error.message}`);
      throw new Error("Failed to analyze query");
    }
  },
  formatProductResponse(products: any, response: IResponseGemini) {
    const res = {
      ...response,
      textResponse:
        products.length === 0
          ? "Rất tiếc có vẻ như sản phẩm bạn đang tìm kiếm chúng tôi không có sẵn tại cửa hàng. Bạn hãy quay lại sau nhé"
          : response.textResponse,
    };
    return new BaseSuccessResponse({
      message: "Tôi đã tìm thấy một số sản phẩm phù hợp với yêu cầu của bạn.",
      data: { content: products, ...res },
    });
  },

  handleOtherIntents(analysis: IResponseGemini) {
    const responseBuilder = {
      textResponse: analysis.textResponse || "Tôi có thể giúp gì thêm cho bạn?",
      options: [] as string[],
      quickActions: [] as Array<{ textResponse: string; action: string }>,
    };

    switch (analysis.responseType) {
      case "supports":
        responseBuilder.textResponse =
          analysis.textResponse || `Bạn cần hỗ trợ về điều gì?`;
        responseBuilder.options = [
          "Tra cứu đơn hàng",
          "Hướng dẫn đổi trả",
          "Chính sách bảo hành",
          "Liên hệ CSKH",
        ];
        break;

      default:
        if (analysis.queryData.brand) {
          responseBuilder.textResponse =
            analysis.textResponse ||
            `Bạn cần hỗ trợ về ${analysis.queryData.brand} hay mục đích khác?`;
          responseBuilder.quickActions = [
            {
              textResponse: `Phụ kiện ${analysis.queryData.brand}`,
              action: `accessory:${analysis.queryData.brand}`,
            },
            { textResponse: "Hướng dẫn sử dụng", action: "guide:using" },
            { textResponse: "Bảo hành", action: "support:warranty" },
          ];
        } else if (analysis.queryData.priceRange) {
          responseBuilder.textResponse =
            analysis.textResponse || "Bạn muốn tìm theo:";
          responseBuilder.options = [
            "Sản phẩm trong ngân sách của bạn",
            "So sánh các dòng máy cùng tầm giá",
            "Gợi ý phụ kiện kèm theo",
          ];
        }
        break;
    }

    if (responseBuilder.options.length === 0) {
      responseBuilder.options = [
        "Tìm sản phẩm theo yêu cầu",
        "Hướng dẫn mua hàng",
        "Tra cứu khuyến mãi",
      ];
    }

    responseBuilder.quickActions.push(
      { textResponse: "Về trang chủ", action: "navigate:home" },
      { textResponse: "Xem giỏ hàng", action: "navigate:cart" }
    );

    return new BaseSuccessResponse({
      message: responseBuilder.textResponse,
      data: {
        textResponse: responseBuilder.textResponse,
        options: responseBuilder.options,
        quickActions: responseBuilder.quickActions,
        metadata: analysis.queryData,
      },
    });
  },

  async handleUserMessage(userMessage: string) {
    try {
      const res = await this.analyzeQuery(userMessage);

      if (res.responseType === "search") {
        const products = await productService.searchProductByAI(res.queryData);
        return this.formatProductResponse(products.data, res);
      }

      return this.handleOtherIntents(res);
    } catch (error: any) {
      logger.error(`Error analyzing query: ${error.message}`);
      throw new Error("Failed to analyze query");
    }
  },
};

export default chatBotService;
