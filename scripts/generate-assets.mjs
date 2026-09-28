/**
 * Regenerates the app icon, adaptive icon and splash mark.
 *
 *   node scripts/generate-assets.mjs
 *
 * The mark is a stand-in: a sky-blue rounded square carrying a white departure
 * glyph, which is the mobile equivalent of the `flight_takeoff` tile in the
 * Stitch sidebar. Swap `assets/icon.png` (and its siblings) for the real brand
 * art when the design team delivers it; nothing else references these files
 * except `app.json`.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { PNG } from "pngjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PRIMARY = [0x00, 0x59, 0xbb];
const WHITE = [0xff, 0xff, 0xff];

function canvas(size) {
  return new PNG({ width: size, height: size });
}

function blend(target, x, y, [r, g, b], alpha) {
  if (alpha <= 0 || x < 0 || y < 0 || x >= target.width || y >= target.height) return;
  const at = (target.width * y + x) << 2;
  const a = Math.min(1, alpha);
  target.data[at] = Math.round(target.data[at] * (1 - a) + r * a);
  target.data[at + 1] = Math.round(target.data[at + 1] * (1 - a) + g * a);
  target.data[at + 2] = Math.round(target.data[at + 2] * (1 - a) + b * a);
  target.data[at + 3] = Math.max(target.data[at + 3], Math.round(255 * a));
}

/** Signed distance to a rounded square, used as a cheap antialiased mask. */
function roundedSquare(x, y, cx, cy, half, radius) {
  const dx = Math.abs(x - cx) - (half - radius);
  const dy = Math.abs(y - cy) - (half - radius);
  const outside = Math.hypot(Math.max(dx, 0), Math.max(dy, 0));
  return Math.min(Math.max(dx, dy), 0) + outside - radius;
}

/** Signed distance to a triangle, used for the swept wing. */
function triangle(px, py, [ax, ay], [bx, by], [cx, cy]) {
  const side = (x1, y1, x2, y2, x, y) => (x2 - x1) * (y - y1) - (y2 - y1) * (x - x1);
  const d1 = side(ax, ay, bx, by, px, py);
  const d2 = side(bx, by, cx, cy, px, py);
  const d3 = side(cx, cy, ax, ay, px, py);
  const inside = d1 >= 0 && d2 >= 0 && d3 >= 0 || d1 <= 0 && d2 <= 0 && d3 <= 0;
  if (inside) return -1;
  const edge = (x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  };
  return Math.min(edge(ax, ay, bx, by), edge(bx, by, cx, cy), edge(cx, cy, ax, ay));
}

function drawMark(size, { transparentBackground = false, scale = 1 } = {}) {
  const png = canvas(size);
  png.data.fill(0);

  const centre = size / 2;
  const half = (size * 0.44) / scale;
  const corner = size * 0.22;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const px = x + 0.5;
      const py = y + 0.5;
      const plate = roundedSquare(px, py, centre, centre, half, corner);
      blend(png, x, y, PRIMARY, Math.min(1, Math.max(0, 0.5 - plate)));

      if (transparentBackground) continue;

      // Wing: a triangle tilted into a climb, plus a shorter tail wing.
      const u = size * 0.075;
      const wing = triangle(
        px,
        py,
        [centre - u * 1.5, centre - u * 0.1],
        [centre + u * 1.9, centre - u * 1.35],
        [centre - u * 0.2, centre + u * 0.95],
      );
      const tail = triangle(
        px,
        py,
        [centre - u * 1.6, centre + u * 0.35],
        [centre - u * 0.15, centre + u * 0.6],
        [centre - u * 0.2, centre + u * 1.15],
      );
      const lift = Math.min(0.5 - wing, 0.5 - tail);
      blend(png, x, y, WHITE, Math.min(1, Math.max(0, lift)));
    }
  }
  return png;
}

function write(relativePath, png) {
  const target = resolve(root, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, PNG.sync.write(png));
  console.log(`wrote ${relativePath} (${png.width}x${png.height})`);
}

write("assets/icon.png", drawMark(1024));
write("assets/adaptive-icon.png", drawMark(1024, { scale: 0.72 }));
write("assets/splash-icon.png", drawMark(512));
write("assets/favicon.png", drawMark(64));
