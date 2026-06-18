# Timeline Visual Refinement

status: active
task_type: ui_layout
review_class: C
human_design_required: yes
human_approval_status: approved
target_files:
  - src/style.css
  - src/components/TimelineSvg.vue
  - src/components/TimelineViewport.vue
  - src/components/TimelineScaleLines.vue
  - src/components/TimelineScaleLabels.vue
  - src/components/TimelineLaneLines.vue
  - src/components/TimelineLaneLabels.vue
  - src/components/TimelineEvents.vue
  - src/components/ZoomControls.vue
  - src/components/IntroGuide.vue
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
  - npm run build
  - npm run verify
  - browser verification for desktop and mobile light/dark modes
  - visual smoke checks for event selection, zoom controls, lane labels, and intro state
  - git diff --check
acceptance:
  - The timeline reads as a polished dense information visualization, not a prototype demo.
  - Official and character colors remain present, but the app shell, grid, labels, and controls have a coherent hierarchy.
  - Event bars, uncertainty marks, lane labels, and scale labels are visually consistent in light and dark modes.
  - Mobile layout keeps the timeline usable without oversized guide or zoom hint surfaces.
acceptance_focus:
  - premium visual quality
  - timeline readability
  - mobile polish
expected_output: implementation-plan
checked_summary_ja: タイムライン本体の見た目を高品質な情報可視化として刷新する。
## Goal

Remove the cheap appearance while preserving dense timeline utility and Gakumasu color identity.

## Tasks

- [ ] Redesign the app chrome so the header, page background, side surfaces, and controls are neutral and restrained.
- [ ] Refine the timeline grid with clearer major/minor line hierarchy and less default-looking borders.
- [ ] Redesign lane labels from full-color chips into stable labels with official-color accents and readable derived backgrounds.
- [ ] Add professional event states: default, hover, selected, keyboard focus, disabled/filtered, common event, uncertain event.
- [ ] Redesign `singleWithinRange` from black dashed prototype styling into a domain-specific uncertainty visual that cannot be mistaken for a concrete date.
- [ ] Tune marker size, bar height, radii, stroke weights, opacity, and spacing so repeated rows look intentional.
- [ ] Reduce first-run `IntroGuide` visual dominance and avoid covering too much of the timeline.
- [ ] Shrink or restyle bottom zoom controls so they are a tool surface, not the visual center of the app.
- [ ] Verify that labels, controls, and event marks do not overlap at desktop and 375px mobile width.

## Design Notes

- Keep the project rule: dense, readable, work-focused timeline.
- Avoid marketing-like hero composition, decorative gradients, and unrelated visual systems.
- Use official color as data meaning, not as wallpaper.

## Out Of Scope

- Search and filter behavior changes.
- Data schema migration.
- Timeline library replacement.
