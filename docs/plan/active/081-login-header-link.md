# Add a consistent authentication entry link to every public timeline header.

status: active
task_type: ui_layout
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/components/LoginLink.vue
  - src/pages/NarrativeTimelinePage.vue
  - src/pages/StoryGraphPage.vue
  - src/pages/RealworldHistoryPage.vue
  - src/style.css
  - docs/manual.md
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_PLAN_WORKFLOW.md
  - docs/agent/SPEC_UI_DESIGN.md
  - docs/agent/SPEC_ENVIRONMENT.md
  - docs/agent/SPEC_JAPANESE_TECH_WRITING.md
  - docs/agent/SPEC_DECISION_AUDIT.md
validation:
  - npm run test
  - npm run build
  - npm run build:curiretas
  - git diff --check
acceptance:
  - Character timeline, story graph, and real-world history headers expose the same login control.
  - Every control links to https://curiretas.com/auth/login?return_to=%2Fgakumastool%2Ftimeline%2F.
  - The control remains keyboard reachable with the accessible name and title ログインページへ移動 at desktop and 375x812 mobile viewports.
  - Mode switching, existing portal navigation, timeline interactions, legacy builds, and anonymous viewing remain unchanged.
acceptance_focus:
  - all three public page headers
  - exact authentication and return URL
  - mobile header reachability
expected_output: full-implementation
checked_summary_ja: タイムライン各ページのヘッダーにログイン導線を追加する。

## Problem

The application has three public page headers with different markup and
responsive rules. None exposes the existing Curiretas login flow, and two
current external-link controls disappear on narrow viewports.

## Goal

Add one reusable login control to every public page header. A successful login
must return to the canonical Curiretas timeline landing page without changing
the legacy GitHub Pages builds or making authentication mandatory.

## Implementation Instructions

1. Add `src/components/LoginLink.vue` as the single owner of the same-tab
   anchor, exact URL, icon, Japanese visible text, accessible name, title, and
   compact responsive styling.
2. Use the exact destination
   `https://curiretas.com/auth/login?return_to=%2Fgakumastool%2Ftimeline%2F`.
3. Render the shared component in the right-side action area of
   `NarrativeTimelinePage.vue`, `StoryGraphPage.vue`, and
   `RealworldHistoryPage.vue`.
4. Keep the visible text `ログイン` at widths where it fits. At narrow widths,
   the text may become visually hidden, but the icon, `aria-label`, title, and
   keyboard focus target must remain available.
5. Reuse existing header control colors, dimensions, focus treatment, and
   reduced-motion behavior. Adjust page-specific action spacing only as needed
   to prevent title or mode-switcher overlap.
6. Preserve the existing external portal links and `TimelineModeSwitcher`.
   Do not change zoom, drag, wheel, touch, keyboard navigation, view-state URL
   generation, or page selection behavior.
7. Review `docs/manual.md` for whether the global navigation description needs
   a concise update; edit it only if the visible header controls are documented
   there.

## Decisions

- Start authentication through the existing root-domain `/auth/login` route,
  not through the account overview page.
- Return to the fixed canonical path `/gakumastool/timeline/`. Preserving the
  current query-based mode, selection, or viewport is outside this task.
- Keep one shared component across the three headers so URL, copy,
  accessibility, and responsive behavior cannot drift.
- Keep the control visible independently of session state. Do not add session
  fetching, logout behavior, or route guards.
- Keep legacy `/timeline/` and `/timeline/dev/` builds unchanged; their login
  control intentionally starts authentication on `curiretas.com` and returns
  to the canonical Curiretas deployment.

## Tasks

- [ ] Add the shared login component with the exact destination and Japanese
      accessible copy.
- [ ] Mount it in all three public page headers without replacing existing
      controls.
- [ ] Validate both the legacy build and the Curiretas-mounted build.
- [ ] Browser-check all three modes at desktop and 375x812, including keyboard
      focus, no header overlap, and no console or network errors caused by the
      change.
- [ ] Confirm anonymous viewing and existing interactions remain unchanged.

## Validation Notes

Pending implementation.
