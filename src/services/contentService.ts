import {
  BaseErrorResponse,
  BasePageResponse,
  BaseSuccessResponse,
} from "@/config/baseResponse";
import Content from "@/db/models/content";
import { logger } from "@/server";
import generateSlug from "@/utils/generate-slug";

const contentService = {
  async create(
    createContentDto: any
  ): Promise<BaseErrorResponse | BaseSuccessResponse<any>> {
    try {
      if (!createContentDto.slug) {
        createContentDto = {
          ...createContentDto,
          slug: generateSlug(createContentDto.title),
        };
      }
      const newContent = new Content(createContentDto);
      await newContent.save();

      return new BaseSuccessResponse({
        data: newContent,
        message: "Tạo bài viết mới thành công",
      });
    } catch (error: any) {
      logger.error(`Content creation error: ${error.message}`);
      throw new BaseErrorResponse({ message: "Internal Server Error" });
    }
  },

  async findAll(
    paginationDto: any
  ): Promise<BaseErrorResponse | BasePageResponse<any>> {
    try {
      const { limit, search, skip } = paginationDto;
      let query: Record<string, any> = {};
      if (search) {
        query = { title: { $regex: search, $options: "i" } };
      }

      const [data, totalItem] = await Promise.all([
        Content.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        Content.countDocuments(query).exec(),
      ]);

      return new BasePageResponse({
        message: "Lấy danh sách bài viết thành công",
        data,
        paginationDto,
        totalItem,
      });
    } catch (error: any) {
      logger.error(`Content retrieval error: ${error.message}`);
      throw new BaseErrorResponse({ message: "Internal Server Error" });
    }
  },

  async findOne(
    slug: string
  ): Promise<BaseErrorResponse | BaseSuccessResponse<any>> {
    try {
      const contentDetail = await Content.findOne({
        slug,
      });
      if (!contentDetail) {
        return new BaseErrorResponse({ message: "Bài viết không tồn tại" });
      }
      return new BaseSuccessResponse({
        data: contentDetail,
        message: "Lấy chi tiết bài viết thành công",
      });
    } catch (error: any) {
      logger.error(`Content detail error: ${error.message}`);
      throw new BaseErrorResponse({ message: "Internal Server Error" });
    }
  },

  async update(
    id: string,
    updateContentDto: any
  ): Promise<BaseErrorResponse | BaseSuccessResponse<any>> {
    try {
      const updatedContent = await Content.findByIdAndUpdate(
        id,
        updateContentDto,
        { new: true }
      );
      if (!updatedContent) {
        return new BaseErrorResponse({ message: "Bài viết không tồn tại" });
      }
      return new BaseSuccessResponse({
        data: updatedContent,
        message: "Cập nhật bài viết thành công",
      });
    } catch (error: any) {
      logger.error(`Content update error: ${error.message}`);
      throw new BaseErrorResponse({ message: "Internal Server Error" });
    }
  },

  async remove(
    id: string
  ): Promise<BaseErrorResponse | BaseSuccessResponse<any>> {
    try {
      const deletedContent = await Content.findByIdAndDelete(id);
      if (!deletedContent) {
        return new BaseErrorResponse({ message: "Bài viết không tồn tại" });
      }
      return new BaseSuccessResponse({
        data: deletedContent,
        message: "Xóa bài viết thành công",
      });
    } catch (error: any) {
      logger.error(`Content deletion error: ${error.message}`);
      throw new BaseErrorResponse({ message: "Internal Server Error" });
    }
  },
};

export default contentService;
