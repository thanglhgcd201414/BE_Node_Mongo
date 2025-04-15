import { BaseErrorResponse, BaseSuccessResponse } from "@/config/baseResponse";
import { logger } from "@/server";
import fs from "fs";
import path from "path";

const uploadService = {
  async deleteImages(imageUrls: string[]) {
    try {
      const deletePromises = imageUrls.map((url) => {
        return new Promise((resolve, reject) => {
          try {
            const urlObj = new URL(url);
            const imageName = path.basename(urlObj.pathname);
            const imagePath = path.join(
              __dirname,
              "..",
              "..",
              "uploads",
              imageName
            );

            fs.stat(imagePath, (err) => {
              if (err) {
                reject({ imageName, message: "Image not found" });
              } else {
                fs.unlink(imagePath, (unlinkErr) => {
                  if (unlinkErr) {
                    reject({ imageName, message: "Could not delete image" });
                  } else {
                    resolve({
                      imageName,
                      message: "Image deleted successfully",
                    });
                  }
                });
              }
            });
          } catch (err) {
            reject({ message: "Invalid URL format" });
          }
        });
      });

      const results = await Promise.allSettled(deletePromises);
      return results.map((result) => {
        if (result.status === "fulfilled") {
          return new BaseSuccessResponse({
            data: result.value,
            message: "Image deleted successfully",
          });
        } else {
          return new BaseErrorResponse({ message: result.reason.message });
        }
      });
    } catch (error: any) {
      logger.error(`Image deletion error: ${error.message}`);
      return new BaseErrorResponse({ message: "Failed to delete images" });
    }
  },
};

export default uploadService;
