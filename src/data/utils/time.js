export const BASE_YEAR = 1;

/**
 * n年前 → 通算yearに変換
 */
export function yearsAgo(n) {
  return BASE_YEAR - n;
}

/**
 * n年目 → 通算year（そのまま）
 */
export function yearOf(n) {
  return n;
}
