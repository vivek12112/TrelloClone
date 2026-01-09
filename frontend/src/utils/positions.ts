export function computeNewPosition(
  before?: number,
  after?: number
): number {
  if (before == null && after == null) {
    return 1;
  }
  if (before == null && after != null) {
    return after - 1;
  }
  if (before != null && after == null) {
    return before + 1;
  }
  if (before != null && after != null) {
    return (before + after) / 2;
  }
  return 1;
}
