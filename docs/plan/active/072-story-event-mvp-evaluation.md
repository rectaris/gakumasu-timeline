# Story Event MVP Evaluation

status: active
task_type: product_logic
review_class: C
human_design_required: yes
human_approval_status: approved
target_files:
  - data/raw/story_events/
  - src/data/storyGraphModel.js
  - src/data/storyGraph.js
  - src/data/integrity.js
  - src/data/integrityRunner.js
  - src/pages/StoryGraphPage.vue
  - src/components/SidePanel.vue
  - src/utils/storyGraph.js
  - scripts/generate-data.mjs
  - scripts/evaluate-story-graph.mjs
  - scripts/verify-story-graph.mjs
  - tests/
  - docs/story-event/
  - docs/data-structure.md
  - docs/processing-flow.md
  - docs/ui-behavior.md
  - docs/manual.md
  - docs/plan/backlog/064-three-view-application-shell.md
target_json:
  - data/raw/story_events/pilot.json
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
  - node scripts/evaluate-story-graph.mjs
  - node scripts/verify-story-graph.mjs
  - python3 scripts/validate-changes.py
  - python3 scripts/security-static-check.py
  - bash scripts/lint-plan-docs.sh
  - bash scripts/format-plan-docs.sh --check
  - git diff --check
acceptance:
  - Runtime story data does not present explicitly artificial semantic relations as curated story facts.
  - Mixed directions, semantic cycles, parallel edges, and invalid edge cases remain covered by clearly test-only fixtures.
  - Repeatable evaluation covers at least 50, 100, and 300 node layouts without changing story chronology semantics.
  - StoryReference records are deterministically validated against StoryBlock IDs and can drive links from narrative details to the graph.
  - Reverse StoryReference indexes can expose referring narrative records in StoryBlock details without duplicating source-owned records.
  - Specification and implementation differences are recorded, and plan 064 reflects the shell work already delivered by plan 065.
  - Domain interpretation, factual source mapping, publication status, and full-data migration remain explicit user review gates.
acceptance_focus:
  - evidence boundary
  - scale evaluation
  - cross-view references
expected_output: full-implementation
checked_summary_ja: 物語イベントMVPの仮データ分離、規模評価、ビュー間参照基盤を整備する。

## Problem

The MVP proves the graph interaction model with a small representative data set,
but it still mixes display-only semantic relations with real commu labels.
It also validates StoryReference shapes only in isolation, has no repeatable
layout-scale evaluation, and leaves plan 064 describing work that plan 065
partially delivered.

## Goal

Evaluate and harden the MVP without inventing domain facts or beginning the
full commu migration.
Complete all mechanical and implementation work that can be decided from the
approved 1.0 contracts, then stop at the factual mapping and publication gates.

## Implementation Instructions

- Keep the runtime pilot data visibly provisional and free of semantic
  relationships that were authored solely to demonstrate rendering.
- Move mixed-graph demonstrations into test-owned fixtures with non-domain
  labels.
- Exercise the existing layout at increasing deterministic fixture sizes and
  report dimensions, node counts, edge counts, and calculation durations.
- Extend the existing source-owned StoryReference contract through timeline
  integrity validation, derived reverse indexing, and conditional detail links.
- Do not add factual StoryReference mappings or new chronology interpretations
  without reviewed source evidence.
- Reconcile documentation and backlog ownership with the implementation that
  already exists.

## Decisions

- Use test-only synthetic fixtures for scale and mixed-graph semantics.
- Keep the runtime data as an explicitly unreviewed pilot until factual review.
- Do not add a graph-layout dependency during this evaluation.
- Add generic StoryReference plumbing, but leave actual source-to-block mappings
  for reviewed data work.
- Do not deploy or declare the MVP a public initial release in this plan.

## Tasks

- [ ] Separate runtime pilot data from display-only semantic relationships.
- [ ] Add deterministic mixed-graph and scale fixtures.
- [ ] Add layout evaluation tooling and regression expectations.
- [ ] Integrate StoryReference validation into timeline data integrity.
- [ ] Generate a reverse StoryReference index for StoryBlock details.
- [ ] Add conditional narrative-to-graph and graph-to-narrative detail links.
- [ ] Reconcile the Story Event specifications and plan 064 backlog state.
- [ ] Run automated, browser, responsive, documentation, and completion checks.

## Validation Notes

Record measured fixture results and the exact remaining user decisions before
archiving this plan.
