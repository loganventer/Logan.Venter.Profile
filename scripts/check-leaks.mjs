// Scans the published files for terms that must never appear on the public site.
// The terms live in .leak-denylist (one per line, not committed), because the
// list itself would give the names away. Lines starting with # are comments.
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { dirname, extname, join, relative } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const denylistPath = join(root, ".leak-denylist");
const scanned = [".html", ".mjs", ".js", ".css", ".md", ".json", ".toml", ".txt", ".svg"];
const skipped = ["node_modules", ".git", ".netlify", "package-lock.json", "rag-data.mjs"];

if (!existsSync(denylistPath)) {
  console.log("check-leaks: no .leak-denylist file found, nothing to check.");
  process.exit(0);
}

const terms = readFileSync(denylistPath, "utf-8")
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"));

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const patterns = terms.map((term) => ({
  term,
  regex: new RegExp("(^|[^A-Za-z0-9])" + escapeRegex(term) + "($|[^A-Za-z0-9])"),
}));

function listFiles(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    if (skipped.includes(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) files.push(...listFiles(full));
    else if (scanned.includes(extname(name))) files.push(full);
  }
  return files;
}

const hits = [];
for (const file of listFiles(root)) {
  const lines = readFileSync(file, "utf-8").split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const { term, regex } of patterns) {
      if (regex.test(line)) hits.push(`${relative(root, file)}:${index + 1}: "${term}"`);
    }
  });
}

if (hits.length > 0) {
  console.error(`check-leaks: ${hits.length} match(es) found:`);
  for (const hit of hits) console.error("  " + hit);
  process.exit(1);
}
console.log(`check-leaks: clean (${terms.length} terms checked).`);
