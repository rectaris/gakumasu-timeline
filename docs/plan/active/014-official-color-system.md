# Official Color System

status: active
task_type: ui_layout
review_class: C
human_design_required: yes
human_approval_status: approved
target_files:
  - src/data/characterCatalog.js
  - src/data/worldlines.js
  - src/data/worldline_commu/
  - src/utils/colors.js
  - src/style.css
  - src/components/TimelineLaneLabels.vue
  - src/components/TimelineEvents.vue
  - src/components/SidePanel.vue
  - docs/manual.md
  - docs/ui-behavior.md
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_UI_DESIGN.md
validation:
  - npm run test
  - npm run build
  - npm run verify
  - browser verification for desktop and mobile light/dark modes
  - git diff --check
acceptance:
  - Official Gakumasu character, commu, and game-specific colors are preserved as first-class design inputs.
  - Official colors are applied through tokens and derived UI roles instead of uncontrolled full-surface fills.
  - Light and dark modes keep readable contrast while retaining recognizable official color identity.
  - Character, commu, worldline, common-event, selected-event, and uncertainty colors have documented priority rules.
acceptance_focus:
  - official color fidelity
  - tokenized color roles
  - contrast and hierarchy
expected_output: implementation-plan
checked_summary_ja: 学マス公式色・キャラ色・コミュ固有色をUIトークンとして整理する。

## Goal

Upgrade the app from "using character colors directly" to a Gakumasu-aware color system.

The approved direction is to keep official Gakumasu colors, character colors, commu-specific colors, and game-specific colors. The improvement is to convert them into UI roles such as `accent`, `accentSoft`, `accentStrong`, `accentText`, `selected`, `uncertain`, and `commonEvent`.

## Tasks

- [ ] Audit where colors currently come from: character data, generated label colors, CSS variables, hard-coded UI colors, and SVG rendering.
- [ ] Define source-of-truth policy for official colors, including source citation or local provenance notes where practical.
- [ ] Add or designate a color token module for character, commu, worldline, common-event, game-system, uncertainty, and neutral UI colors.
- [ ] Define priority rules when an event could inherit multiple colors: selected state, event type, commu, character, worldline, common event.
- [ ] Replace direct broad fills with derived roles: thin accents, event bars, markers, borders, tags, selected state, and panel heading accents.
- [ ] Preserve official color recognition while deriving readable light and dark variants with OKLCH or the existing color utilities.
- [ ] Document color semantics in `docs/ui-behavior.md` and visible user-facing explanation only where necessary.
- [ ] Verify contrast and identity at desktop and narrow mobile viewports in light and dark modes.

## Design Notes

- Do not remove official or character colors to make the UI generic.
- Do not use character colors as large unrelated UI surfaces such as the whole header, panel background, or page background.
- Prefer neutral app chrome with official colors used as meaningful accents.
- Lane labels should feel official but not like disconnected candy-colored chips.

## Resolved Planning Decisions

- Keep official/source colors separate from derived UI colors. Source colors stay in data or a dedicated color source catalog; readable UI roles are generated in a token utility layer.
- Record color provenance with structured metadata where practical, and keep a human-reviewable color reference in documentation. Distinguish official, game-sampled, inferred, legacy, and temporary colors.
- Scope game-specific colors to characters, commu/worldline categories, common events, uncertainty, and core game-system accents. Do not expand into broad lore/object colors without a new source decision.
- Preserve the source color as the identity color. Express selected, focused, and uncertain states with stroke, outline, marker, line style, opacity, or pattern overlays instead of replacing the identity color.
- For multi-participant events, prefer a stable primary identity color plus secondary participant indicators in compact accents or the detail panel. Avoid dense gradients or split bars in the timeline body unless later visual QA proves them readable.
- Treat common events as their own semantic role rather than plain white. Use neutral common-event tokens, with lane association expressed through subtle lane-colored accents when needed.
- Keep `singleWithinRange` visually uncertain through non-color signals as well as color roles. It must not look like a precise point or concrete continuous span.
- Keep selected event fill identity intact; show selection through an explicit selected role applied to stroke, outline, glow, marker, or panel accent.
- Generate light and dark variants with deterministic OKLCH-based rules or the existing color utilities. Preserve hue identity while adjusting lightness/chroma for contrast.
- Use practical contrast targets: text at WCAG AA where feasible, important non-text boundaries around 3:1, and visual QA for decorative or redundant accents.
- Prefer either the current derived lane-label style or a neutral label with official-color accent. Do not switch to saturated character-color pills unless contrast and hierarchy are proven across all characters.
- Use selected-event color in the side panel only as a narrow heading/accent/tag treatment. Do not tint the full panel background.
- Split responsibility between JS tokens and CSS variables: dynamic data-driven SVG colors are resolved by JS tokens; stable app chrome, surfaces, and theme neutrals remain CSS variables.
- Preserve `event.color` as a compatibility/source-color field during migration. Add resolved visual roles such as `event.visual` or `event.colorRoles` instead of deleting the existing contract in the first pass.
- Do not rely on color alone for selection, uncertainty, or common-event distinction. Shape, stroke, pattern, iconography, or text metadata must carry the same state where practical.
- Validate the color system with token contrast checks plus desktop/mobile light/dark browser screenshots. Full visual-regression infrastructure is out of scope unless regressions make it necessary.
- Cache or precompute derived color roles per character, commu, worldline, and state. Do not compute expensive color conversions inside hot SVG render loops.
- Keep user-facing docs focused on visible meaning. Put token names, priority rules, provenance policy, and implementation details in developer-facing docs or this plan.

## Out Of Scope

- Changing event chronology or interpretation.
- Replacing the custom timeline renderer.
- Adding new official color data without a traceable source decision.
