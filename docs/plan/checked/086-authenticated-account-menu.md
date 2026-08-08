# Make every timeline header reflect the shared tool session and expose account and logout actions.

status: checked
task_type: ui_layout
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/auth/toolSession.js
  - src/components/AccountControl.vue
  - src/components/ApplicationHeader.vue
  - src/components/LoginLink.vue
  - docs/manual.md
  - docs/ui-behavior.md
  - tests/toolSession.test.js
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
  - python3 scripts/validate-changes.py
  - git diff --check
acceptance:
  - On the canonical curiretas.com origin, the shared timeline header checks GET /auth/session and renders the existing login link only for an anonymous or unavailable result.
  - All three timeline views replace the login link with one accessible account control after authentication is confirmed.
  - The account disclosure links to https://accounts.curiretas.com/ and sends one same-origin POST /auth/logout request from the 三アプリからログアウト action.
  - Logout progress, success, and failure remain truthful and keyboard operable at desktop and 375x812 mobile viewports.
  - Legacy GitHub Pages builds remain anonymous-compatible, make no session-state request, and keep their existing canonical Curiretas login link.
acceptance_focus:
  - one shared control across all timeline views
  - session and logout state transitions
  - canonical and legacy build behavior
expected_output: full-implementation
checked_summary_ja: タイムライン各画面のヘッダーをログイン状態に応じて切り替え、アカウントページと三アプリ共通ログアウトへの操作を追加する。

## Problem

The shared timeline header always displays `ログイン`, including when the
browser already has the `curiretas.com` session shared by the three
applications.
The timeline also has no UI for ending that shared session.

## Goal

Replace the fixed login link with one reusable account control that reflects
the current tool-host session in all three timeline views.
Keep anonymous viewing, existing timeline interactions, and legacy GitHub Pages
builds unchanged.

## Implementation Instructions

1. Add `src/auth/toolSession.js` as the small boundary around session-response
   validation, origin eligibility, same-origin `GET /auth/session`, and
   same-origin `POST /auth/logout`.
   Both requests use `credentials: "same-origin"` and
   `Accept: application/json`; the browser supplies the same-origin mutation
   header required by the account Worker.
2. Limit session integration to `https://curiretas.com` and supported loopback
   development origins.
   On GitHub Pages and other legacy public origins, skip the session request and
   render the existing login link with its exact canonical Curiretas return URL.
3. Replace `LoginLink.vue` with `AccountControl.vue` and update
   `ApplicationHeader.vue` as the sole mounting point, so narrative timeline,
   story graph, and real-world history cannot drift.
   Remove `LoginLink.vue` after its anonymous-link behavior is preserved inside
   the replacement component.
4. Model checking, anonymous, authenticated, unavailable, and logging-out
   states explicitly.
   Use a stable non-interactive placeholder while checking; fall back to the
   usable login link when the check is unavailable without claiming the
   response confirmed an anonymous session.
5. In the authenticated state, render a person/account icon button with the
   accessible name `ログイン済み。アカウントメニューを開く`.
   Its anchored non-modal disclosure contains:
   - a same-tab `https://accounts.curiretas.com/` link labelled
     `アカウントページを開く`;
   - a `三アプリからログアウト` button;
   - concise text that the account page remains logged in.
6. Close the disclosure on Escape and outside activation, expose expanded
   state on the trigger, preserve normal keyboard order, and restore focus when
   appropriate.
   Reuse the current header-control dimensions, colors, focus outline, and
   responsive label treatment instead of adding another visual system.
7. While logout is pending, prevent duplicate submissions.
   On success, close the disclosure and render the existing anonymous login
   link.
   On failure, keep the authenticated state and expose
   `ログアウトできませんでした。もう一度お試しください。` in a polite live
   region so the operation can be retried.
8. Check the session on component mount and when the document becomes visible
   after another tab may have changed the shared session.
   Deduplicate concurrent checks and do not add polling, cross-tab storage,
   route guards, or application-owned session persistence.
9. Add focused unit tests for response validation, origin gating, exact request
   methods and paths, logout failure, and successful state transitions.
   Browser-check the shared control in all three modes at 1440x900 and 375x812,
   including outside click, Escape, focus, console errors, and failed requests.
10. Update `docs/manual.md` and `docs/ui-behavior.md` so they describe the
    anonymous login link and the authenticated account disclosure without
    implying that the account-host session is also logged out.

## Decisions

- A successful same-origin GET /auth/session response whose authenticated property is true.
  This is the only condition that selects the authenticated header branch.
- Authenticated account control means the header button rendered after the current curiretas.com tool session is confirmed authenticated.
- A same-tab link in the authenticated header disclosure whose destination is https://accounts.curiretas.com/.
  Following it does not revoke either host-specific session.
- Three-application logout means revoking the current browser session shared by the portal, timeline, and support-card application while leaving the account-host session active.
- A loaded application whose origin is neither the canonical curiretas.com origin nor an explicitly supported local test origin.
  It keeps the existing canonical Curiretas login link and skips session-state
  integration.
- The three-application logout label is `三アプリからログアウト`; `一括ログアウト` and
  `すべての端末からログアウト` are outside this plan.
- The header does not display or persist the user id or display name returned by
  the session endpoint.
- The account link and login navigation use the current tab.
- No new dependency is needed; use Vue and browser primitives already present.

## Tasks

- [x] Add and unit-test the tool-session boundary.
- [x] Replace the fixed login component with the shared authenticated account control.
- [x] Document the anonymous and authenticated header behavior.
- [x] Validate both legacy and Curiretas builds and all three timeline modes.
- [x] Browser-check desktop and mobile session, disclosure, logout, and error states.

## Validation Notes

- `npm run test` passed 144 tests across 26 files.
- `npm run build` passed for the legacy `/timeline/` build.
- `npm run build:curiretas` passed for the canonical
  `/gakumastool/timeline/` build.
- `python3 scripts/validate-changes.py`, the static security check, and
  `git diff --check` passed.
- Headless Chromium checked all three views at `1440x900` and `375x812` using
  the built application under the canonical origin boundary.
- Browser checks covered authenticated disclosure rendering, exact account and
  login links, outside activation, Escape, focus restoration, logout progress,
  failed logout retry, successful logout, visibility refresh, anonymous and
  unavailable fallbacks, horizontal overflow, and unexpected console or
  network failures.
- A virtual legacy GitHub Pages origin made no session request and retained the
  exact canonical Curiretas login link.
- Temporary visual evidence is stored outside the repository under
  `/tmp/gakumasu-086-account-qa/` and is not tracked.
