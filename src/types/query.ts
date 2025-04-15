export interface IQueryPagination {
  page?: number;
  limit?: number;
  sort?: "ASC" | "DESC";
  search?: string;
  [x: string]: any;
}
