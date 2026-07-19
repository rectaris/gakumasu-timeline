# Story Event Graph View

status: backlog
task_type: product_logic
review_class: C
human_design_required: yes
human_approval_status: approved
target_files:
  - data/raw/story_events/
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
  - Story chronology is expressed only through before-and-after sequence relations without storing in-world or real-world timestamps.
  - Node distance and edge length have no temporal meaning.
  - Story flow is displayed from top to bottom, and nodes with unknown relative positions remain available as isolated nodes.
  - Node and edge IDs, references, directions, relation types, evidence, and uncertainty pass deterministic validation.
  - The graph is addressable through mode=story-graph and stable node or edge selection parameters.
  - The final implementation begins only after the product and data specifications receive a dedicated review.
acceptance_focus:
  - story-block identity
  - explicit story order
  - mixed-graph semantics
expected_output: implementation
checked_summary_ja: 各話を1ノードとする物語イベントの時系列グラフを構築する。

## Goal

Build the 物語イベント view as a top-to-bottom mixed graph of canonical story blocks.

Follow the durable specification stages and MVP gate in [物語イベント仕様策定ロードマップ](../../story-event/specification-roadmap.md).

A story block is one episode or comparable unit, such as `花海咲季 親愛度 第5話` or one episode inside a support-card story.
The graph may contain undirected, one-way, and bidirectional edges.
Edges may carry explicit semantic meaning, evidence, and uncertainty.

## Start Gate

Do not begin implementation from this backlog outline alone.

Before promotion to active, produce and approve a focused specification that defines the StoryBlock contract, minimum StoryEdge contract, before-and-after sequence rules, source migration policy, and minimum representative data set.
Layout and remaining UI details may be refined during implementation as long as the approved graph invariants remain unchanged.
Complete stages 4 through 7 and pass the core-specification approval gate in the specification roadmap before beginning the MVP.
Record only the accepted decisions in the promoted active plan.
Use `docs/story-event/` as the canonical product specification directory for that review.

Plan 064 must provide the `mode=story-graph` page boundary and selection URL contract, or this plan must coordinate that prerequisite without duplicating shell ownership.

## Settled Direction

- Store story series, story blocks, story edges, and cross-view references with generated `series_`, `block_`, `edge_`, or `ref_` prefixes followed by lowercase UUID values.
- Store StorySeries as parent-linked records and have StoryBlock reference only the leaf series.
- Derive each StoryBlock display title by joining visible StorySeries labels and the StoryBlock leaf label with spaces instead of storing an independent title.
- Keep typed game IDs and legacy aliases separate from hierarchy labels.
- Store typed StoryBlock references on 物語時系列 and 学マス情報史 records and derive reverse indexes.
- Treat the graph as a mixed multigraph that allows parallel edges and cycles.
- Require the sequence subgraph to be acyclic while allowing cycles in the complete mixed graph.
- Keep one canonical node for a story block and use owner, focus, or participant character roles for filtering instead of duplicating the node per character.
- Treat each Pアイドル as a StorySeries and each in-game commu beneath it as a StoryBlock.
- Include アイドルコミュ, イベントコミュ, サポートコミュ, and 初星コミュ in the initial scope.
- Treat one in-game commu episode as one canonical graph node, while series and chapters remain classification metadata.
- Express story chronology only through before-and-after sequence relations without storing in-world or real-world timestamps.
- Give node distance and edge length no temporal meaning.
- Register nodes with unknown relative positions and leave them initially isolated.
- Display story flow from top to bottom.
- Keep the view visually independent while allowing 物語時系列 and 学マス情報史 records to reference story blocks.
- Distinguish sequence edges that determine order from semantic edges that do not affect order.
- Represent undirected, forward, and bidirectional relations as one logical edge with a direction field.
- Use controlled relation types with optional display labels and require rationale or evidence for interpretive semantic edges.
- Author raw data in category- or series-scoped units and generate runtime indexes.
- Use JSON files scoped to a top-level or independent editing StorySeries and do not use file paths as entity identity.
- Use a dedicated graph renderer while reusing application-level selection, detail, color, URL, zoom, and accessibility patterns where suitable.

## Specification Work

- Implement and validate the approved UUID namespaces for story series, story blocks, edges, and cross-view references.
- Implement and validate parent-linked StorySeries hierarchies for アイドルコミュ, イベントコミュ, サポートコミュ, and 初星コミュ.
- Implement generated display titles from visible hierarchy labels and the StoryBlock leaf label.
- Implement category-specific hierarchy validation, Pアイドル series handling, character-role cardinality, typed external IDs, and display aliases.
- Generate IDs through a script or editor action and never regenerate them from labels or hierarchy changes.
- Evaluate relation types, generated sequence edges, and authored semantic edges through representative examples and graph prototypes.
- Define edge evidence and confidence rules for interpretive relationships.
- Refine top-to-bottom grouping, collision avoidance, edge routing, dense display, and isolated-node layout during UI implementation.
- Refine node and edge detail-panel content, search fields, filters, legends, and keyboard navigation during UI implementation.
- Define a reviewed migration table from current free-form source labels to StoryBlock IDs.
- Define how cross-view links open supporting story blocks from 物語時系列.
- Define representative desktop and mobile acceptance scenarios before choosing or adding a graph-layout dependency.

## Initial Validation Rules

- StoryBlock, StoryEdge, and series IDs are globally unique within their namespaces.
- IDs use the approved prefix plus lowercase UUID format and remain stable after label or hierarchy changes.
- StorySeries parent references are acyclic and every StoryBlock resolves to one leaf series.
- Generated display titles match the visible hierarchy path plus StoryBlock label without storing an independent title.
- Category-specific hierarchy, character-role, external-identifier, and series-order rules pass deterministic validation.
- Every node and edge reference resolves.
- Edge direction and relation type use approved values.
- Sequence edges form an acyclic partial order, while semantic edges do not change story order.
- Parallel edges remain distinguishable by stable edge IDs.
- Cycles are allowed and are not validation failures.
- Self-edges are rejected unless an approved relation type explicitly needs them.
- Unknown relative story position remains unknown and is not replaced by an inferred position.
- Isolated nodes remain valid records until an approved relation connects them.
- Node distance and edge length are not interpreted as elapsed time.
- Published URLs restore the same canonical node or edge after data regeneration.

## Non-Goals For The Initial Specification

- Do not infer causality from chronological proximity.
- Do not force the graph into a DAG.
- Do not assign in-world or real-world timestamps to position StoryBlock nodes.
- Do not derive authoritative node IDs solely from Japanese display titles.
- Do not replace the existing 物語時系列 event model.
- Do not implement automatic source scraping as part of the first graph release.
