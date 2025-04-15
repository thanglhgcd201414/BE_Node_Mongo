import Order from "@/db/models/order";
import { EOrderReviewed, EOrderStatus } from "../constants/order-status";
import {
  BaseErrorResponse,
  BasePageResponse,
  BaseSuccessResponse,
} from "@/config/baseResponse";
import { Review } from "@/db/models/review";
import { logger } from "@/server";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { IQueryPagination } from "@/types/query";
import mongoose from "mongoose";

interface CreateReviewDto {
  orderId: string;
  data: {
    productId: string;
    rating: number;
    comment?: string;
  }[];
}

const reviewService = {
  async create(userId: string, createReviewDto: CreateReviewDto) {
    try {
      const { orderId, data } = createReviewDto;

      const order = await Order.findOne({
        _id: orderId,
        userId,
        orderStatus: EOrderStatus.DELIVERED,
        reviewed: EOrderReviewed.NOT_REVIEWED,
      });

      if (!order) {
        return new BaseErrorResponse({
          message: "Order not found or not eligible for review",
        });
      }

      const reviewsToCreate = data.map((item) => ({
        productId: new mongoose.Types.ObjectId(item.productId),
        userId: new mongoose.Types.ObjectId(userId),
        rating: item.rating,
        comment: item.comment,
      }));

      const newReviews = await Review.insertMany(reviewsToCreate);

      order.reviewed = EOrderReviewed.REVIEWED;
      await order.save();

      return new BaseSuccessResponse({
        data: newReviews,
        message: "Reviews created successfully",
      });
    } catch (error: any) {
      logger.error(`Error creating reviews: ${error.message}`);
      return new BaseErrorResponse({ message: "Internal Server Error" });
    }
  },

  async getAllReviewByProductId(productId: string, query: IQueryPagination) {
    try {
      const paginationDto = new PaginationDto(query);
      const { limit, skip, sort } = paginationDto;

      const sortOptions: Record<string, 1 | -1> = {};
      if (sort === "ASC") {
        sortOptions.createdAt = 1;
      } else {
        sortOptions.createdAt = -1;
      }

      const [reviews, total] = await Promise.all([
        Review.find({ productId })
          .populate("userId", "name email")
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),

        Review.countDocuments({ productId }),
      ]);

      return new BasePageResponse({
        message: "Lấy danh sách đánh giá thành công",
        data: reviews,
        paginationDto,
        totalItem: total,
      });
    } catch (error: any) {
      logger.error(`Error getting reviews: ${error.message}`);
      return new BaseErrorResponse({
        message: "Internal Server Error",
        statusCode: 500,
      });
    }
  },
};

export default reviewService;
