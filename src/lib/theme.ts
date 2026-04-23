// ============================================================
// White-label theming — applies agency brand color via CSS vars
// ============================================================

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.exec(hex);
  if (!m) return null;
  const h = m[1];
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function mix(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }, t: number) {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

function rgbStr({ r, g, b }: { r: number; g: number; b: number }) {
  return `rgb(${r} ${g} ${b})`;
}

/**
 * Apply an agency's brand color to CSS custom properties on the document root.
 * Fallback to default green if the color is invalid.
 */
export function applyBrand(color: string | undefined) {
  const root = document.documentElement;
  const defaultBrand = '#1a7a3c';
  const target = color && hexToRgb(color) ? color : defaultBrand;
  const rgb = hexToRgb(target)!;
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 10, g: 20, b: 15 };

  root.style.setProperty('--brand', target);
  root.style.setProperty('--brand-50', rgbStr(mix(rgb, white, 0.9)));
  root.style.setProperty('--brand-100', rgbStr(mix(rgb, white, 0.8)));
  root.style.setProperty('--brand-200', rgbStr(mix(rgb, white, 0.6)));
  root.style.setProperty('--brand-600', target);
  root.style.setProperty('--brand-700', rgbStr(mix(rgb, black, 0.15)));
  root.style.setProperty('--brand-800', rgbStr(mix(rgb, black, 0.35)));
}

export function resetBrand() {
  applyBrand(undefined);
}
