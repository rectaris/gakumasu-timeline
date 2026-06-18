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

## Out Of Scope

- Changing event chronology or interpretation.
- Replacing the custom timeline renderer.
- Adding new official color data without a traceable source decision.
