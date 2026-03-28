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

function hexToRgb(hex) {
  const normalized = normalizeHexColor(hex);
  if (!normalized) return null;
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16)
  };
}

function srgbToLinear(channel) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(channel) {
  return channel <= 0.0031308
    ? channel * 12.92
    : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;
}

function relativeLuminance({ r, g, b }) {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(rgbA, rgbB) {
  const l1 = relativeLuminance(rgbA);
  const l2 = relativeLuminance(rgbB);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function rgbToOklch({ r, g, b }) {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);

  const l = 0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B;
  const m = 0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B;
  const s = 0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B;

  const lCbrt = Math.cbrt(l);
  const mCbrt = Math.cbrt(m);
  const sCbrt = Math.cbrt(s);

  const L = 0.2104542553 * lCbrt + 0.793617785 * mCbrt - 0.0040720468 * sCbrt;
  const a = 1.9779984951 * lCbrt - 2.428592205 * mCbrt + 0.4505937099 * sCbrt;
  const b2 = 0.0259040371 * lCbrt + 0.7827717662 * mCbrt - 0.808675766 * sCbrt;

  const C = Math.hypot(a, b2);
  const h = (Math.atan2(b2, a) * 180) / Math.PI;
  return { L, C, h: (h + 360) % 360 };
}

function oklchToRgb({ L, C, h }) {
  const hRad = (h * Math.PI) / 180;
  const a = Math.cos(hRad) * C;
  const b = Math.sin(hRad) * C;

  const l = L + 0.3963377774 * a + 0.2158037573 * b;
  const m = L - 0.1055613458 * a - 0.0638541728 * b;
  const s = L - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l ** 3;
  const m3 = m ** 3;
  const s3 = s ** 3;

  const R = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const G = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const B = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  const r = Math.min(1, Math.max(0, linearToSrgb(R)));
  const g = Math.min(1, Math.max(0, linearToSrgb(G)));
  const b2 = Math.min(1, Math.max(0, linearToSrgb(B)));

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b2 * 255)
  };
}

function rgbToHex({ r, g, b }) {
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * 文字色から視認性の高い背景色を決定する。
 * - 色相は反対方向（+180°）を基本
 * - 明度は高め固定（必要ならさらに上げる）
 * - 彩度は控えめ
 * - WCAG 2.1 コントラスト比 4.5:1 を満たすまで明度を調整
 */
export function backgroundFromTextColor(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#f2f2f2";

  const { h } = rgbToOklch(rgb);
  const targetHue = (h + 180) % 360;
  const textLuminance = relativeLuminance(rgb);
  const isTextLight = textLuminance > 0.6;
  let lightness = isTextLight ? 0.35 : 0.92;
  let chroma = 0.06;

  let background = oklchToRgb({ L: lightness, C: chroma, h: targetHue });
  let ratio = contrastRatio(rgb, background);

  while (ratio < 4.5 && lightness < 0.98 && !isTextLight) {
    lightness += 0.01;
    background = oklchToRgb({ L: lightness, C: chroma, h: targetHue });
    ratio = contrastRatio(rgb, background);
  }

  while (ratio < 4.5 && lightness > 0.12 && isTextLight) {
    lightness -= 0.01;
    background = oklchToRgb({ L: lightness, C: chroma, h: targetHue });
    ratio = contrastRatio(rgb, background);
  }

  while (ratio < 4.5 && chroma > 0.02) {
    chroma -= 0.01;
    background = oklchToRgb({ L: lightness, C: chroma, h: targetHue });
    ratio = contrastRatio(rgb, background);
  }

  return rgbToHex(background);
}
