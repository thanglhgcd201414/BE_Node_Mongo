export default function getSortName(
  sortName: string,
  sort: "ASC" | "DESC" | undefined
): any {
  return sort ? [[`${sortName}`, sort]] : undefined;
}
