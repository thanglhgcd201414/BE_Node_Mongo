import { User } from "@/db/models/user";
import { BaseErrorResponse, BaseSuccessResponse } from "../config/baseResponse";
import onRemoveParams from "../utils/remove-params";
import { logger } from "@/server";

const profileService = {
  updateProfile: async (
    idUser: string,
    data: any
  ): Promise<BaseSuccessResponse<any> | BaseErrorResponse> => {
    try {
      const user = await User.findById(idUser);
      if (!user) {
        return new BaseErrorResponse({
          message: "We couldn't find your username",
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        idUser,
        onRemoveParams(data),
        { new: true }
      );

      if (updatedUser) {
        return new BaseSuccessResponse({
          data: updatedUser,
          message: "Cập nhật thông tin thành công",
        });
      }

      return new BaseErrorResponse({ message: "Cập nhật thông tin thất bại" });
    } catch (error: any) {
      logger.error(error.message);
      return new BaseErrorResponse({ message: error.message });
    }
  },

  getProfile: async (
    id: string
  ): Promise<BaseSuccessResponse<any> | BaseErrorResponse> => {
    try {
      const user = await User.findById(id);
      if (!user) {
        return new BaseErrorResponse({
          message: "We couldn't find your username",
        });
      }

      return new BaseSuccessResponse({
        data: user,
        message: "Lấy thông tin thành công",
      });
    } catch (error: any) {
      logger.error(error.message);
      return new BaseErrorResponse({ message: error.message });
    }
  },
};

export default profileService;
