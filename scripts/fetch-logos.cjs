// Downloads vendor favicons (for vendors without a simple-icons glyph) into public/logos/.
// Run once: node scripts/fetch-logos.cjs — then commit the PNGs.
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { logoSources } = require("../.tmp-logos.cjs");
const out = path.join(__dirname, "..", "public", "logos");
fs.mkdirSync(out, { recursive: true });
let n = 0;
for (const [slug, src] of Object.entries(logoSources)) {
  if (src.path) continue;
  const file = path.join(out, `${slug}.png`);
  const url = `https://www.google.com/s2/favicons?domain=${src.domain}&sz=256`;
  try {
    execFileSync("curl", ["-sL", "--max-time", "30", "-A", "Mozilla/5.0", url, "-o", file]);
    const size = fs.statSync(file).size;
    if (size < 200) throw new Error("empty");
    n++;
    console.log("ok", slug, size + "B");
  } catch (e) {
    console.log("FAIL", slug, e.message);
  }
}
console.log("fetched", n);
