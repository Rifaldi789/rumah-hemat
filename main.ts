// Rumah Hemat — hand-in program (Node 22 stdlib only).
// Copies app/ and screenshots/ into the output directory and writes
// /output/dossier.json with buildDossier from vendor/makefun-frontend.ts.
// Running it twice writes identical bytes.
import {
  DOSSIER_MAX_BYTES,
  buildDossier,
} from "./vendor/makefun-frontend.ts";
import {
  cpSync,
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";

const repoRoot = resolve(new URL(".", import.meta.url).pathname);
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR || "/output");

function fail(message: string): never {
  console.error("main.ts: " + message);
  process.exit(1);
}

const appDir = join(repoRoot, "app");
const shotsDir = join(repoRoot, "screenshots");
if (!existsSync(appDir)) fail("app/ tidak ditemukan di " + repoRoot);
if (!existsSync(shotsDir)) fail("screenshots/ tidak ditemukan di " + repoRoot);

// Start from a clean output directory so a second run cannot leave stale files.
rmSync(outDir, { recursive: true, force: true });
mkdirSync(join(outDir, "app"), { recursive: true });
mkdirSync(join(outDir, "screenshots"), { recursive: true });
cpSync(appDir, join(outDir, "app"), { recursive: true });
cpSync(shotsDir, join(outDir, "screenshots"), { recursive: true });

// buildDossier returns the dossier.json bytes (Uint8Array): write them as-is
// so two runs produce identical bytes.
const dossier = buildDossier(outDir, {
  text_max_bytes: DOSSIER_MAX_BYTES,
});
writeFileSync(join(outDir, "dossier.json"), dossier);

console.log("Wrote " + join(outDir, "dossier.json"));
