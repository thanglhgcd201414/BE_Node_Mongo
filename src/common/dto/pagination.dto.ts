export class PaginationDto {
  constructor({
    page,
    limit,
    search,
    sort,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: "ASC" | "DESC";
  }) {
    this._page = page ?? 1;
    this._limit = limit ?? 5;
    this._search = search;
    this._sort = sort;
  }

  private _page: number;
  private _limit: number;
  private _search?: string;
  private _sort?: "ASC" | "DESC";

  get skip(): number {
    return Math.ceil((this._page - 1) * this._limit);
  }

  get search(): string {
    return this._search || "";
  }

  get page(): number {
    return this._page;
  }

  get limit(): number {
    return Number(this._limit);
  }

  get sort(): "ASC" | "DESC" | undefined {
    return this._sort ?? "DESC";
  }
}
