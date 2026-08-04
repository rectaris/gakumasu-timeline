import path from "node:path";
import { runnerImport } from "vite";

const { module } = await runnerImport("/src/data/integrityRunner.js", {
  logLevel: "error",
});

const { runTimelineDataIntegrityValidation } = module;
const targetPaths = process.argv.slice(2).map((targetPath) => {
  const relativePath = path.isAbsolute(targetPath)
    ? path.relative(process.cwd(), targetPath)
    : targetPath;

  return relativePath.split(path.sep).join("/");
});
const result = runTimelineDataIntegrityValidation({ targetPaths });

console.log(result.message);

if (!result.ok) {
  process.exitCode = 1;
}
