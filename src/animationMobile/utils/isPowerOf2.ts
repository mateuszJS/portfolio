export const isPowerOf2 = (n: number) =>
  n && (n & (n - 1)) === 0;