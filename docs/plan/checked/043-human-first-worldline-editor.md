# Human-First Worldline Data Editor

status: active
task_type: product_logic
review_class: C
human_design_required: yes
human_approval_status: approved
target_files:
  - data/raw/worldline_commu/
  - src/data/generated/worldline_commu/
  - scripts/generate-data.mjs
  - scripts/validate-data.mjs
  - src/data/integrity.js
  - src/data/integrityRunner.js
  - src/data/index.js
  - src/components/
  - src/composables/
  - docs/data-structure.md
  - docs/processing-flow.md
  - docs/ui-behavior.md
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_ENVIRONMENT.md
  - docs/agent/SPEC_UI_DESIGN.md
validation:
  - npm run validate:data
  - npm run test
  - npm run build
  - browser verification for editor add/edit/delete/move flows
  - git diff --check
  - python3 scripts/lint-plan-docs.py
  - python3 scripts/validate-changes.py
acceptance:
  - Humans can add, edit, delete, duplicate, and move worldline events without directly editing JSON syntax.
  - Existing event edits are keyed by stable event IDs and preserve unrelated lane data.
  - The editor provides searchable lane and event navigation, structured forms, validation feedback, and timeline preview before save.
  - The save flow produces deterministic raw data changes and keeps generated data fresh through the existing pipeline or a documented replacement.
  - Risky operations such as ID changes, lane moves, deletes, and source-of-truth migration require explicit confirmation and visible diff preview.
  - Existing shared URL compatibility, canonical IDs, date uncertainty semantics, source metadata, and timeline interaction behavior remain protected.
acceptance_focus:
  - human editing experience
  - existing-event modification
  - deterministic raw data updates
expected_output: implementation
checked_summary_ja: 人間が直接 JSON を編集しない worldline データ編集基盤を設計する。

## Decision Context

The user has selected human editing experience as the top priority and asked to ignore implementation cost.

The plan therefore treats the best target as a local editor experience rather than a lighter file-format change.
The editor must cover both new file addition and edits inside existing data files because normal maintenance includes correcting existing events, moving events between lanes, refining source evidence, and deleting obsolete entries.

The user approved the recommended direction and requested development work.
Implementation is approved for a staged local editor that protects the current runtime data contract.

## Approved Direction

- Use a local Vite dev-server editor with a local-only write API.
- Support direct save to raw files and patch/diff review as separate surfaces.
- Prefer one-event-per-file YAML as the long-term source-of-truth direction.
- Start implementation against the current raw JSON format to avoid mixing editor UX work with a broad data migration.
- Keep stable event IDs as the edit key, and require compatibility-aware confirmation for ID changes.
- Support archived or draft states later, but do not alter runtime filtering semantics until that state model is approved and validated.
- Add structured source and participant/worldline selection from catalogs instead of free-text-only editing.
- Treat full source catalog extraction, semantic merge, and YAML migration as follow-up stages after the local editor proves the editing workflow.

## Product Goal

Build a local, human-first worldline data editor that sits in front of `data/raw/worldline_commu/`.

The editor should make the data model understandable through controls, previews, and validation instead of requiring authors to remember JSON structure, enum values, file placement, participant IDs, source metadata rules, or generated-data freshness steps.

## Non-Goals

- Do not optimize for the smallest implementation.
- Do not require direct JSON editing as the primary workflow.
- Do not weaken the current generated-data and validation guarantees.
- Do not change event chronology, source claims, public IDs, or URL compatibility as an incidental side effect.
- Do not deploy a write-capable public editing surface unless a later plan explicitly approves that boundary.

## Proposed Architecture

Create a local editor mode with three coordinated surfaces.

- Navigation surface: searchable lane, category, event, participant, date-confidence, source-status, and unsourced-event filters.
- Editing surface: structured forms for event fields, dates, participants, worldlines, sources, source details, conflicts, and notes.
- Review surface: live timeline preview, validation messages, and diff preview before saving.

Use stable event IDs as the update key.
The save layer should apply targeted upserts to raw lane files and preserve unrelated content ordering where practical.
When a move crosses lanes, the editor should remove the event from the old lane and insert it into the destination lane through one explicit operation.

## Source-Of-Truth Strategy

Evaluate two source-of-truth paths before implementation.

- Keep JSON as the durable raw format and make the editor the primary authoring surface.
- Migrate raw authoring data to a more human-readable format, such as one-event-per-file YAML, while continuing to generate the app-facing modules.

The editor experience is the deciding factor.
If the editor fully owns routine editing, keeping JSON behind the editor may be acceptable because humans no longer edit it directly.
If file-level review and manual emergency edits remain important, one-event-per-file YAML should be preferred for smaller diffs and easier conflict resolution.

## Required Editor Capabilities

- Add a new event to an existing lane.
- Create a new lane or category entry when the data model permits it.
- Edit every existing event field without hand-writing JSON.
- Delete an event with confirmation and diff preview.
- Duplicate an event as a draft for similar source entries.
- Move an event between lanes or categories while preserving its stable ID unless the user explicitly changes it.
- Rename or regenerate an event ID only through a compatibility-aware flow.
- Search existing events before adding a new one to reduce duplicates.
- Select `participants`, `worldlineId`, `occurrenceType`, `dateConfidence`, `sourceBasis`, `sourceStatus`, and `rangeReason` from known values.
- Edit `source`, `sourceDetails`, `conflicts`, and `note` as repeatable sections with add, remove, and reorder controls.
- Show validation errors next to the field that caused them.
- Show generated timeline preview before save.
- Show a raw diff summary before writing files.

## Data Integrity Rules

- Preserve current semantics for `singleWithinRange`, `dateConfidence`, `sourceBasis`, `sourceStatus`, `rangeReason`, `sourceDetails`, and `conflicts`.
- Preserve canonical and shared URL compatibility for event IDs.
- Do not infer a concrete date from a range unless the user explicitly records that interpretation.
- Keep source claims and uncertainty explicit.
- Reject saves that would produce stale generated data, duplicate IDs, invalid enum values, invalid dates, or missing required event fields.
- Treat broad data-shape migration as a separate Class C decision.

## Implementation Phases

- [x] Discovery: map the current raw data contract, generated-data pipeline, integrity checks, and timeline preview dependencies.
- [x] UX model: define editor screens, field groups, destructive-operation confirmations, and diff-preview behavior.
- [x] Write strategy decision: start with JSON-behind-editor and defer one-event-per-file YAML migration.
- [x] Local write boundary: design the local-only save API or script that can update raw files without exposing a public write surface.
- [x] Validation integration: reuse `generate:data`, `validate:data`, and integrity errors so editor feedback matches CI behavior.
- [x] Editor implementation: build navigation, editing forms, repeatable source sections, timeline preview, and save review.
- [x] Data migration decision: defer raw data migration to a separate compatibility-preserving task.
- [x] Verification: cover add, edit, delete, duplicate, move, ID-change, invalid-data, and generated-data freshness scenarios.
- [x] Documentation: update authoring docs with the editor workflow and emergency manual-edit path.

## Open Product Decisions

- Should the durable raw format remain JSON if humans normally use the editor?
- Should events be split to one event per file to improve Git review and merge conflict behavior?
- Should the editor live inside the main app behind a local-only route, or as a separate local tool?
- Should save operations write directly to disk, generate a patch file, or both?
- Which fields require compatibility warnings before save?
- Should collaborators submit changes through exported patch files, Git branches, or issue templates?

## Validation Notes

UI work in this plan requires browser verification.
Data pipeline work requires `npm run validate:data`, focused tests for changed data utilities, and `npm run build`.
Any source-of-truth migration requires before-and-after generated data comparison to prove runtime behavior is unchanged unless a specific semantic change is approved.

## Implementation Notes

- Added `scripts/worldline-editor-api.mjs` as a Vite dev-server-only API.
- Added `/timeline/?editor=worldline` as the local editor entry point.
- The editor currently writes current raw JSON files and regenerates app-facing generated modules after a successful save.
- The UI supports searchable event navigation, add, edit, duplicate, delete, lane move through destination selection, structured source details, conflicts, participants, worldlines, preview validation, and save validation.
- One-event-per-file YAML remains the approved long-term source-of-truth direction, but migration is deferred to a separate compatibility-preserving task.

## Validation Results

- `npm run test -- tests/worldlineEditorApi.test.js`: passed.
- `npm run build`: passed.
- `npm run validate:data`: passed.
- `npm run test`: passed.
- `python3 scripts/validate-changes.py`: passed.
- Browser desktop `1366x900` at `/timeline/?editor=worldline`: editor loaded, event list rendered, preview validation passed.
- Browser mobile `375x812` at `/timeline/?editor=worldline`: editor rendered in one column.
- Observed existing console warning: `Invalid event start date` for an existing timeline event.

## Deferred Follow-Ups

- Migrate source-of-truth data to one-event-per-file YAML after the editor workflow is validated in normal use.
- Add source catalog extraction and reuse once structured source editing has enough real entries.
- Add semantic merge and conflict-resolution UI for branch-level concurrent editing.
- Add patch-file export as a downloadable artifact if external contributors need a no-Git submission route.
