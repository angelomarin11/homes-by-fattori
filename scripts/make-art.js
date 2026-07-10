// Bakes stylised stages (pencil SKETCH + painted DRAWING) from house photos,
// as static PNGs (zero runtime cost). Run: node scripts/make-art.js
const sharp = require("sharp");
const path = require("path");

const dir = path.join(__dirname, "..", "public", "images");
const W = 900;

// [source file, output slug]
const JOBS = [
  ["facade-a.jpg", "facade-a"],
  ["facade-b.jpg", "facade-b"],
  ["facade-c.jpg", "facade-c"],
  ["home.jpg", "home"],
];

async function process(srcFile, slug) {
  const base = sharp(path.join(dir, srcFile)).resize(W).removeAlpha();

  // Stage 2 — pencil sketch (color-dodge), deepened so it reads confidently
  const gray = await base.clone().grayscale().toBuffer();
  const invBlur = await sharp(gray).negate().blur(11).toBuffer();
  const sketchBuf = await sharp(gray)
    .composite([{ input: invBlur, blend: "colour-dodge" }])
    .linear(1.35, -42)
    .toBuffer();
  const meta = await sharp(sketchBuf).metadata();
  await sharp(sketchBuf).png().toFile(path.join(dir, `${slug}-sketch.png`));

  // Crisp ink outlines (Laplacian) for the painted stage
  const edges = await base
    .clone()
    .grayscale()
    .blur(0.5)
    .convolve({ width: 3, height: 3, kernel: [0, -1, 0, -1, 4, -1, 0, -1, 0] })
    .linear(9, 0)
    .negate()
    .median(2)
    .toBuffer();

  // Stage 3 — painted (watercolour washes + ink linework)
  const wash = await base
    .clone()
    .median(14) // big flat painterly washes, not photographic detail
    .modulate({ saturation: 1.55, brightness: 1.1 })
    .blur(1.4) // soft bleeding edges
    .linear(0.82, 40) // translucent, paper showing through
    .toBuffer();
  const pencil = await sharp(sketchBuf).linear(1.2, -26).toBuffer();
  await sharp(wash)
    .resize(meta.width, meta.height)
    .composite([
      { input: pencil, blend: "multiply" },
      { input: edges, blend: "multiply" },
    ])
    .png()
    .toFile(path.join(dir, `${slug}-painted.png`));

  console.log("  ok", slug);
}

(async () => {
  for (const [src, slug] of JOBS) {
    try {
      await process(src, slug);
    } catch (e) {
      console.error("  ERR", slug, e.message);
    }
  }
  console.log("done");
})();
