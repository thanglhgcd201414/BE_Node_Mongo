import { PaginationDto } from "@/common/dto/pagination.dto";
import {
  BaseErrorResponse,
  BasePageResponse,
  BaseSuccessResponse,
} from "@/config/baseResponse";
import Category from "@/db/models/category";
import { logger } from "@/server";
import { IQueryPagination } from "@/types/query";

const categoryService = {
  async create(
    createCategoryDto: any
  ): Promise<BaseErrorResponse | BaseSuccessResponse<any>> {
    try {
      const newCategory = new Category(createCategoryDto);
      await newCategory.save();
      return new BaseSuccessResponse({
        message: "Tạo mới loại sản phẩm thành công",
        data: newCategory,
      });
    } catch (error: any) {
      logger.error(`Error creating category: ${error.message}`);
      throw new BaseErrorResponse({ message: "Internal Server Error" });
    }
  },

  async findAll(queryReq: IQueryPagination): Promise<BasePageResponse<any>> {
    try {
      const paginationDto = new PaginationDto(queryReq);
      const { limit, search, skip } = paginationDto;

      let query: Record<string, any> = {};
      if (search) {
        query.name = { $regex: search, $options: "i" };
      }

      const [data, totalItem] = await Promise.all([
        Category.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        Category.countDocuments(query).exec(),
      ]);

      return new BasePageResponse({
        message: "Lấy tất cả loại sản phẩm thành công",
        data,
        paginationDto,
        totalItem,
      });
    } catch (error: any) {
      logger.error(`Error fetching categories: ${error.message}`);
      throw new BaseErrorResponse({ message: "Internal Server Error" });
    }
  },

  async findOne(
    id: string
  ): Promise<BaseErrorResponse | BaseSuccessResponse<any>> {
    try {
      const data = await Category.findById(id);
      return new BaseSuccessResponse({
        message: "Lấy loại sản phẩm theo ID thành công",
        data,
      });
    } catch (error: any) {
      logger.error(`Error finding category: ${error.message}`);
      throw new BaseErrorResponse({ message: "Internal Server Error" });
    }
  },

  async update(
    id: string,
    updateCategoryDto: any
  ): Promise<BaseErrorResponse | BaseSuccessResponse<any>> {
    try {
      const updatedCategory = await Category.findByIdAndUpdate(
        id,
        updateCategoryDto,
        { new: true }
      );
      if (!updatedCategory) {
        return new BaseErrorResponse({
          message: "Loại sản phẩm không tồn tại",
        });
      }
      return new BaseSuccessResponse({
        message: "Cập nhật loại sản phẩm thành công",
        data: updatedCategory,
      });
    } catch (error: any) {
      logger.error(`Error updating category: ${error.message}`);
      throw new BaseErrorResponse({ message: "Internal Server Error" });
    }
  },

  async remove(
    id: string
  ): Promise<BaseErrorResponse | BaseSuccessResponse<any>> {
    try {
      const deletedContent = await Category.findByIdAndDelete(id);
      if (!deletedContent) {
        return new BaseErrorResponse({
          message: "Loại sản phẩm không tồn tại",
        });
      }
      return new BaseSuccessResponse({
        data: deletedContent,
        message: "Xóa loại sản phẩm thành công",
      });
    } catch (error: any) {
      logger.error(`Error deleting category: ${error.message}`);
      throw new BaseErrorResponse({ message: "Internal Server Error" });
    }
  },
};

export default categoryService;
