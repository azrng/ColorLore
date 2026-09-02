/** 按背景亮度返回可读的文字颜色（WCAG 相对亮度） */
export function textColorOn(hex: string): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const channels = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  return luminance > 0.45 ? '#26221c' : '#ffffff';
}

/** 色系：从 hex 色相自动推导，无需在 frontmatter 里维护 */
export const FAMILY_ORDER = [
  'red', 'orange', 'yellow', 'green', 'cyan', 'blue',
  'purple', 'pink', 'brown', 'gray', 'white', 'black',
] as const;

export const FAMILY_NAMES: Record<string, string> = {
  red: '红', orange: '橙', yellow: '黄', green: '绿', cyan: '青', blue: '蓝',
  purple: '紫', pink: '粉', brown: '棕', gray: '灰', white: '白', black: '黑',
};

/** hex -> HSL 色相/饱和度/亮度（0-1） */
function hexToHsl(hex: string): { h: number; s: number; l: number; c: number } {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const c = max - min;
  const s = c === 0 ? 0 : c / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (c !== 0) {
    if (max === r) h = 60 * (((g - b) / c) % 6);
    else if (max === g) h = 60 * ((b - r) / c + 2);
    else h = 60 * ((r - g) / c + 4);
    if (h < 0) h += 360;
  }
  return { h, s, l, c };
}

export function colorFamily(hex: string): string {
  const { h, s, l, c } = hexToHsl(hex);
  // 用色度而非 HSL 饱和度判断无彩色：HSL 饱和度在接近黑白时会失真
  if (c < 0.045) {
    if (l >= 0.88) return 'white';
    if (l <= 0.16) return 'black';
    return 'gray';
  }
  // 低明度的红橙色相归为棕
  if (l < 0.38 && h >= 15 && h < 55) return 'brown';
  if (h < 15 || h >= 345) return 'red';
  if (h < 45) return 'orange';
  if (h < 70) return 'yellow';
  if (h < 160) return 'green';
  if (h < 200) return 'cyan';
  if (h < 255) return 'blue';
  if (h < 300) return 'purple';
  return 'pink';
}

export interface FamilyGroup<T> {
  key: string;
  name: string;
  colors: T[];
}

/** 把颜色列表按色系分组，组顺序按色环排列，空色系不出现 */
export function groupByFamily<T extends { data: { hex: string } }>(
  colors: T[],
): FamilyGroup<T>[] {
  const map = new Map<string, T[]>();
  for (const c of colors) {
    const key = colorFamily(c.data.hex);
    const bucket = map.get(key);
    if (bucket) bucket.push(c);
    else map.set(key, [c]);
  }
  return FAMILY_ORDER.filter((key) => map.has(key)).map((key) => ({
    key,
    name: FAMILY_NAMES[key],
    colors: map.get(key)!,
  }));
}
