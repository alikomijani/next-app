export function validationPaginationParams(page: number, perPage: number) {
  if (page < 1 || perPage < 10 || perPage > 50) {
    throw new Error("invalid pagination params");
  }
}
