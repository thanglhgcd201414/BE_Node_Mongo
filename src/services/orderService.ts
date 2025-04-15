import { PaginationDto } from "@/common/dto/pagination.dto";
import {
  BaseErrorResponse,
  BasePageResponse,
  BaseSuccessResponse,
} from "@/config/baseResponse";
import { EOrderStatus } from "@/constants/order-status";
import Order from "@/db/models/order";
import { logger } from "@/server";
import { IQueryPagination } from "@/types/query";
import cartService from "./cartService";

const generateTrackingNumber = (userId: string) => {
  let pr = "VN001";
  for (let i = 0; i < 5; i++) pr += ~~(Math.random() * 10);
  return pr + userId.slice(0, 5).toUpperCase();
};

const orderService = {
  async create(
    userId: string,
    orderDto: any
  ): Promise<BaseErrorResponse | BaseSuccessResponse<any>> {
    try {
      const { paymentMethod, shippingAddress, note, phoneNumber } = orderDto;
      const cart = (await cartService.findOne(userId)).data;
      const newOrder = new Order({
        items: cart.items.map((_item: any) => ({
          ..._item,
          productId: _item.productId,
        })),
        userId,
        totalAmount: cart.totalPrice,
        paymentMethod,
        shippingAddress,
        phoneNumber,
        note,
        trackingNumber: generateTrackingNumber(userId),
      });
      await newOrder.save();
      await cartService.clearCart(cart._id);
      return new BaseSuccessResponse({
        message: "Order created successfully!",
        data: newOrder,
      });
    } catch (error: any) {
      logger.error(`Order creation error: ${error.message}`);
      return new BaseErrorResponse({ message: "Internal Server Error" });
    }
  },

  async findAllOrderByUserId(
    userId: string,
    queryRequest: IQueryPagination
  ): Promise<BaseErrorResponse | BasePageResponse<any>> {
    try {
      if (!userId)
        new BaseErrorResponse({ message: "Không tìm thấy người dùng" });
      const status = queryRequest.status as EOrderStatus;
      const paginationDto = new PaginationDto(queryRequest);
      const { limit, skip } = paginationDto;
      let query: Record<string, any> = { userId };
      if (status) query.orderStatus = status;

      const totalItem = await Order.countDocuments(query);
      const data = await Order.find(query)
        .sort({ createdAt: -1 })
        .populate("items.productId")
        .skip(skip)
        .limit(limit);

      return new BasePageResponse({
        message: "Fetched orders successfully",
        data,
        paginationDto,
        totalItem,
      });
    } catch (error: any) {
      logger.error(`Fetch orders error: ${error.message}`);
      return new BaseErrorResponse({ message: "Internal Server Error" });
    }
  },

  async findOne(
    id: string
  ): Promise<BaseErrorResponse | BaseSuccessResponse<any>> {
    try {
      const order = await Order.findById(id).populate("items.productId userId");
      if (!order) return new BaseErrorResponse({ message: "Order not found!" });
      return new BaseSuccessResponse({
        message: "Order retrieved successfully",
        data: order,
      });
    } catch (error: any) {
      logger.error(`Fetch order error: ${error.message}`);
      return new BaseErrorResponse({ message: "Internal Server Error" });
    }
  },

  async update(
    id: string,
    updateOrderDto: any
  ): Promise<BaseErrorResponse | BaseSuccessResponse<any>> {
    try {
      const updatedOrder = await Order.findByIdAndUpdate(id, updateOrderDto, {
        new: true,
      });
      if (!updatedOrder)
        return new BaseErrorResponse({ message: "Order not found!" });
      return new BaseSuccessResponse({
        message: "Order updated successfully",
        data: updatedOrder,
      });
    } catch (error: any) {
      logger.error(`Update order error: ${error.message}`);
      return new BaseErrorResponse({ message: "Internal Server Error" });
    }
  },

  async findAllOrderByAdmin(queryRequest: IQueryPagination) {
    try {
      const paginationDto = new PaginationDto(queryRequest);
      const { limit, skip } = paginationDto;
      const query: Record<string, any> = {};

      if (queryRequest.orderStatus)
        query.orderStatus = queryRequest.orderStatus;
      if (queryRequest.paymentStatus)
        query.paymentStatus = queryRequest.paymentStatus;
      if (queryRequest.trackingNumber)
        query.trackingNumber = queryRequest.trackingNumber;

      const totalItem = await Order.countDocuments(query);
      const data = await Order.find(query)
        .sort({ createdAt: -1 })
        .populate("items.productId userId")
        .skip(skip)
        .limit(limit);

      return new BasePageResponse({
        message: "Fetched orders successfully",
        data,
        paginationDto,
        totalItem,
      });
    } catch (error: any) {
      logger.error(`Fetch orders error: ${error.message}`);
      return new BaseErrorResponse({ message: "Internal Server Error" });
    }
  },

  async updateOrderStatus(id: string, orderStatus: EOrderStatus) {
    try {
      const updatedOrder = await Order.findByIdAndUpdate(
        id,
        { orderStatus },
        { new: true }
      );
      if (!updatedOrder)
        return new BaseErrorResponse({ message: "Không tìm thấy đơn hàng" });
      return new BaseSuccessResponse({
        message: "Cập nhật trạng thái đơn hàng thành công",
        data: updatedOrder,
      });
    } catch (error: any) {
      logger.error(`Update order status error: ${error.message}`);
      return new BaseErrorResponse({ message: "Internal Server Error" });
    }
  },

  async cancelOrder(id: string) {
    try {
      const updatedOrder = await Order.findByIdAndUpdate(
        id,
        { orderStatus: EOrderStatus.CANCELLED },
        { new: true }
      );
      if (!updatedOrder)
        return new BaseErrorResponse({ message: "Không tìm thấy đơn hàng" });
      return new BaseSuccessResponse({
        message: "Hủy đơn hàng thành công",
        data: updatedOrder,
      });
    } catch (error: any) {
      logger.error(`Update order status error: ${error.message}`);
      return new BaseErrorResponse({ message: "Internal Server Error" });
    }
  },
};

export default orderService;
