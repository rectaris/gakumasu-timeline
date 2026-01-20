// 年→内部表現
export function yearOf(year) {
  return year;
}

// ○年前
export function yearsAgo(n) {
  return 1 - n;
}

// ★ NEW：日付込み timeValue
export function timeValue({ year, month, day = 1 }) {
  return (
    year * 12 * 31 +
    (month - 1) * 31 +
    (day - 1)
  );
}
