import { randomUUID } from "node:crypto";

const prefixes = {
  series: "series",
  block: "block",
  edge: "edge",
  ref: "ref",
};

const requestedType = process.argv[2];
const prefix = prefixes[requestedType];

if (!prefix) {
  console.error("Usage: npm run story:id -- <series|block|edge|ref>");
  process.exitCode = 1;
} else {
  console.log(`${prefix}_${randomUUID()}`);
}
