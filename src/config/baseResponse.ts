import { PageDto } from "@/common/dto/page.dto";
import { PaginationMetaDataDto } from "@/common/dto/pagination-metadata.dto";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { StatusCodes } from "http-status-codes";

export class BaseResponse<T> {
  public readonly statusCode: number;
  public readonly message: string;
  public readonly timestamp: string;
  public readonly data?: T;

  constructor({
    statusCode,
    data,
    message,
  }: {
    statusCode: number;
    data?: T;
    message: string;
  }) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}

export class BasePageResponse<T> extends BaseResponse<PageDto<T>> {
  constructor({
    statusCode = StatusCodes.OK,
    message,
    data,
    paginationDto,
    totalItem,
  }: {
    statusCode?: number;
    message: string;
    data: T[];
    paginationDto: PaginationDto;
    totalItem: number;
  }) {
    const metaData = new PaginationMetaDataDto(totalItem, paginationDto);
    const pageData = new PageDto(data, metaData);

    super({
      statusCode,
      message,
      data: pageData,
    });
  }
}

export class BaseErrorResponse extends BaseResponse<null> {
  constructor({
    message,
    statusCode,
  }: {
    message: string;
    statusCode?: number;
  }) {
    super({
      statusCode: statusCode ?? StatusCodes.BAD_REQUEST,
      message: message ?? "Bad request",
      data: null,
    });
  }
}

export class BaseSuccessResponse<T> extends BaseResponse<T> {
  constructor({ data, message }: { data: T; message: string }) {
    super({
      statusCode: StatusCodes.OK,
      data,
      message: message ?? "Success",
    });
  }
}
