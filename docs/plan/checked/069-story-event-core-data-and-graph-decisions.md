# Story Event Core Data And Graph Decisions

status: completed
task_type: japanese_prose
review_class: C
human_design_required: yes
human_approval_status: approved
target_files:
  - docs/story-event/
  - docs/plan/backlog/065-story-event-graph-view.md
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_PLAN_WORKFLOW.md
  - docs/agent/SPEC_UI_DESIGN.md
  - docs/agent/SPEC_JAPANESE_TECH_WRITING.md
validation:
  - git diff --check
  - python3 scripts/lint-plan-docs.py
  - python3 scripts/format-plan-docs.py --check
  - python3 scripts/validate-changes.py
acceptance:
  - StoryBlock identity, category-specific metadata, official labels, character roles, and duplicate handling follow the accepted direction.
  - Story order is represented only by before-and-after sequence relations, with no temporal meaning assigned to node or edge distance.
  - Sequence and semantic edges are distinguished, and only the sequence subgraph must be acyclic.
  - Minimum edge direction, relation-type, evidence, cross-view ownership, and source-data boundaries are recorded.
  - Layout details and the remaining UI behavior are explicitly deferred to implementation-time iteration.
acceptance_focus:
  - stable StoryBlock identity
  - sequence and semantic edge boundary
  - no temporal distance semantics
expected_output: documentation
checked_summary_ja: 物語イベントのStoryBlock、前後関係、意味的エッジ、ビュー間参照、保存境界を仕様化した。

## Decisions

- Use immutable project-issued canonical IDs and keep game IDs or legacy labels as external identifiers or aliases.
- Store an official display label alongside structured category-specific metadata and stable StorySeries references.
- Store character references with owner, focus, or participant roles instead of untyped display-name tags.
- Use the in-game commu unit as node identity and do not merge distinct commu units only because their contents match.
- Distinguish sequence edges from semantic edges; only sequence edges determine story order and layout rank.
- Allow partial ordering and require the sequence subgraph to be acyclic while the complete mixed graph may contain cycles.
- Represent chronology only as before-and-after relations and give node or edge distance no temporal meaning.
- Represent undirected, forward, and bidirectional relations as one logical edge with a direction field.
- Use controlled relation types with optional display labels, and require rationale or evidence for interpretive semantic edges.
- Store typed StoryBlock references on the referring view record and derive reverse indexes.
- Author raw data in category- or series-scoped units and generate runtime indexes.
- Refine graph layout and remaining UI behavior during UI implementation.

## Tasks

- [x] Update the StoryBlock and cross-view reference contracts.
- [x] Update graph semantics to remove temporal distance and separate sequence from semantic edges.
- [x] Update authoring, examples, and UI deferral boundaries.
- [x] Add durable decision records.
- [x] Align backlog plan 065 with the accepted contracts.
- [x] Validate and archive this work unit.

## Implementation Notes

- Replaced the previous relative-spacing model with simple before-and-after sequence relations.
- Defined immutable StoryBlock identity, structured category metadata, official labels, character roles, and game-commu duplicate handling.
- Separated acyclic sequence edges from semantic edges in the complete mixed graph.
- Defined one-edge direction representation, controlled relation types, evidence expectations, referring-view ownership, and generated reverse indexes.
- Deferred layout and remaining UI details to UI implementation while retaining top-to-bottom flow and no-temporal-distance invariants.

## Validation Results

- `git diff --check`: passed.
- `python3 scripts/lint-plan-docs.py`: passed.
- `python3 scripts/format-plan-docs.py --check`: passed.
- `python3 scripts/validate-changes.py`: passed.
