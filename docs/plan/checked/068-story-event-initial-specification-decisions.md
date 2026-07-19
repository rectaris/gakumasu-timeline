# Story Event Initial Specification Decisions

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
  - docs/agent/SPEC_DECISION_AUDIT.md
validation:
  - git diff --check
  - python3 scripts/lint-plan-docs.py
  - python3 scripts/format-plan-docs.py --check
  - python3 scripts/validate-changes.py
acceptance:
  - The four initial story categories and their known hierarchy are recorded without inventing unapproved fields.
  - One in-game commu episode is defined as one canonical node, including initially isolated nodes whose order is unknown.
  - The graph uses relative order and spacing instead of in-world or real-world timestamps.
  - The UI flow direction is top to bottom, while other layout and edge details remain explicitly undecided.
  - The backlog implementation plan no longer requires time-positioned nodes or an occurrence-time contract.
acceptance_focus:
  - node identity and category scope
  - relative story flow
  - explicit specification gaps
expected_output: documentation
checked_summary_ja: 物語イベントの初期対象、ノード単位、相対的な物語順、縦方向の表示方針を仕様化した。

## Decisions

- Include アイドルコミュ, イベントコミュ, サポートコミュ, and 初星コミュ in the initial scope.
- Treat one commu episode that exists as a single in-game unit as one canonical node.
- Do not duplicate a node per character; attach character tags or metadata when needed.
- Register nodes whose relative story position is unknown and leave them initially isolated.
- Do not store in-world or real-world timestamps for this view.
- Express story chronology through node order and relative spacing, with the visual flow running from top to bottom.
- Keep the view visually independent while allowing the other two views to reference StoryBlock IDs.
- Defer the edge taxonomy and remaining UI behavior until later specification rounds.

## Tasks

- [x] Update the Story Event specification index and topic documents.
- [x] Add a durable decision record for the accepted scope and flow model.
- [x] Align backlog plan 065 with the accepted no-timestamp model.
- [x] Validate documentation and plan formatting.

## Implementation Notes

- Replaced the previous occurrence-time model with relative node order and spacing.
- Recorded the four initial story categories and the category-specific hierarchy supplied by the user.
- Defined unknown-position StoryBlocks as valid, initially isolated nodes.
- Kept the edge taxonomy, relative-spacing scale, cross-view reference ownership, and remaining UI behavior unresolved.
- Updated backlog plan 065 so future implementation work starts from the accepted top-to-bottom graph model.

## Validation Results

- `git diff --check`: passed.
- `python3 scripts/lint-plan-docs.py`: passed.
- `python3 scripts/format-plan-docs.py --check`: passed.
- `python3 scripts/validate-changes.py`: passed.
