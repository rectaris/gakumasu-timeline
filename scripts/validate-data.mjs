import { runnerImport } from "vite";

const { module } = await runnerImport("/src/data/integrityRunner.js", {
  logLevel: "error",
});

const { runTimelineDataIntegrityValidation } = module;
const result = runTimelineDataIntegrityValidation();

console.log(result.message);

if (!result.ok) {
  process.exitCode = 1;
}
