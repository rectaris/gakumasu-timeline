# Story Data Publication Lifecycle

status: active
task_type: environment_data_flow
review_class: C
human_design_required: yes
human_approval_status: approved
target_files:
  - data/raw/story_events/
  - src/data/generated/story_events/
  - src/data/storyGraph.js
  - src/data/storyGraphModel.js
  - src/pages/StoryGraphPage.vue
  - src/types/storyEvent.d.ts
  - scripts/generate-data.mjs
  - scripts/verify-production-story-data.mjs
  - scripts/verify-story-graph.mjs
  - package.json
  - tests/
  - docs/story-event/
  - docs/data-structure.md
  - docs/processing-flow.md
  - docs/manual.md
  - README.md
target_json:
  - data/raw/story_events/unreviewed/pilot.json
  - data/raw/story_events/published.json
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_ENVIRONMENT.md
  - docs/agent/SPEC_UI_DESIGN.md
  - docs/agent/SPEC_JAPANESE_TECH_WRITING.md
validation:
  - npm run verify
  - node scripts/verify-story-graph.mjs
  - python3 scripts/validate-changes.py
  - python3 scripts/security-static-check.py
  - bash scripts/lint-plan-docs.sh
  - bash scripts/format-plan-docs.sh --check
  - git diff --check
acceptance:
  - Story data uses the draft, unreviewed, approved, and published lifecycle vocabulary.
  - The unreviewed pilot remains available to local development and automated interaction checks.
  - Production builds use only the published story data set and contain no unreviewed pilot facts.
  - Dataset lifecycle values and generated artifacts are deterministically validated.
  - The public story view explains the empty state when no published records exist.
  - The accepted event-commu-first and evidence-led relationType policies are recorded without adding unreviewed facts.
acceptance_focus:
  - publication boundary
  - deterministic generation
  - review safety
expected_output: full-implementation
checked_summary_ja: 未承認の物語データを本番成果物から除外する公開ライフサイクルを実装する。

## Problem

The unreviewed Story Event pilot is labeled as provisional but is still the
normal runtime data source.
A static production build can therefore expose unapproved claims even when the
UI labels them as unreviewed.

## Goal

Enforce a source and artifact boundary between review data and production data.
Keep the pilot useful in local development while ensuring production output
contains only explicitly published story records.

## Implementation Instructions

- Store the pilot under an unreviewed source path and create an explicit,
  initially empty published source data set.
- Validate the four lifecycle values as controlled data.
- Use unreviewed data in Node/Vitest/local Vite development and published data
  in Vite production builds.
- Add a post-build assertion that searches production artifacts for prohibited
  pilot identifiers and labels.
- Keep StoryReference validation tied to the production StoryBlock set for
  published narrative data.
- Add a clear zero-record state to the production Story Event page.
- Do not approve, publish, or reinterpret any current pilot record.

## Decisions

- Lifecycle states are `draft`, `unreviewed`, `approved`, and `published`.
- `approved` means review-complete and release-eligible; `published` means
  included in the production data set.
- Unreviewed records must not be bundled into production assets.
- The first future authored data slice is one complete Event Commu series.
- Initial authored relationships use `sequence/before`; semantic relation types
  are added only from reviewed recurring examples.
- Real-world history specification work starts after this lifecycle boundary is
  complete.

## Tasks

- [ ] Split unreviewed and published story source/generated files.
- [ ] Validate lifecycle states and production-only StoryReference targets.
- [ ] Select development and production story data without changing public URLs.
- [ ] Add production artifact leakage verification.
- [ ] Add the published empty state and update browser checks.
- [ ] Record authoring, approval, and publication procedures.
- [ ] Run automated, production artifact, browser, responsive, and docs checks.

## Validation Notes

Record the exact production bundle inspection and the remaining real-world
history decisions before archiving.
