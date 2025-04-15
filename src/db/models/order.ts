import {
  EOrderReviewed,
  EOrderStatus,
  EPaymentMethod,
  EPaymentStatus,
} from "@/constants/order-status";
import { logger } from "@/server";
import mongoose, { Document, Schema } from "mongoose";

interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  items: {
    productId: mongoose.Types.ObjectId;
    variantId: mongoose.Types.ObjectId;
    quantity: number;
  }[];
  totalAmount: number;
  paymentStatus: EPaymentStatus;
  paymentMethod: EPaymentMethod;
  shippingAddress: {
    street: string;
    city: string;
    district: string;
    ward: string;
  };
  reviewed: EOrderReviewed;
  orderStatus: EOrderStatus;
  trackingNumber: string;
  phoneNumber: string;
  note?: string;
}

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        sku: { type: String, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(EPaymentStatus),
      default: EPaymentStatus.UNPAID,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(EPaymentMethod),
      default: EPaymentMethod.CAST,
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      district: { type: String, required: true },
      ward: { type: String, required: true },
    },
    orderStatus: {
      type: String,
      enum: Object.values(EOrderStatus),
      default: EOrderStatus.PROCESSING,
    },
    reviewed: {
      type: String,
      enum: Object.values(EOrderReviewed),
      default: EOrderReviewed.NOT_REVIEWED,
    },
    trackingNumber: {
      type: String,
      required: true,
    },
    note: {
      type: String,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model<IOrder>("Order", orderSchema);

const deleteMany = async () => {
  try {
    const result = await Order.deleteMany({});
    logger.info(`Deleted ${result.deletedCount} orders successfully`);
    return result;
  } catch (error) {
    logger.error("Delete failed:", error);
    throw error;
  }
};

const insertMany = async (orders: IOrder[]) => {
  try {
    const result = await Order.insertMany(orders);
    logger.info(`Inserted ${result.length} orders successfully`);
    return result;
  } catch (error) {
    logger.error("Insert failed:", error);
    throw error;
  }
};

export { Order, deleteMany, insertMany };
export default Order;
