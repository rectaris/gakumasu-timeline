const VALID_OCCURRENCE_TYPES = new Set(["continuous", "singleWithinRange"]);
const ARRAY_FIELDS = ["source", "note", "participants", "worldlineId"];

function eventLabel(event) {
  if (!event || typeof event !== "object") {
    return "(invalid event)";
  }

  return event.id || event.title || "(untitled event)";
}

function dayValue(date, fallbackDay) {
  return (date.year * 12 + (date.month - 1)) * 31 + (date.day ?? fallbackDay) - 1;
}

function isInteger(value) {
  return Number.isInteger(value);
}

function createError(entry, event, eventIndex, field, reason) {
  return {
    sourceFile: entry.sourceFile,
    category: entry.category,
    laneId: entry.lane?.id ?? "(missing lane id)",
    laneName: entry.lane?.name ?? entry.lane?.title ?? entry.lane?.label ?? "",
    eventId: event?.id ?? "",
    eventTitle: event?.title ?? "",
    eventIndex,
    field,
    reason,
  };
}

function createDuplicateIdError(occurrence, firstOccurrence) {
  const otherOccurrence =
    occurrence === firstOccurrence ? occurrence.duplicates[0] : firstOccurrence;
  const relation = occurrence === firstOccurrence ? "also seen at" : "first seen at";

  return createError(
    occurrence.entry,
    occurrence.event,
    occurrence.eventIndex,
    "id",
    `duplicate event id "${occurrence.event.id}"; ${relation} ${otherOccurrence.entry.sourceFile} / ${otherOccurrence.entry.lane?.id ?? "(missing lane id)"} / ${eventLabel(otherOccurrence.event)}`,
  );
}

function validateDate(entry, event, eventIndex, field, errors) {
  const date = event?.[field];

  if (!date || typeof date !== "object" || Array.isArray(date)) {
    errors.push(createError(entry, event, eventIndex, field, "must be an object"));
    return false;
  }

  let valid = true;

  if (!isInteger(date.year)) {
    errors.push(
      createError(entry, event, eventIndex, `${field}.year`, "must be an integer"),
    );
    valid = false;
  }

  if (!isInteger(date.month) || date.month < 1 || date.month > 12) {
    errors.push(
      createError(
        entry,
        event,
        eventIndex,
        `${field}.month`,
        "must be an integer from 1 to 12",
      ),
    );
    valid = false;
  }

  if (
    date.day !== undefined &&
    (!isInteger(date.day) || date.day < 1 || date.day > 31)
  ) {
    errors.push(
      createError(
        entry,
        event,
        eventIndex,
        `${field}.day`,
        "must be an integer from 1 to 31 when present",
      ),
    );
    valid = false;
  }

  return valid;
}

function validateStringArrayField(entry, event, eventIndex, field, errors) {
  const value = event?.[field];

  if (value === undefined) {
    return;
  }

  if (!Array.isArray(value)) {
    errors.push(createError(entry, event, eventIndex, field, "must be an array"));
    return;
  }

  value.forEach((item, itemIndex) => {
    if (typeof item !== "string") {
      errors.push(
        createError(
          entry,
          event,
          eventIndex,
          `${field}[${itemIndex}]`,
          "must be a string",
        ),
      );
      return;
    }

    if (item.trim() === "") {
      errors.push(
        createError(
          entry,
          event,
          eventIndex,
          `${field}[${itemIndex}]`,
          "must not be empty",
        ),
      );
    }
  });
}

function validateReferences(entry, event, eventIndex, field, allowedIds, errors) {
  const value = event?.[field];

  if (!Array.isArray(value)) {
    return;
  }

  value.forEach((item, itemIndex) => {
    if (typeof item !== "string" || item.trim() === "") {
      return;
    }

    if (!allowedIds.has(item)) {
      errors.push(
        createError(
          entry,
          event,
          eventIndex,
          `${field}[${itemIndex}]`,
          `unknown id "${item}"`,
        ),
      );
    }
  });
}

export function validateTimelineData(
  entries,
  { characterIds, worldlineIds, focusSourceFiles = null },
) {
  const errors = [];
  const eventIdOccurrences = new Map();
  const shouldReportEntry = (entry) =>
    !focusSourceFiles || focusSourceFiles.has(entry.sourceFile);

  entries.forEach((entry) => {
    const entryErrors = shouldReportEntry(entry) ? errors : [];
    const events = entry.lane?.events;

    if (!Array.isArray(events)) {
      entryErrors.push(
        createError(entry, entry.lane, -1, "events", "must be an array"),
      );
      return;
    }

    events.forEach((event, eventIndex) => {
      if (!event || typeof event !== "object" || Array.isArray(event)) {
        entryErrors.push(
          createError(entry, event, eventIndex, "event", "must be an object"),
        );
        return;
      }

      if (event.id !== undefined) {
        if (typeof event.id !== "string" || event.id.trim() === "") {
          entryErrors.push(
            createError(
              entry,
              event,
              eventIndex,
              "id",
              "must be a non-empty string when present",
            ),
          );
        } else {
          const occurrences = eventIdOccurrences.get(event.id) ?? [];
          occurrences.push({
            entry,
            event,
            eventIndex,
          });
          eventIdOccurrences.set(event.id, occurrences);
        }
      }

      const startValid = validateDate(
        entry,
        event,
        eventIndex,
        "start",
        entryErrors,
      );
      const endValid = validateDate(entry, event, eventIndex, "end", entryErrors);

      if (
        startValid &&
        endValid &&
        dayValue(event.start, 1) > dayValue(event.end, 31)
      ) {
        entryErrors.push(
          createError(
            entry,
            event,
            eventIndex,
            "start",
            "must be less than or equal to end",
          ),
        );
      }

      if (event.occurrenceType === undefined) {
        entryErrors.push(
          createError(
            entry,
            event,
            eventIndex,
            "occurrenceType",
            "must be explicit",
          ),
        );
      } else if (!VALID_OCCURRENCE_TYPES.has(event.occurrenceType)) {
        entryErrors.push(
          createError(
            entry,
            event,
            eventIndex,
            "occurrenceType",
            'must be "continuous" or "singleWithinRange"',
          ),
        );
      }

      ARRAY_FIELDS.forEach((field) => {
        validateStringArrayField(entry, event, eventIndex, field, entryErrors);
      });

      validateReferences(
        entry,
        event,
        eventIndex,
        "participants",
        characterIds,
        entryErrors,
      );
      validateReferences(
        entry,
        event,
        eventIndex,
        "worldlineId",
        worldlineIds,
        entryErrors,
      );
    });
  });

  eventIdOccurrences.forEach((occurrences) => {
    if (occurrences.length < 2) {
      return;
    }

    const [firstOccurrence, ...duplicateOccurrences] = occurrences;
    firstOccurrence.duplicates = duplicateOccurrences;

    if (focusSourceFiles) {
      occurrences
        .filter((occurrence) => shouldReportEntry(occurrence.entry))
        .forEach((occurrence) => {
          errors.push(createDuplicateIdError(occurrence, firstOccurrence));
        });
      return;
    }

    duplicateOccurrences.forEach((occurrence) => {
      errors.push(createDuplicateIdError(occurrence, firstOccurrence));
    });
  });

  return errors;
}

export function formatTimelineDataIntegrityErrors(errors) {
  if (errors.length === 0) {
    return "Timeline data integrity check passed.";
  }

  return errors
    .map((error, index) => {
      const eventParts = [
        `id=${error.eventId || "(missing)"}`,
        `title=${error.eventTitle || "(untitled)"}`,
        `index=${error.eventIndex}`,
      ].join(", ");

      return [
        `${index + 1}. ${error.sourceFile}`,
        `   category: ${error.category}`,
        `   lane: ${error.laneId}${error.laneName ? ` (${error.laneName})` : ""}`,
        `   event: ${eventParts}`,
        `   field: ${error.field}`,
        `   reason: ${error.reason}`,
      ].join("\n");
    })
    .join("\n\n");
}
