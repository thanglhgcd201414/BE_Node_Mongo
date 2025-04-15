"use strict";
import queryString from "qs";
import bcrypt from "bcrypt";
import dayjs from "dayjs";
import generateSignature from "../utils/generate-signature";
import { BaseErrorResponse, BaseSuccessResponse } from "@/config/baseResponse";
import { logger } from "@/server";
import { env } from "@/common/utils/envConfig";
import { prefixURL } from "@/routers";
import Order from "@/db/models/order";
import { EPaymentStatus } from "@/constants/order-status";

type VnpParams = {
  vnp_Version: string;
  vnp_Command: string;
  vnp_TmnCode: string;
  vnp_Amount: number;
  vnp_CreateDate: string;
  vnp_CurrCode: string;
  vnp_IpAddr: string;
  vnp_Locale: string;
  vnp_OrderInfo: string;
  vnp_OrderType: string;
  vnp_ReturnUrl: string;
  vnp_TxnRef: string;
};

function sortObject(obj: Record<string, any>): Record<string, any> {
  const sorted: Record<string, any> = {};
  const keys = Object.keys(obj).sort();

  keys.forEach((key) => {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
  });

  return sorted;
}

const paymentService = {
  async createPayment(
    orderId: string
  ): Promise<BaseSuccessResponse<any> | BaseErrorResponse> {
    try {
      const order = await Order.findOne({ _id: orderId });
      if (!order) {
        throw new Error("Không tìm thấy đơn mua của người dùng");
      }

      const secretToken = await bcrypt.hash(env.VN_PAY_HASH_KEY as string, 10);
      const merchantId = env.VN_PAY_MERCHANT_ID as string;
      const hashSecret = env.VN_PAY_HASH_SECRET as string;
      const vnPayUrl = env.VN_PAY_URL as string;
      const date = new Date();
      const createDate = dayjs(date).format("YYYYMMDDHHmmss");

      const vnpParams: VnpParams = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: merchantId,
        vnp_Amount: order.totalAmount * 100,
        vnp_CreateDate: createDate,
        vnp_CurrCode: "VND",
        vnp_IpAddr: "127.0.0.1",
        vnp_Locale: "vn",
        vnp_OrderInfo: order.id.toString(),
        vnp_OrderType: "billpayment",
        vnp_ReturnUrl: `http://${env.HOST}:${env.PORT}${prefixURL}/payment?secretToken=${secretToken}`,
        vnp_TxnRef: dayjs(date).format("DDHHmmss"),
      };

      const sortedKeys = sortObject(vnpParams);
      const signData = queryString.stringify(sortedKeys, { encode: false });
      const signature = generateSignature(signData, hashSecret);
      const paymentUrl = `${vnPayUrl}?${queryString.stringify(sortedKeys, {
        encode: false,
      })}&vnp_SecureHash=${signature}`;

      return new BaseSuccessResponse({
        data: paymentUrl,
        message: "Tạo thông tin thanh toán thành công",
      });
    } catch (error) {
      logger.error((error as Error).message);
      return new BaseErrorResponse({
        message: (error as Error).message,
      });
    }
  },
  async updatePaymentStatus(orderId: string, secretToken: string) {
    try {
      const order = await Order.findOne({ _id: orderId });
      if (!order) {
        throw new Error("Không tìm thấy đơn mua của người dùng");
      }

      const validHashKey = bcrypt.compare(secretToken, env.VN_PAY_HASH_KEY);
      if (!validHashKey) {
        return new BaseErrorResponse({
          message: "Mã xác thực không chính xác",
        });
      }
      await Order.findByIdAndUpdate(
        orderId,
        { paymentStatus: EPaymentStatus.PAID },
        { new: true }
      );
      return new BaseSuccessResponse({
        data: null,
        message: "Cập nhật tài khoản người dùng thành công",
      });
    } catch (error: any) {
      logger.error(error.message);
      return new BaseErrorResponse({
        message: error.message,
      });
    }
  },
};

export default paymentService;
