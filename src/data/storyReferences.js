function compareReferenceRecords(a, b) {
  return (
    (a.order ?? Number.MAX_SAFE_INTEGER) -
      (b.order ?? Number.MAX_SAFE_INTEGER) ||
    a.eventTitle.localeCompare(b.eventTitle, "ja") ||
    a.eventId.localeCompare(b.eventId, "en") ||
    a.referenceId.localeCompare(b.referenceId, "en")
  );
}

export function buildStoryReferenceIndex(entries = []) {
  const index = {};

  entries.forEach((entry) => {
    const lane = entry?.lane;
    if (!Array.isArray(lane?.events)) return;

    lane.events.forEach((event) => {
      if (!Array.isArray(event?.storyReferences)) return;
      event.storyReferences.forEach((reference) => {
        if (!reference?.storyBlockId) return;
        const record = {
          referenceId: reference.id,
          type: reference.type,
          label: reference.label,
          note: reference.note,
          order: reference.order,
          sourceView: "narrative",
          eventId: event.id,
          eventTitle: event.title,
          laneId: lane.id,
          laneName: lane.name,
          sourceFile: entry.sourceFile,
        };
        Object.keys(record).forEach((key) => {
          if (record[key] === undefined) delete record[key];
        });
        (index[reference.storyBlockId] ??= []).push(record);
      });
    });
  });

  Object.values(index).forEach((records) => records.sort(compareReferenceRecords));
  return Object.fromEntries(
    Object.entries(index).sort(([blockIdA], [blockIdB]) =>
      blockIdA.localeCompare(blockIdB, "en"),
    ),
  );
}

export function storyReferenceMap(referenceIndex = {}) {
  return new Map(
    Object.entries(referenceIndex).map(([blockId, records]) => [
      blockId,
      Array.isArray(records) ? records : [],
    ]),
  );
}
