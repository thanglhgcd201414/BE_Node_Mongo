import { BaseErrorResponse, BaseSuccessResponse } from "@/config/baseResponse";
import Cart from "@/db/models/cart";
import Product from "@/db/models/product";
import { logger } from "@/server";
import mongoose from "mongoose";

const cartService = {
  async createCart(
    userId: string
  ): Promise<BaseSuccessResponse<any> | BaseErrorResponse> {
    try {
      const newCart = new Cart({ userId });
      const savedCart = await newCart.save();
      return new BaseSuccessResponse({
        data: savedCart,
        message: "Tạo giỏ hàng thành công",
      });
    } catch (error: any) {
      logger.error(`Error creating cart: ${error.message}`);
      throw new BaseErrorResponse({ message: "Error creating cart" });
    }
  },

  async findOne(
    userId: string
  ): Promise<BaseSuccessResponse<any> | BaseErrorResponse> {
    try {
      const cart = await Cart.findOne({
        userId: new mongoose.Types.ObjectId(userId),
      }).populate("items.productId");
      if (!cart) {
        logger.warn(`⚠️ Cart not found for userId: ${userId}`);
        return new BaseErrorResponse({
          message: "Cart not found for this user",
        });
      }
      return new BaseSuccessResponse({
        data: cart,
        message: "Lấy thông tin giỏ hàng thành công",
      });
    } catch (error: any) {
      logger.error(`❌ Error finding cart: ${error.message}`);
      throw new BaseErrorResponse({ message: "Error retrieving cart" });
    }
  },

  async update(
    id: string,
    userId: string,
    updateCartDto: any
  ): Promise<BaseSuccessResponse<any> | BaseErrorResponse> {
    try {
      const cartDetail = await Cart.findOne({
        _id: id,
        userId: new mongoose.Types.ObjectId(userId),
      });
      if (!cartDetail) {
        return new BaseErrorResponse({ message: "Cart not found!" });
      }

      const productIds = updateCartDto.items.map(
        (item: any) => new mongoose.Types.ObjectId(item.productId)
      );
      const productData = await Product.find({ _id: { $in: productIds } });

      if (productData.length !== productIds.length) {
        return new BaseErrorResponse({
          message: "Some products not found in database!",
        });
      }

      const productPriceMap = new Map<string, number>();
      productData.forEach((product) => {
        product.variants.forEach((variant: any) => {
          productPriceMap.set(variant.sku, variant.price);
        });
      });

      const totalPrice = updateCartDto.items.reduce(
        (total: number, item: any) => {
          const productPrice = productPriceMap.get(item.sku);
          return total + (productPrice ? productPrice * item.quantity : 0);
        },
        0
      );

      cartDetail.items = updateCartDto.items;
      cartDetail.totalPrice = totalPrice;
      await cartDetail.save();

      return cartService.findOne(userId);
    } catch (error: any) {
      logger.error(`❌ Error updating cart: ${error.message}`);
      throw new BaseErrorResponse({ message: "Error updating cart" });
    }
  },

  async addItemToCart(
    id: string,
    userId: string,
    newItem: { productId: string; sku: string; quantity: number; color: string }
  ) {
    try {
      const cartDetail = await Cart.findById(id).exec();
      if (!cartDetail) {
        throw new BaseErrorResponse({ message: "Cart not found!" });
      }

      if (cartDetail.userId._id.toString() !== userId) {
        throw new BaseErrorResponse({
          message:
            "Bạn không có quyền thêm sản phẩm vào giỏ hàng của người khác",
        });
      }

      const product = await Product.findById(newItem.productId).exec();
      if (!product) {
        throw new BaseErrorResponse({ message: "Product not found!" });
      }

      const variant = product.variants.find((v) => v.sku === newItem.sku);

      if (!variant) {
        throw new BaseErrorResponse({
          message: "Variant not found for the specified SKU!",
        });
      }

      const color = variant.color;

      const existingItem = cartDetail.items.find(
        (item) =>
          item.productId.toString() === newItem.productId &&
          item.sku === newItem.sku
      );

      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        cartDetail.items.push({
          productId: new mongoose.Types.ObjectId(newItem.productId),
          sku: newItem.sku,
          color: color,
          quantity: newItem.quantity,
        });
      }

      const totalPrice = cartDetail.items.reduce((total, item) => {
        const productVariant = product.variants.find((v) => v.sku === item.sku);
        return (
          total + (productVariant ? productVariant.price * item.quantity : 0)
        );
      }, 0);

      cartDetail.totalPrice = totalPrice;

      await cartDetail.save();

      return new BaseSuccessResponse({
        data: cartDetail,
        message: "Thêm sản phẩm vào giỏ hàng thành công",
      });
    } catch (err: any) {
      logger.error(`Error finding cart: ${err.message}`);
      throw new BaseErrorResponse({ message: "Error finding cart" });
    }
  },

  async clearCart(id: string) {
    try {
      const cartDetail = await Cart.findById(id);
      if (!cartDetail) {
        return new BaseErrorResponse({ message: "Cart not found!" });
      }

      cartDetail.items = [];
      cartDetail.totalPrice = 0;

      await cartDetail.save();

      return new BaseSuccessResponse({
        message: "Xóa item giỏ hàng thành công",
        data: cartDetail,
      });
    } catch (err: any) {
      logger.error(`Error clearing cart: ${err.message}`);
      throw new BaseErrorResponse({ message: "Error clearing cart" });
    }
  },
};

export default cartService;
