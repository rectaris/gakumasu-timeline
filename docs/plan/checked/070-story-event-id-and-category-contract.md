# Story Event ID And Category Contract

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
  - Entity IDs use generated namespace prefixes and opaque UUID values.
  - StorySeries records form a parent-linked hierarchy, and StoryBlock records reference the leaf series.
  - Display titles are derived by joining the visible hierarchy labels and the StoryBlock leaf label rather than stored independently.
  - Category-specific fields, character-role cardinality, external identifiers, file scope, and source-label migration follow the accepted direction.
acceptance_focus:
  - derived display title
  - normalized StorySeries hierarchy
  - category-specific StoryBlock contract
expected_output: documentation
checked_summary_ja: 物語イベントのID、シリーズ階層、階層連結タイトル、カテゴリ別フィールド、保存単位を仕様化した。

## Decisions

- Use `series_`, `block_`, `edge_`, and `ref_` prefixes followed by generated lowercase UUID values.
- Generate IDs through tooling and never regenerate them from labels or hierarchy changes.
- Store StorySeries as parent-linked records and have StoryBlock reference only the leaf series.
- Do not store an independent StoryBlock title; derive it by joining visible hierarchy labels and the StoryBlock leaf label.
- Exclude the technical root category label from the derived title and join visible parts with a single space.
- Keep StoryBlock common fields minimal and validate category-specific fields separately.
- Treat a Pアイドル entry as a StorySeries and each in-game commu beneath it as a StoryBlock.
- Allow multiple character roles per character and require exactly one owner for idol commu StoryBlocks.
- Store typed external identifiers separately from display aliases.
- Author JSON in top-level or editing-unit StorySeries files and generate runtime indexes.
- Migrate legacy source strings through a reviewed mapping table rather than runtime parsing.

## Tasks

- [x] Define ID namespaces, issuance, and validation.
- [x] Define StorySeries hierarchy and derived-title rules.
- [x] Define StoryBlock common and category-specific fields.
- [x] Define character roles, external identifiers, file scope, and migration boundaries.
- [x] Add durable decision records and align backlog plan 065.
- [x] Validate and archive this work unit.

## Implementation Notes

- Defined UUID-based namespace prefixes for series, blocks, edges, and cross-view references.
- Replaced the independent title field with a title derived from visible StorySeries labels plus the StoryBlock leaf label.
- Defined parent-linked StorySeries records, leaf-series StoryBlock references, and initial allowed category hierarchies.
- Defined StoryBlock common fields, Pアイドル series handling, multi-role character references, and typed external identifiers.
- Defined JSON source files by top-level or independent editing series and generated runtime indexes.
- Required reviewed source-label mapping instead of runtime inference.

## Validation Results

- `git diff --check`: passed.
- `python3 scripts/lint-plan-docs.py`: passed.
- `python3 scripts/format-plan-docs.py --check`: passed.
- `python3 scripts/validate-changes.py`: passed.
