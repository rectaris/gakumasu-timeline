import {
  formatTimelineDataIntegrityErrors,
  validateTimelineData,
} from "../src/data/integrity.js";
import { worldlines } from "../src/data/worldlines.js";

function validationEntriesForState(state) {
  return state.lanes.map((entry) => ({
    category: entry.category,
    sourceFile: entry.sourceFile,
    lane: entry.lane,
  }));
}

function validationResult(errors) {
  return {
    ok: errors.length === 0,
    errors,
    message: formatTimelineDataIntegrityErrors(errors),
  };
}

function requiredStringError(entry, event, field) {
  return {
    sourceFile: entry.sourceFile,
    category: entry.category,
    laneId: entry.lane.id,
    laneName: entry.lane.name,
    eventId: typeof event?.id === "string" ? event.id : "",
    eventTitle: typeof event?.title === "string" ? event.title : "",
    eventIndex: 0,
    field,
    reason: "must be a non-empty string",
  };
}

export function validateWorldlineEditorState(state, focusSourceFiles = []) {
  const characterIds = new Set(
    state.lanes
      .filter((entry) => entry.category === "idolCommu")
      .map((entry) => entry.lane.id),
  );
  const focusSourceFileSet = focusSourceFiles.length
    ? new Set(focusSourceFiles)
    : null;
  return validationResult(
    validateTimelineData(validationEntriesForState(state), {
      characterIds,
      worldlineIds: new Set(worldlines.map((worldline) => worldline.id)),
      focusSourceFiles: focusSourceFileSet,
    }),
  );
}

export function validateTimelineContribution(payload, catalog) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, errors: [], message: "Request payload must be an object." };
  }

  const lane = catalog.lanes.find((candidate) => candidate.id === payload.targetLaneId);
  if (!lane) {
    return { ok: false, errors: [], message: "The target timeline lane does not exist." };
  }

  const event = payload.event;
  if (!event || typeof event !== "object" || Array.isArray(event)) {
    return { ok: false, errors: [], message: "The proposed event must be an object." };
  }

  const proposalSourceFile = `${lane.sourceFile}#proposal`;
  const proposalEntry = {
    category: lane.category,
    sourceFile: proposalSourceFile,
    lane: { id: lane.id, name: lane.name, events: [event] },
  };
  const catalogEntries = catalog.lanes.map((catalogLane) => ({
    category: catalogLane.category,
    sourceFile: catalogLane.sourceFile,
    lane: {
      id: catalogLane.id,
      name: catalogLane.name,
      events: catalogLane.eventIds.map((id) => ({ id })),
    },
  }));
  const errors = validateTimelineData([...catalogEntries, proposalEntry], {
    characterIds: new Set(
      catalog.lanes
        .filter((catalogLane) => catalogLane.category === "idolCommu")
        .map((catalogLane) => catalogLane.id),
    ),
    worldlineIds: new Set(catalog.worldlineIds),
    focusSourceFiles: new Set([proposalSourceFile]),
  });

  for (const field of ["id", "title", "detail"]) {
    if (typeof event[field] !== "string" || event[field].trim() === "") {
      errors.push(requiredStringError(proposalEntry, event, field));
    }
  }

  return validationResult(errors);
}
