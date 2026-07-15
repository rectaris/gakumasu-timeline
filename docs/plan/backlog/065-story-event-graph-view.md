# Story Event Graph View

status: backlog
task_type: product_logic
review_class: C
human_design_required: yes
human_approval_status: approved
target_files:
  - data/raw/story_blocks/
  - data/raw/story_edges/
  - data/raw/worldline_commu/
  - src/data/
  - src/types/
  - src/pages/StoryGraphPage.vue
  - src/components/story-graph/
  - src/composables/
  - scripts/generate-data.mjs
  - scripts/validate-data.mjs
  - tests/
  - docs/data-structure.md
  - docs/ui-behavior.md
  - docs/manual.md
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
  - browser verification for graph navigation, node and edge inspection, filtering, zoom, pan, keyboard access, and mobile inspection
  - git diff --check
  - python3 scripts/validate-changes.py
acceptance:
  - Each registered 親愛度, イベント, サポカ, or comparable story block can appear as one canonical graph node.
  - The view supports undirected, one-way, and bidirectional semantic edges without assuming the graph is acyclic.
  - Story-block occurrence time is distinct from the narrative events for which that block is evidence.
  - Node and edge IDs, references, directions, relation types, evidence, and uncertainty pass deterministic validation.
  - The graph is addressable through mode=story-graph and stable node or edge selection parameters.
  - The final implementation begins only after the product and data specifications receive a dedicated review.
acceptance_focus:
  - story-block identity
  - mixed-graph semantics
  - explicit uncertainty
expected_output: implementation
checked_summary_ja: 各話を1ノードとする物語イベントの時系列グラフを構築する。

## Goal

Build the 物語イベント view as a time-positioned mixed graph of canonical story blocks.

A story block is one episode or comparable unit, such as `花海咲季 親愛度 第5話` or one episode inside a support-card story.
The graph may contain undirected, one-way, and bidirectional edges.
Edges may carry explicit semantic meaning, evidence, and uncertainty.

## Start Gate

Do not begin implementation from this backlog outline alone.

Before promotion to active, produce and approve a focused specification that defines the StoryBlock contract, StoryEdge contract, time-placement rules, relation taxonomy, layout behavior, source migration policy, and minimum representative data set.
Record only the accepted decisions in the promoted active plan.

Plan 064 must provide the `mode=story-graph` page boundary and selection URL contract, or this plan must coordinate that prerequisite without duplicating shell ownership.

## Settled Direction

- Store story blocks as first-class entities with stable IDs rather than deriving runtime identity from free-form `source` labels.
- Model links between narrative events and story blocks as many-to-many evidence references.
- Keep the story block's main in-world occurrence time separate from flashbacks or historical claims supported by that story.
- Treat the graph as a mixed multigraph that allows parallel edges and cycles.
- Separate generated structural sequence edges from authored semantic edges.
- Keep one canonical node for a story block and use participants for character filtering instead of duplicating the node per character.
- Position nodes by narrative time when known and preserve an explicit unresolved-time state when not known.
- Use a dedicated graph renderer while reusing application-level selection, detail, color, URL, zoom, and accessibility patterns where suitable.

## Specification Work

- Define namespaced stable IDs for story series, story blocks, and edges.
- Define story categories and hierarchy for 親愛度, イベントコミュ, サポカ, 初星コミュ, and later story families.
- Define how chapter, episode number, title, participants, source details, release metadata, and in-world time are represented.
- Define the difference between story occurrence time, referenced narrative-event time, release time, and ordinal story order.
- Define the allowed edge directions and the initial controlled relation types.
- Define which sequence edges are generated and which semantic edges require authored records.
- Define edge evidence and confidence rules for interpretive relationships.
- Define the grouping, collision avoidance, edge routing, dense display, and unresolved-time layout.
- Define node and edge detail-panel content, search fields, filters, legends, and keyboard navigation.
- Define a reviewed migration table from current free-form source labels to StoryBlock IDs.
- Define how cross-view links open supporting story blocks from 物語時系列.
- Define representative desktop and mobile acceptance scenarios before choosing or adding a graph-layout dependency.

## Initial Validation Rules

- StoryBlock, StoryEdge, and series IDs are globally unique within their namespaces.
- Every node and edge reference resolves.
- Edge direction and relation type use approved values.
- Parallel edges remain distinguishable by stable edge IDs.
- Cycles are allowed and are not validation failures.
- Self-edges are rejected unless an approved relation type explicitly needs them.
- Unknown story time remains unknown and is not replaced by a derived midpoint.
- Evidence references preserve the source claim rather than silently converting it into story occurrence time.
- Published URLs restore the same canonical node or edge after data regeneration.

## Non-Goals For The Initial Specification

- Do not infer causality from chronological proximity.
- Do not force the graph into a DAG.
- Do not derive authoritative node IDs solely from Japanese display titles.
- Do not replace the existing 物語時系列 event model.
- Do not implement automatic source scraping as part of the first graph release.
