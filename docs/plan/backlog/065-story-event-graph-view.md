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
  - docs/story-event/
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
  - Each registered アイドルコミュ, イベントコミュ, サポートコミュ, or 初星コミュ episode can appear as one canonical graph node.
  - The view supports undirected, one-way, and bidirectional semantic edges without assuming the graph is acyclic.
  - Story chronology is expressed through relative node order and spacing without storing in-world or real-world timestamps.
  - Story flow is displayed from top to bottom, and nodes with unknown relative positions remain available as isolated nodes.
  - Node and edge IDs, references, directions, relation types, evidence, and uncertainty pass deterministic validation.
  - The graph is addressable through mode=story-graph and stable node or edge selection parameters.
  - The final implementation begins only after the product and data specifications receive a dedicated review.
acceptance_focus:
  - story-block identity
  - relative story flow
  - mixed-graph semantics
expected_output: implementation
checked_summary_ja: 各話を1ノードとする物語イベントの時系列グラフを構築する。

## Goal

Build the 物語イベント view as a top-to-bottom mixed graph of canonical story blocks.

A story block is one episode or comparable unit, such as `花海咲季 親愛度 第5話` or one episode inside a support-card story.
The graph may contain undirected, one-way, and bidirectional edges.
Edges may carry explicit semantic meaning, evidence, and uncertainty.

## Start Gate

Do not begin implementation from this backlog outline alone.

Before promotion to active, produce and approve a focused specification that defines the StoryBlock contract, minimum StoryEdge contract, relative-order and spacing rules, layout behavior, source migration policy, and minimum representative data set.
Record only the accepted decisions in the promoted active plan.
Use `docs/story-event/` as the canonical product specification directory for that review.

Plan 064 must provide the `mode=story-graph` page boundary and selection URL contract, or this plan must coordinate that prerequisite without duplicating shell ownership.

## Settled Direction

- Store story blocks as first-class entities with stable IDs rather than deriving runtime identity from free-form `source` labels.
- Provide stable cross-view references from 物語時系列 and 学マス情報史 records to story blocks, with ownership and multiplicity defined by the approved specification.
- Treat the graph as a mixed multigraph that allows parallel edges and cycles.
- Keep one canonical node for a story block and use participants for character filtering instead of duplicating the node per character.
- Include アイドルコミュ, イベントコミュ, サポートコミュ, and 初星コミュ in the initial scope.
- Treat one in-game commu episode as one canonical graph node, while series and chapters remain classification metadata.
- Express story chronology through relative node order and spacing without storing in-world or real-world timestamps.
- Register nodes with unknown relative positions and leave them initially isolated.
- Display story flow from top to bottom.
- Keep the view visually independent while allowing 物語時系列 and 学マス情報史 records to reference story blocks.
- Use a dedicated graph renderer while reusing application-level selection, detail, color, URL, zoom, and accessibility patterns where suitable.

## Specification Work

- Define namespaced stable IDs for story series, story blocks, and edges.
- Define the category-specific hierarchy for アイドルコミュ, イベントコミュ, サポートコミュ, and 初星コミュ.
- Define how chapter, episode number, title, character tags, and source details are represented.
- Define how relative node order and spacing are stored without persisting screen pixel positions as domain data.
- Define the minimum edge endpoint and direction contract required to begin implementation.
- Evaluate relation types, generated sequence edges, and authored semantic edges through representative examples and graph prototypes.
- Define edge evidence and confidence rules for interpretive relationships.
- Define top-to-bottom grouping, collision avoidance, edge routing, dense display, and isolated-node layout.
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
- Unknown relative story position remains unknown and is not replaced by an inferred position.
- Isolated nodes remain valid records until an approved relation connects them.
- Published URLs restore the same canonical node or edge after data regeneration.

## Non-Goals For The Initial Specification

- Do not infer causality from chronological proximity.
- Do not force the graph into a DAG.
- Do not assign in-world or real-world timestamps to position StoryBlock nodes.
- Do not derive authoritative node IDs solely from Japanese display titles.
- Do not replace the existing 物語時系列 event model.
- Do not implement automatic source scraping as part of the first graph release.
