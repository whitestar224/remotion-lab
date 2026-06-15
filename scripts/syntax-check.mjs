import { readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const files = readdirSync(root)
  .filter((file) => file.endsWith(".tsx"))
  .sort();

if (files.length === 0) {
  console.log("No TSX files found.");
  process.exit(0);
}

const contents = files.map((file) => `import ${JSON.stringify(`./${file}`)};`).join("\n");

await build({
  stdin: {
    contents,
    resolveDir: root,
    sourcefile: "syntax-check.ts",
    loader: "ts",
  },
  bundle: true,
  write: false,
  format: "esm",
  platform: "browser",
  jsx: "transform",
  external: ["react", "remotion"],
  logLevel: "info",
});

console.log(`Syntax check passed for ${files.length} TSX files.`);
