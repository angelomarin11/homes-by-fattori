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

  // Stage 2 — pencil sketch (color-dodge)
  const gray = await base.clone().grayscale().toBuffer();
  const invBlur = await sharp(gray).negate().blur(12).toBuffer();
  const sketchBuf = await sharp(gray)
    .composite([{ input: invBlur, blend: "colour-dodge" }])
    .linear(1.15, -18)
    .toBuffer();
  await sharp(sketchBuf).png().toFile(path.join(dir, `${slug}-sketch.png`));

  // Stage 3 — painted (pale watercolour wash + pencil shading)
  const meta = await sharp(sketchBuf).metadata();
  const wash = await base
    .clone()
    .median(9)
    .modulate({ saturation: 1.4 })
    .linear(0.72, 64)
    .toBuffer();
  const pencil = await sharp(sketchBuf).linear(1.35, -34).toBuffer();
  await sharp(wash)
    .resize(meta.width, meta.height)
    .composite([{ input: pencil, blend: "multiply" }])
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
