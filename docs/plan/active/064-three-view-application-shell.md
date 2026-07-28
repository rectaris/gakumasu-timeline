# Three-View Application Shell

status: active
task_type: ui_layout
review_class: C
human_design_required: yes
human_approval_status: approved
target_files:
  - src/App.vue
  - src/main.js
  - src/components/
  - src/composables/
  - src/pages/
  - src/utils/viewStateUrl.js
  - src/utils/timelineModeUrl.js
  - src/style.css
  - tests/viewStateUrl.test.js
  - tests/timelineModeUrl.test.js
  - docs/narrative-timeline/
  - docs/story-event/
  - docs/realworld-history/
  - docs/ui-behavior.md
  - docs/manual.md
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_ENVIRONMENT.md
  - docs/agent/SPEC_UI_DESIGN.md
  - docs/agent/SPEC_JAPANESE_TECH_WRITING.md
validation:
  - npm run test -- tests/timelineModeUrl.test.js tests/viewStateUrl.test.js
  - npm run test
  - npm run build
  - browser verification for mode switching, browser history, direct URLs, existing timeline interactions, and mobile navigation
  - git diff --check
  - python3 scripts/validate-changes.py
acceptance:
  - The application exposes 物語時系列, 物語イベント, and 学マス情報史 as three mutually exclusive full-page views inside one application shell.
  - Existing /timeline/ and event/view-state URLs continue to open 物語時系列 without migration.
  - The mode query contract does not conflict with the existing view=1 timeline-state contract.
  - Mode switching supports direct links and browser back/forward navigation without mounting all three renderers at once.
  - Each mode owns its selection, filters, viewport, and mode-specific controls while shared appearance settings remain application-level.
  - The current 物語時系列 behavior, public base path, and development-only worldline editor entry remain intact.
acceptance_focus:
  - URL compatibility
  - isolated view state
  - interaction regression protection
expected_output: implementation
checked_summary_ja: 3種類の独立ビューを単一アプリ内で安全に切り替える共通シェルを構築する。

## Product Goal

Restructure the current single-view application into one application shell with three addressable full-page modes.

The modes are 物語時系列, 物語イベント, and 学マス情報史.
Only one mode is visible and mounted as the primary content at a time.
The three data sets must not be overlaid on one timeline or forced into one time domain.

This plan builds the shell, navigation, URL contract, and page ownership boundaries.
It does not implement the final story graph or real-world history visualization.
Those views may begin as explicit scoped placeholders whose contracts are filled by backlog plans 065 and 066.

## Dependencies

- Plan 065 delivered the initial shell together with the Story Graph MVP.
- Plan 066 remains dependent on the shell for the final real-world history view.
- Plans 065 and 066 must not extend the existing narrative page by mixing their state or data into its lane model.
- The shell may land before either feature view is complete if unfinished modes have a clear unavailable or specification-pending state.
- Use the three view-specific specification directories as the product contract once each specification reaches Approved status.

## Decisions

- Keep one Vite application and the existing `/timeline/` public base path.
- Do not add Vue Router for the first shell implementation.
- Use the `mode` query parameter for the top-level view identity.
- Use `narrative`, `story-graph`, and `realworld` as stable mode IDs.
- Omit `mode=narrative` from canonical default URLs when practical.
- Preserve the existing `view=1` parameter as the narrative view-state version flag.
- Preserve the existing `event` parameter and all published narrative canonical IDs.
- Render only the active page instead of keeping three SVG or graph surfaces hidden in the DOM.
- Keep selection, filters, viewport, and page-specific panels inside their owning page.
- Keep global appearance settings and top-level mode navigation in the application shell.
- Treat `?editor=worldline` in development as an editor override outside the public three-mode navigation.

## URL Contract

Use these canonical shapes.

- 物語時系列 default: `/timeline/`
- 物語時系列 selection: `/timeline/?event=<canonicalId>`
- 物語時系列 shared state: `/timeline/?view=1&...`
- 物語イベント: `/timeline/?mode=story-graph`
- 物語イベント selection: `/timeline/?mode=story-graph&node=<storyBlockId>`
- 物語イベント edge selection: `/timeline/?mode=story-graph&edge=<storyEdgeId>`
- 学マス情報史: `/timeline/?mode=realworld`
- 学マス情報史 selection: `/timeline/?mode=realworld&item=<infoEventId>`

The mode parser must accept only known IDs.
An absent or invalid mode must resolve to `narrative` without throwing.
Invalid mode normalization must not delete unrelated safe query parameters.

Mode switching must use `history.pushState` so browser back and forward traverse mode changes.
Frequent state updates inside a mode may continue to use `history.replaceState`.
A `popstate` listener must update the active mode and selected page state without creating a new history entry.

Define parameter ownership explicitly.

- Global: `mode`, appearance settings that are intentionally shareable, and development diagnostics when applicable.
- Narrative: `event`, existing `view=1` state parameters, category, lanes, range, scale, focus, compare, and common-event visibility.
- Story graph: `node`, `edge`, and later graph-specific filter and viewport parameters.
- Real-world history: `item` and later history-specific filter and calendar-range parameters.

Switching modes must not reinterpret another mode's selection ID.
When building a new mode URL, remove incompatible mode-owned parameters rather than carrying them into the target page.

## Per-Mode State

Keep a session-only last URL for each mode.
Before leaving a mode, record its current path and query.
When the user returns through the mode selector, restore the last URL for that mode or its default URL when no session entry exists.

Do not persist the entire three-mode state to local storage in this plan.
Reloading the page restores the current addressable mode from the URL.
Browser history remains the durable navigation record for the current tab.

The active page must be the only heavy renderer mounted.
If page teardown requires an explicit snapshot, define a small page contract rather than retaining hidden components.

## Component Architecture

Move toward the following ownership tree.

```text
App.vue
  AppShell
    AppHeader
      TimelineModeSwitcher
      SharedAppearanceControls
    ActivePage
      NarrativeTimelinePage
      StoryGraphPage
      RealworldHistoryPage
```

Extract the current public timeline behavior from the monolithic `App.vue` into `NarrativeTimelinePage.vue` or an equivalent clearly owned component.
Treat the extraction as behavior-preserving work.
Do not redesign timeline controls, data semantics, event rendering, or interaction feel during the extraction.

The shared header must expose a stable slot or prop contract for mode-specific primary actions.
Narrative lane and filter controls remain narrative-owned.
Future graph relationship filters remain graph-owned.
Future real-world information-kind filters remain history-owned.

Shared manual entry may route to a mode-specific section, but each page owns the content that explains its unique interaction model.
The shell owns the mode selector label, keyboard focus behavior, and accessible current-mode state.

## Navigation And Accessibility

- Use a compact three-option control on desktop.
- Provide a non-overflowing mobile control, such as a scroll-safe tab list or select-style mode picker.
- Expose the selected mode through semantic state such as `aria-current` or the appropriate tab pattern.
- Preserve visible keyboard focus and logical focus movement after a mode change.
- Move focus to the new page heading or primary region after explicit keyboard activation without surprising pointer users.
- Give each page a distinct accessible region label.
- Ensure mode changes close or transfer ownership of open narrative menus and panels.
- Preserve existing `Escape` behavior inside the narrative page.

## Implementation Phases

- [x] Add a pure mode parser and URL builder with focused unit tests. Delivered by plan 065.
- [x] Define the parameter ownership and cleanup helpers without changing current narrative URL output. Delivered by plan 065.
- [x] Introduce the shell and mode switcher while keeping narrative as the default complete timeline page. Delivered by plan 065.
- [ ] Extract the existing narrative page with behavior-preserving component boundaries.
- [x] Add a real-world history placeholder and a separately mounted story graph page. Delivered by plan 065.
- [ ] Complete mode navigation state. `pushState` and `popstate` restoration are delivered; per-mode last-URL memory remains.
- [ ] Move shared appearance state and header responsibilities to the shell where required.
- [ ] Complete editor and debug query verification. Editor precedence is implemented; explicit debug-query regression coverage remains.
- [x] Update human-facing behavior and manual documentation for the delivered shell.
- [ ] Run full interaction and responsive regression checks.

## Current Implementation State

As of 2026-07-29, `ApplicationRoot.vue` mounts only the selected heavy view,
supports canonical mode URLs, and restores mode changes through browser history.
The narrative implementation remains in `App.vue`, the story graph is a
separate page, and the real-world history view is an explicit placeholder.

The remaining work in this plan is limited to:

- per-mode last-URL memory;
- behavior-preserving narrative page extraction;
- application-level ownership for appearance and shared header state;
- focus transfer and current-mode semantics beyond the native select value;
- editor/debug regression coverage and the final cross-mode regression pass.

## Regression Safeguards

- Do not rename or reinterpret existing narrative `canonicalId` values.
- Do not use `view` as the mode selector because `view=1` already versions narrative shared state.
- Do not change the public base from `/timeline/`.
- Do not add route paths that depend on GitHub Pages fallback handling in this phase.
- Do not mount inactive graph or timeline SVG trees merely to retain state.
- Do not move narrative category, lane, selection, or zoom state into a generic global store without a demonstrated cross-mode need.
- Do not change wheel, drag, touch, keyboard, density, selection, or URL restore semantics during App extraction.

## Test Scenarios

- Direct load of `/timeline/` opens narrative mode.
- Existing `?event=<id>` and `?view=1&...` URLs restore the same narrative state as before.
- Direct loads of `?mode=story-graph` and `?mode=realworld` open the correct page.
- Invalid mode input falls back safely to narrative mode.
- Switching modes creates browser history entries.
- Browser back and forward restore the previous mode and its URL-owned state.
- Returning through the selector restores the session's last URL for that mode.
- Inactive heavy renderers are absent from the DOM.
- Narrative menu, zoom, drag, wheel, touch, keyboard, selection, detail panel, and URL copy remain operational.
- Desktop and narrow mobile navigation expose all three modes without obscuring page controls.
- Development `?editor=worldline` continues to load the editor and does not enter a public timeline mode.

## Non-Goals

- Do not finalize the StoryBlock, StoryEdge, or InfoEvent data contracts in this plan.
- Do not implement final graph layout or real-world calendar rendering.
- Do not merge the three data sets or render them on one coordinate system.
- Do not introduce cross-view comparison or split-screen display.
- Do not replace the current static hosting or deployment workflow.
