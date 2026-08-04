import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  GENERATED_DATA_FILES,
  renderGeneratedFile,
} from "../scripts/generate-data.mjs";

describe("generated data", () => {
  it("matches deterministic generator output", async () => {
    await Promise.all(
      GENERATED_DATA_FILES.map(async (file) => {
        const [actual, expected] = await Promise.all([
          fs.readFile(file.generated, "utf8"),
          renderGeneratedFile(file),
        ]);

        expect(actual).toBe(expected);
      }),
    );
  });
});
