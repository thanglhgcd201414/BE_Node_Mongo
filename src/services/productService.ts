import {
  BaseErrorResponse,
  BasePageResponse,
  BaseSuccessResponse,
} from "@/config/baseResponse";
import Product from "@/db/models/product";
import { logger } from "@/server";
import mongoose, { Types } from "mongoose";
import uploadService from "./uploadService";
import { IQueryPagination } from "@/types/query";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { User } from "@/db/models/user";
import buildProductQuery from "@/utils/build-product-query";

const productService = {
  async create(
    productDto: any
  ): Promise<BaseErrorResponse | BaseSuccessResponse<any>> {
    try {
      const newProduct = new Product(productDto);
      await newProduct.save();
      return new BaseSuccessResponse({
        message: "Product created successfully!",
        data: newProduct,
      });
    } catch (error: any) {
      logger.error(`Product creation error: ${error.message}`);
      return new BaseErrorResponse({ message: "Internal Server Error" });
    }
  },

  async findAll(
    query: IQueryPagination
  ): Promise<BaseErrorResponse | BasePageResponse<any>> {
    try {
      const { categoryIds, allRatingsAbove4 } = query;

      const paginationDto = new PaginationDto(query);
      const { limit, search, skip } = paginationDto;

      const aggregationPipeline: any[] = [];
      const matchStage: any = {};

      if (search) {
        matchStage.name = { $regex: search, $options: "i" };
      }

      if (categoryIds?.length) {
        matchStage.categories = {
          $in: categoryIds.map((id: any) => new Types.ObjectId(id)),
        };
      }

      if (Object.keys(matchStage).length > 0) {
        aggregationPipeline.push({ $match: matchStage });
      }

      aggregationPipeline.push({
        $addFields: {
          minPrice: { $min: "$variants.price" },
          maxPrice: { $max: "$variants.price" },
        },
      });

      aggregationPipeline.push({
        $lookup: {
          from: "reviews",
          localField: "reviews",
          foreignField: "_id",
          as: "reviews",
        },
      });

      aggregationPipeline.push({
        $addFields: {
          ratingAverage: {
            $round: [
              {
                $ifNull: [{ $avg: "$reviews.rating" }, 0],
              },
              1,
            ],
          },
        },
      });

      if (allRatingsAbove4) {
        aggregationPipeline.push({
          $match: {
            $expr: {
              $and: [
                { $ne: ["$reviews", []] },
                {
                  $eq: [
                    {
                      $size: {
                        $filter: {
                          input: "$reviews.rating",
                          as: "rating",
                          cond: { $lte: ["$$rating", 4] },
                        },
                      },
                    },
                    0,
                  ],
                },
              ],
            },
          },
        });
      }

      const sortOptions: Record<string, 1 | -1> = {};

      if (query.sortPrice) {
        sortOptions.minPrice = query.sortPrice === "ASC" ? 1 : -1;
      } else {
        sortOptions.createdAt = -1;
      }

      aggregationPipeline.push({ $sort: sortOptions });

      aggregationPipeline.push({
        $facet: {
          paginatedResults: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "categories",
                localField: "categories",
                foreignField: "_id",
                as: "categories",
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      });

      const [result] = await Product.aggregate(aggregationPipeline);

      let populatedResults = result.paginatedResults;

      return new BasePageResponse({
        message: "Lấy danh sách sản phẩm thành công",
        data: populatedResults,
        paginationDto,
        totalItem: result.totalCount[0]?.count || 0,
      });
    } catch (error: any) {
      logger.error(`Fetch products error: ${error.message}`);
      return new BaseErrorResponse({ message: "Internal Server Error" });
    }
  },

  async findOne(
    id: string
  ): Promise<BaseErrorResponse | BaseSuccessResponse<any>> {
    try {
      const product = await Product.findById(id)
        .populate("categories reviews")
        .select("+ratingAverage");

      if (!product) {
        return new BaseErrorResponse({ message: "Product not found!" });
      }

      const relatedProducts = await Product.aggregate([
        {
          $match: {
            $and: [
              { _id: { $ne: new mongoose.Types.ObjectId(id) } },
              {
                $or: [
                  { categories: { $in: product.categories } },
                  { brand: product.brand },
                ],
              },
            ],
          },
        },
        { $sample: { size: 10 } },
        {
          $lookup: {
            from: "reviews",
            localField: "reviews",
            foreignField: "_id",
            as: "reviews",
          },
        },
        {
          $addFields: {
            ratingAverage: {
              $ifNull: [{ $avg: "$reviews.rating" }, 0],
            },
          },
        },
        {
          $project: {
            name: 1,
            variants: 1,
            images: 1,
            ratingAverage: 1,
            brand: 1,
            productModel: 1,
          },
        },
      ]);

      const responseData = {
        productDetail: product.toObject(),
        relatedProducts,
      };

      return new BaseSuccessResponse({
        message: "Product retrieved successfully",
        data: responseData,
      });
    } catch (error: any) {
      logger.error(`Fetch product error: ${error.message}`);
      return new BaseErrorResponse({ message: "Internal Server Error" });
    }
  },

  async update(
    id: string,
    updateProductDto: any
  ): Promise<BaseErrorResponse | BaseSuccessResponse<any>> {
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        updateProductDto,
        { new: true }
      );
      if (!updatedProduct)
        return new BaseErrorResponse({ message: "Product not found!" });
      return new BaseSuccessResponse({
        message: "Product updated successfully",
        data: updatedProduct,
      });
    } catch (error: any) {
      logger.error(`Update product error: ${error.message}`);
      return new BaseErrorResponse({ message: "Internal Server Error" });
    }
  },

  async remove(
    id: string
  ): Promise<BaseErrorResponse | BaseSuccessResponse<any>> {
    try {
      const deletedProduct = await Product.findByIdAndDelete(id);
      if (!deletedProduct)
        return new BaseErrorResponse({ message: "Product not found!" });

      if (deletedProduct.images)
        uploadService.deleteImages(deletedProduct.images);
      return new BaseSuccessResponse({
        message: "Product deleted successfully",
        data: deletedProduct,
      });
    } catch (error: any) {
      logger.error(`Delete product error: ${error.message}`);
      return new BaseErrorResponse({ message: "Internal Server Error" });
    }
  },

  async addToMyFavoriteProduct(userId: string, productId: string) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error("User not found");
      }

      const isAlreadyFavorite = user.favoriteProducts.includes(productId);

      if (isAlreadyFavorite) {
        throw new Error("Product is already in favorites");
      }

      user.favoriteProducts.push(productId);
      await user.save();

      return new BaseSuccessResponse({
        data: user.favoriteProducts,
        message: "Thêm vào sản phẩm yêu thích thành công",
      });
    } catch (error) {
      logger.error("Error adding product to favorites:", error);
      throw error;
    }
  },

  async removeFromMyFavoriteProduct(userId: string, productId: string) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error("User not found");
      }

      const isAlreadyFavorite = user.favoriteProducts.includes(productId);

      if (!isAlreadyFavorite) {
        throw new Error("Product is not in favorites");
      }

      user.favoriteProducts = user.favoriteProducts.filter(
        (id) => id.toString() !== productId
      );
      await user.save();

      return new BaseSuccessResponse({
        data: user.favoriteProducts,
        message: "Xóa khỏi sản phẩm yêu thích thành công",
      });
    } catch (error) {
      logger.error("Error removing product from favorites:", error);
      throw error;
    }
  },

  async getMyFavoriteProducts(userId: string, query: IQueryPagination) {
    try {
      const paginationDto = new PaginationDto(query);
      const { limit, skip } = paginationDto;

      const user = await User.findById(userId).populate({
        path: "favoriteProducts",
        options: {
          limit,
          skip,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const totalFavorites = user.favoriteProducts.length;

      return new BasePageResponse({
        data: user.favoriteProducts,
        totalItem: totalFavorites,
        paginationDto,
        message: "Lấy danh sách sản phẩm yêu thích thành công",
      });
    } catch (error) {
      logger.error("Error fetching favorite products:", error);
      throw error;
    }
  },

  async checkFavoriteProduct(productId: string, userId: string) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error("User not found");
      }

      const isFavorite = user.favoriteProducts.some(
        (favProduct) => favProduct.toString() === productId
      );

      return new BaseSuccessResponse({
        data: { isFavorite },
        message: isFavorite
          ? "Sản phẩm này nằm trong danh sách yêu thích"
          : "Sản phẩm này chưa được yêu thích",
      });
    } catch (error) {
      logger.error("Error checking favorite product:", error);
      throw error;
    }
  },

  async searchProductByAI(params: {
    brand?: string;
    productModel?: string;
    color?: string;
    storageCapacity?: string;
    priceRange?: { min?: number; max?: number };
  }) {
    try {
      const query = buildProductQuery(params);

      const products = await Product.find(query).populate("categories").lean();

      const rs = products.map((p) => ({
        _id: p._id,
        name: p.name,
        model: p.productModel,
        images: p.images,
        variants: p.variants.filter((v) => {
          const colorMatch =
            !params.color || new RegExp(params.color, "i").test(v.color);
          const storageMatch =
            !params.storageCapacity ||
            v.storageCapacity.replace(/\s/g, "").toUpperCase() ===
              params.storageCapacity.replace(/\s/g, "").toUpperCase();
          const priceInRange =
            (params.priceRange?.min === undefined ||
              v.price >= params.priceRange.min) &&
            (params.priceRange?.max === undefined ||
              v.price <= params.priceRange.max);

          return colorMatch && storageMatch && priceInRange;
        }),
      }));

      return new BaseSuccessResponse({
        message: "Lấy danh sách sản phẩm thành công",
        data: rs,
      });
    } catch (error: any) {
      logger.error(`Fetch products error: ${error.message}`, error.stack);
      return new BaseErrorResponse({ message: "Lỗi hệ thống" });
    }
  },
};

export default productService;
