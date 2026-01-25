export function normalizeHexColor(color) {
  if (!color) return null;
  const hex = color.replace("#", "");
  if (hex.length === 3) {
    return `#${hex
      .split("")
      .map(ch => ch + ch)
      .join("")}`;
  }
  if (hex.length === 6) return `#${hex}`;
  return null;
}

export function invertHexColor(color) {
  const hex = normalizeHexColor(color);
  if (!hex) return "#ffffff";
  const r = 255 - parseInt(hex.slice(1, 3), 16);
  const g = 255 - parseInt(hex.slice(3, 5), 16);
  const b = 255 - parseInt(hex.slice(5, 7), 16);
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
