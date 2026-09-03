// lib/barcode.ts
// Lightweight Code 128-B Barcode to SVG Generator for Thermal Shipping Labels

const CODE128_PATTERNS: string[] = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213", // 0-9
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132", // 10-19
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211", // 20-29
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313", // 30-39
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331", // 40-49
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111", // 50-59
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214", // 60-69
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111", // 70-79
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141", // 80-89
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141", // 90-99
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112" // 100-106 (106 is STOP)
];

const START_B = 104;
const STOP = 106;

/**
 * Encodes an ASCII string into Code 128B module widths (1s for black bars, 0s for white spaces)
 */
export function encodeCode128B(text: string): number[] {
  const cleanText = text.replace(/[^\x20-\x7E]/g, ""); // Keep valid ASCII
  if (!cleanText) return [];

  const codes: number[] = [START_B];
  let checksum = START_B;

  for (let i = 0; i < cleanText.length; i++) {
    const code = cleanText.charCodeAt(i) - 32;
    codes.push(code);
    checksum += code * (i + 1);
  }

  const checkCode = checksum % 103;
  codes.push(checkCode);
  codes.push(STOP);

  // Convert codes to modules (1 for bar, 0 for space)
  const modules: number[] = [];
  codes.forEach((code) => {
    const pattern = CODE128_PATTERNS[code];
    if (!pattern) return;
    for (let i = 0; i < pattern.length; i++) {
      const width = parseInt(pattern[i], 10);
      const isBar = i % 2 === 0 ? 1 : 0;
      for (let w = 0; w < width; w++) {
        modules.push(isBar);
      }
    }
  });

  return modules;
}

/**
 * Generates an SVG string representation of a Code 128 barcode
 */
export function generateBarcodeSvg(
  text: string,
  options: {
    height?: number;
    moduleWidth?: number;
    showText?: boolean;
  } = {}
): string {
  const { height = 40, moduleWidth = 1.2, showText = true } = options;
  const modules = encodeCode128B(text);
  if (!modules.length) return "";

  const totalWidth = modules.length * moduleWidth;
  const svgHeight = showText ? height + 12 : height;

  let rects = "";
  let x = 0;
  for (let i = 0; i < modules.length; i++) {
    if (modules[i] === 1) {
      rects += `<rect x="${x.toFixed(2)}" y="0" width="${moduleWidth.toFixed(2)}" height="${height}" fill="#000000" />`;
    }
    x += moduleWidth;
  }

  const textSvg = showText
    ? `<text x="${(totalWidth / 2).toFixed(2)}" y="${height + 10}" font-family="monospace" font-size="9" font-weight="bold" text-anchor="middle" fill="#000000">${text}</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth.toFixed(2)} ${svgHeight}" width="100%" height="${svgHeight}" preserveAspectRatio="xMidYMid meet">${rects}${textSvg}</svg>`;
}
