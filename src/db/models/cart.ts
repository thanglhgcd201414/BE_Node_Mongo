import { logger } from "@/server";
import mongoose, { Document, Schema } from "mongoose";

interface ICartItem {
  productId: mongoose.Types.ObjectId;
  sku: string;
  color?: string;
  quantity: number;
}

interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalPrice: number;
}

const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        sku: { type: String, required: true },
        color: { type: String, require: false },
        quantity: { type: Number, default: 0 },
      },
    ],
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Cart = mongoose.model<ICart>("Cart", cartSchema);

const deleteMany = async () => {
  try {
    const result = await Cart.deleteMany({});
    logger.info(`Deleted ${result.deletedCount} carts successfully`);
    return result;
  } catch (error) {
    logger.error("Delete failed:", error);
    throw error;
  }
};

const insertMany = async (carts: ICart[]) => {
  try {
    const result = await Cart.insertMany(carts);
    logger.info(`Inserted ${result.length} carts successfully`);
    return result;
  } catch (error) {
    logger.error("Insert failed:", error);
    throw error;
  }
};

export { Cart, deleteMany, insertMany };
export default Cart;
