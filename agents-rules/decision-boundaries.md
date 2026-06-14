# Decision Boundaries

This document defines project-local decision rules for coding agents. Use it
when a task touches approval boundaries, tests, data interpretation, browser
verification, dependencies, generated artifacts, helper delegation, public
paths, deployment, or completion behavior.

## 1. Human Approval Boundaries

Use this table before editing when the task can change product meaning,
published compatibility, or project workflow.

| Change type | Default class | Approval rule |
| --- | --- | --- |
| Mechanical docs, formatting, local cleanup | A | No approval required when scoped and reversible. |
| Normal bug fix or behavior-preserving refactor | B | No approval required after reading the routed specs. |
| Timeline data semantics, chronology, source attribution, or story interpretation | C | Ask before editing unless the user explicitly requested the exact change. |
| Published `canonicalId`, shared URL behavior, public route, or hosted base path | C | Ask before editing unless deployment/routing was the explicit task. |
| Data model, event field contract, generated-data contract, or public API | C | Ask before editing unless the migration is explicitly approved. |
| Visual philosophy, app shell direction, or broad interaction model | C | Ask before editing. |
| Dependency with external service behavior, secrets, or write-capable network effects | C | Ask before adding or enabling. |

If a change spans classes, use the highest class.

## 2. Test Add Or Update Criteria

Add or update focused tests when a change touches:

- timeline data normalization or time math
- `canonicalId`, `instanceId`, URL restore, or common-event selection
- filter, lane visibility, sublane, or selection state transitions
- `singleWithinRange` representation or detail text
- parsing, generated data contracts, or source extraction rules
- regression-prone bug fixes where a concise test can capture the failure

Do not add tests for purely visual spacing changes unless behavior, layout
calculation, accessibility state, or a known regression is involved.

## 3. Browser Verification Evidence

For UI or interaction changes, verify the smallest relevant scenario set and
report what was checked. Save screenshots only when they materially help review,
such as layout changes, mobile/fixed-panel changes, or visual regressions.

Minimum UI report fields:

- viewport or device class checked
- interaction path checked
- visual evidence path, or why evidence was not saved
- remaining unverified risk, if any

## 4. Timeline Data Provenance

When changing timeline data meaning, record the source basis in the active plan,
commit message, or changed data documentation. Include:

- what changed
- the source or trace used
- whether the change is confirmed, inferred, or unresolved
- any compatibility impact for IDs or shared URLs

Do not bury semantic data changes inside UI cleanup commits.

## 5. Uncertainty Representation

Represent uncertain chronology explicitly:

- Unknown timing stays unknown.
- A single event known only to occur within a range uses the range and
  `singleWithinRange`; do not choose a fake midpoint.
- Inferred timing must be described as inferred in notes or task records.
- Conflicting sources require a note or user decision before collapsing to one
  interpretation.

Prefer documentation over model changes unless the current model cannot express
the uncertainty without misleading users.

## 6. Dependency Decisions

Before adding a dependency or major update:

1. Check existing utilities, composables, and dependencies.
2. Prefer extending the current Vue/Vite/Vitest/Playwright stack.
3. Compare at least one maintained external option when custom code would be
   complex.
4. Record why the selected path is simpler or safer.
5. Run `npm run test` and `npm run build`; add an audit/security check for
   broad or security-relevant dependency changes.

Do not mix unrelated lockfile churn with feature work.

## 7. Performance Baseline

Protect interaction feel over decorative polish. For changes that affect
rendering volume, zoom, drag, filters, layout calculation, or data shape, check
the representative timeline with:

- wheel zoom
- drag movement in both axes
- event selection and panel display
- lane hide/show or filtering when touched
- mobile viewport behavior when fixed controls or touch input are involved

Strict numeric budgets are not required until the project adds repeatable
performance tooling.

## 8. Accessibility Target

Use practical WCAG AA as the target for user-facing UI changes:

- icon-only controls have accessible labels
- focusable controls have visible focus states
- panel, menu, manual, and settings close paths are keyboard reachable
- `Escape` behavior remains predictable
- text contrast is readable in light and dark modes
- color is not the only way to communicate uncertainty or selection

If a check cannot be automated, report the manual coverage.

## 9. Public URL And Deployment Boundary

Treat public paths, shared URLs, hosted subdirectories, `canonicalId`, and
deploy commands as external-impact surfaces.

- Build and preview locally when changing route or asset behavior.
- Ask before changing public URL semantics unless that was the explicit task.
- Do not run `npm run deploy` unless the user requested deployment or a
  repository policy explicitly authorizes it.
- Report link or public-path changes in the final response.

## 10. Source And Generated Artifact Ownership

Source files, tests, docs, plan records, and documented scripts are the durable
change surface. Build output, caches, screenshots, and local tool output are
temporary unless a task explicitly makes an artifact tracked.

Before committing a generated artifact, document:

- the source of truth
- the generator command
- how to validate freshness
- why the artifact must be tracked

## 11. Failure Escalation

When the same validation or implementation issue fails three times, stop broad
trial-and-error and switch mode:

- isolate the smallest failing command or scenario
- inspect the relevant source/spec again
- use a read-only reviewer or helper when available and useful
- ask the user when the blocker is a product, data interpretation, or approval
  decision

Record unresolved blockers in the active or checked plan.

## 12. Documentation Update Scope

Use this table after user-visible or behavior changes:

| Change type | Docs to review |
| --- | --- |
| UI labels, controls, panels, menus, settings, manual, selection behavior | `docs/manual.md`, `docs/ui-behavior.md` |
| Main user workflow or project overview | `README.md` |
| Data fields, IDs, contracts, extraction, or normalization | `docs/data-structure.md`, `docs/processing-flow.md` |
| Deployment, public paths, hosting, or links | `docs/deploy.md`, `README.md` when user-facing |
| Agent workflow, validation, helper, or policy behavior | `AGENTS.md`, `docs/agent/`, `agents-rules/` |

Update only files whose current text is made inaccurate by the change.

## 13. Language Boundary

- User-facing responses and reports: Japanese by default.
- Root `README.md` and human-facing README files: Japanese.
- Agent-facing policy files such as `AGENTS.md`, `GEMINI.md`, `docs/agent/*`,
  `.company/*.md`, and `SKILL.md`: English.
- Code comments: match the surrounding file unless a domain term is clearer in
  Japanese.
- Plan manifests: English preferred for operational fields; Japanese is fine
  for human summaries and domain terms.

## 14. Helper Information Boundary

Give helpers the smallest useful context:

- task goal
- allowed read/write scope
- relevant files or snippets
- expected output format
- explicit exclusions

Do not send secrets, local environment files, unrelated repository context, or
private user intent that is not needed for the helper task. Helper output is
advisory until the main agent reviews and accepts it.

## 15. Commit, Push, And Release Boundary

- Commit coherent completed work after successful validation unless the user
  requested otherwise or unrelated dirty files block a clean commit.
- Do not stage unrelated files.
- Do not push unless the user or repository policy explicitly authorizes it.
- Do not deploy unless explicitly requested or explicitly authorized by policy.
- If a commit cannot be made, report the exact dirty-worktree or validation
  blocker.
