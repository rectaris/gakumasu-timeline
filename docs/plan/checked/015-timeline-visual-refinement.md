# Timeline Visual Refinement

status: completed
task_type: ui_layout
review_class: C
human_design_required: yes
human_approval_status: approved
target_files:
  - src/style.css
  - src/data/colorSources.js
  - src/utils/colorTokens.js
  - src/components/TimelineSvg.vue
  - src/components/TimelineViewport.vue
  - src/components/TimelineScaleLines.vue
  - src/components/TimelineScaleLabels.vue
  - src/components/TimelineLaneLines.vue
  - src/components/TimelineLaneLabels.vue
  - src/components/TimelineEvents.vue
  - src/components/ZoomControls.vue
  - src/components/IntroGuide.vue
  - docs/color-system.md
  - docs/manual.md
  - docs/ui-behavior.md
  - docs/plan/checked/014-official-color-system.md
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
completed_at: 2026-06-18
## Goal

Remove the cheap appearance while preserving dense timeline utility and Gakumasu color identity.

## Planning Inputs

- Use `docs/plan/checked/014-official-color-system.md` as the completed color-system baseline.
- Use `docs/color-system.md` as the human-reviewable reference for source colors, provenance levels, token roles, and validation expectations.
- Preserve the 014 color architecture: source colors live in `src/data/colorSources.js`, data-driven visual roles are derived by `src/utils/colorTokens.js`, and stable neutral app chrome remains in `src/style.css`.
- Keep existing compatibility fields such as `event.color`; this plan may adjust visual use of resolved roles but must not migrate or remove data contracts.

## Tasks

- [x] Redesign the app chrome so the header, page background, side surfaces, and controls are neutral and restrained.
- [x] Refine the timeline grid with clearer major/minor line hierarchy and less default-looking borders.
- [x] Redesign lane labels from full-color chips into stable fixed-dimension labels with neutral readable surfaces and official-color accents.
- [x] Add professional event states: default, hover, selected, keyboard focus, disabled/filtered, common event, uncertain event.
- [x] Redesign `singleWithinRange` from black dashed prototype styling into a candidate-range uncertainty visual that cannot be mistaken for a concrete date.
- [x] Tune marker size, bar height, radii, stroke weights, opacity, and spacing so repeated rows look intentional.
- [x] Reduce first-run `IntroGuide` visual dominance and avoid covering too much of the timeline.
- [x] Shrink or restyle bottom zoom controls so they are a tool surface, not the visual center of the app.
- [x] Verify that labels, controls, and event marks do not overlap at desktop and 375px mobile width.

## Resolved Planning Decisions

1. Token responsibility
   - Stable neutral UI tokens for app chrome, surfaces, text, borders, shadows, overlays, spacing, radii, and control sizing belong in `src/style.css`.
   - Dynamic data-driven colors for lanes, event bars, common events, selection, uncertainty, and panel accents must continue to come from `src/utils/colorTokens.js`.
   - Component files should consume roles and CSS variables instead of adding unrelated hard-coded hex values.

2. Density baseline
   - Preserve the current dense desktop utility as the baseline.
   - Improve perceived quality through hierarchy, spacing consistency, stroke weights, contrast, and reduced color noise rather than by broadly enlarging rows or controls.
   - Mobile may use tighter, less dominant guide/control surfaces so the timeline remains inspectable at about 375px width.

3. Official color usage
   - Use official and source colors as data meaning: event identity, lane accent, selected panel accent, common-event lane association, and uncertainty roles.
   - Do not use character colors as wallpaper, full-page backgrounds, full header fills, or broad unrelated UI surfaces.
   - Keep the 014 color-source priority and provenance model intact.

4. Lane label model
   - Use stable fixed-dimension labels with neutral or softly derived readable surfaces.
   - Show official/source color as a narrow accent, edge, underline, dot, or similarly compact signal.
   - Prefer one-line truncation with stable dimensions over wrapping or dynamic width changes.

5. Grid hierarchy
   - Time hierarchy is primary: year lines strongest, month lines secondary, day lines subtle and zoom-dependent.
   - Lane boundaries remain readable but should not overpower the time scale.
   - Any zoom-aware density changes must stay compatible with plan 016, which owns broader label-density behavior.

6. Boundary with plan 016
   - This plan owns shape, color hierarchy, strokes, opacity, event-state styling, lane-label surfaces, intro visual dominance, and compact zoom-control styling.
   - Plan 016 owns event text density, width-aware labels, zoom-aware label display, and broader information hierarchy.
   - Do not implement new event-field display rules in this plan unless needed to avoid visual breakage from the refinement.

7. Event-state composition
   - Preserve identity fill for normal, common, and uncertain events where practical.
   - Compose semantic state and interaction state instead of replacing one with the other.
   - Interaction emphasis priority is selected, keyboard focus, hover, then disabled/filtered visual dimming.
   - Semantic signals for common events and uncertainty must remain visible even when selected or focused.

8. `singleWithinRange` uncertainty
   - Represent the full candidate range, not a midpoint or precise single-day mark.
   - Use non-color signals such as candidate-range banding, boundary markers, dotted or patterned treatment, and uncertainty markers.
   - Avoid centered icons or shortened bars that imply a known concrete date.

9. Common-event color treatment
   - Keep common events as their own semantic role, using neutral common-event tokens from the color system.
   - Show lane association with subtle lane-colored accents, strokes, markers, or detail-panel linkage rather than filling each common event with full lane color.
   - Preserve canonical common-event selection behavior and per-lane render identity.

10. Zoom controls
    - Keep the documented bottom-center fixed location for this plan.
    - Restyle and shrink the controls into a compact tool surface.
    - On mobile, reduce visual dominance through compact sizing, reduced hints, or collapse of secondary hint text, without moving the behavior into a new navigation system.

11. Intro guide
    - Keep first-run/help value but make the guide non-dominant and non-obstructive.
    - Prefer a compact, dismissible, non-modal surface that does not cover the main timeline for long.
    - Do not turn the first screen into an instruction page.

12. Light and dark mode target
    - Use practical WCAG AA for text where feasible and about 3:1 for important non-text boundaries.
    - Pay special attention to bright or low-contrast official colors such as pale character colors and common-event neutrals.
    - Use visual QA plus targeted token contrast checks where the color system exposes enough structure.

13. Focus and accessibility
    - Use a consistent focus treatment that is distinct from data color and selection color.
    - Do not rely on color alone for selection, uncertainty, common-event distinction, hover, or keyboard focus.
    - Icon-only or compact controls must retain accessible names and visible focus states.

14. SVG styling strategy
    - Prefer state classes and CSS variables for stable visual rules.
    - Pass data-driven resolved color roles into SVG elements as variables or role values rather than recomputing style ad hoc in each template.
    - Avoid expensive color conversion inside hot SVG render loops; reuse precomputed roles from the 014 color pipeline.

15. Mobile minimum
    - Treat desktop as the primary productivity layout and mobile as required navigation/inspection support.
    - At 375px width, prioritize keeping timeline content, selected event access, close actions, lane labels, and zoom controls reachable.
    - Reduce guide/control footprint instead of introducing a separate mobile-only application flow in this plan.

16. Visual evidence
    - Capture or record representative desktop and mobile light/dark verification during implementation.
    - Temporary screenshots are sufficient unless a later regression justifies permanent visual snapshot tests.
    - Report viewport, scenario, and evidence path when useful.

17. Documentation boundary
    - Update `docs/manual.md` or `docs/ui-behavior.md` only when visible meaning or documented behavior changes.
    - Pure polish, neutral surface changes, and stroke tuning do not need detailed user-facing prose.
    - Changes to `singleWithinRange`, common-event visual meaning, zoom-control presentation, or guide behavior should be reflected in user-facing docs if existing text becomes inaccurate.

18. Implementation sequence
    - First define neutral visual tokens and app-chrome hierarchy.
    - Then refine grid, lane labels, and scale surfaces.
    - Then refine event marks, state composition, common-event treatment, and `singleWithinRange`.
    - Finish with `IntroGuide`, `ZoomControls`, docs sync, and desktop/mobile light/dark verification.

19. Completion standard
    - `npm run build`, `npm run verify`, visual/browser verification, and `git diff --check` are required for implementation completion.
    - Build-only validation is insufficient because this plan is primarily visual.
    - Human design approval is already recorded for the direction; additional approval is only needed if implementation proposes a new visual philosophy or behavior outside this plan.

## Design Notes

- Keep the project rule: dense, readable, work-focused timeline.
- Avoid marketing-like hero composition, decorative gradients, and unrelated visual systems.
- Use official color as data meaning, not as wallpaper.
- Prefer neutral app chrome with official/source colors used through the 014 token roles.
- Preserve hue identity while adjusting lightness, chroma, stroke, opacity, and pattern for contrast and hierarchy.
- Selected, focused, uncertain, and common-event states must remain distinguishable without relying on color alone.
- Keep repeated rows visually intentional through consistent dimensions, stroke weights, opacity, and spacing.
- Avoid broad saturated character-color fills for lane labels, headers, panels, zoom controls, or intro surfaces.

## Out Of Scope

- Search and filter behavior changes.
- Data schema migration.
- Timeline library replacement.
- New source-color collection or provenance changes beyond using the color data already created in 014.
- Event label-density rules owned by plan 016, except minimal safeguards needed for non-overlap.

## Completion Notes

- Added neutral app chrome and timeline-specific CSS variables while preserving official/source colors as event and lane accent signals.
- Converted grid, scale labels, lane labels, viewport, and event SVG styling to class/variable-driven presentation.
- Reworked lane labels into fixed neutral labels with compact official-color accents and one-line truncation.
- Added composed event visuals for hover, selection, keyboard focus, common events, and `singleWithinRange` candidate ranges.
- Reduced `IntroGuide` and bottom zoom controls, including compact hint text and mobile-only hint suppression.
- Updated `docs/manual.md` and `docs/ui-behavior.md` for the shorter visible zoom labels.

## Validation Notes

- `npm run build`
- `npm run verify`
- `python3 scripts/lint-plan-docs.py`
- `git diff --check`
- `python3 scripts/validate-changes.py`
- Browser/visual verification with Playwright:
  - `/tmp/gakumasu-timeline-desktop-light-review.png`
  - `/tmp/gakumasu-timeline-desktop-dark-review.png`
  - `/tmp/gakumasu-timeline-mobile-light-review.png`
  - `/tmp/gakumasu-timeline-mobile-dark-review.png`
  - `/tmp/gakumasu-timeline-selection.png`
