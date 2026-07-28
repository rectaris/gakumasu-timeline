import { performance } from "node:perf_hooks";
import {
  collectStoryGraphErrors,
  normalizeStoryGraphData,
} from "../src/data/storyGraphModel.js";
import { layoutStoryGraph } from "../src/utils/storyGraph.js";
import { createScaleStoryGraphFixture } from "../tests/fixtures/storyGraphFixtures.js";

const sizes = [50, 100, 300];
const runsPerSize = 7;
const results = sizes.map((nodeCount) => {
  const fixture = createScaleStoryGraphFixture(nodeCount);
  const errors = collectStoryGraphErrors(fixture);
  if (errors.length) {
    throw new Error(
      `Scale fixture ${nodeCount} is invalid:\n${errors.join("\n")}`,
    );
  }

  const graph = normalizeStoryGraphData(fixture);
  const durations = [];
  let layout = null;
  for (let index = 0; index < runsPerSize; index += 1) {
    const startedAt = performance.now();
    layout = layoutStoryGraph(graph.blocks, graph.edges);
    durations.push(performance.now() - startedAt);
  }
  durations.sort((a, b) => a - b);

  return {
    nodeCount,
    edgeCount: graph.edges.length,
    width: layout.width,
    height: layout.height,
    isolatedCount: layout.isolatedCount,
    medianLayoutMs: Number(durations[Math.floor(durations.length / 2)].toFixed(3)),
    maxLayoutMs: Number(Math.max(...durations).toFixed(3)),
  };
});

console.log(
  JSON.stringify(
    {
      fixture: "test-only layered sequence graph",
      runsPerSize,
      results,
    },
    null,
    2,
  ),
);
