import { cp, mkdir, readFile, rm } from "node:fs/promises";
import { resolve } from "node:path";

const repositoryRoot = resolve(import.meta.dirname, "..");
const sourceDirectory = resolve(repositoryRoot, "dist");
const outputDirectory = resolve(repositoryRoot, ".cloudflare-assets");
const mountedDirectory = resolve(
  outputDirectory,
  "gakumastool",
  "timeline",
);

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(mountedDirectory, { recursive: true });
await cp(sourceDirectory, mountedDirectory, { recursive: true });

const indexPath = resolve(mountedDirectory, "index.html");
const indexHtml = await readFile(indexPath, "utf8");
const expectedAssetPrefix = "/gakumastool/timeline/assets/";

if (!indexHtml.includes(expectedAssetPrefix)) {
  throw new Error(
    `Cloudflare artifact does not reference ${expectedAssetPrefix}`,
  );
}

if (indexHtml.includes('src="/timeline/assets/')) {
  throw new Error("Cloudflare artifact still references the legacy asset path");
}

console.log(
  "Prepared .cloudflare-assets/gakumastool/timeline for curiretas.com.",
);
