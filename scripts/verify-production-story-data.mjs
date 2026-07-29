import fs from "node:fs/promises";
import path from "node:path";

const DIST_ROOT = "dist";
const PROHIBITED_MARKERS = [
  "story-graph-pilot",
  "block_20000000-0000-4000-8000-000000000001",
  "edge_30000000-0000-4000-8000-000000000001",
];
const REQUIRED_MARKER = "story-graph-published";

async function collectFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? collectFiles(entryPath) : [entryPath];
    }),
  );
  return nested.flat();
}

const files = await collectFiles(DIST_ROOT);
const contents = await Promise.all(
  files.map(async (file) => ({
    file,
    content: await fs.readFile(file, "utf8"),
  })),
);

const leaks = [];
contents.forEach(({ file, content }) => {
  PROHIBITED_MARKERS.forEach((marker) => {
    if (content.includes(marker)) leaks.push(`${file}: ${marker}`);
  });
});

if (leaks.length) {
  throw new Error(
    `Production assets contain unreviewed story data:\n${leaks
      .map((leak) => `- ${leak}`)
      .join("\n")}`,
  );
}

if (!contents.some(({ content }) => content.includes(REQUIRED_MARKER))) {
  throw new Error("Production assets do not contain the published story dataset.");
}

console.log("Production story publication boundary check passed.");
