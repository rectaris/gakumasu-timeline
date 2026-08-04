# Docs Sync Playbook

This document is agent-only workflow guidance for keeping human-facing docs aligned with implementation.

## When To Use

- UI text changed
- User-visible behavior changed
- Input controls changed
- Timeline visuals changed
- Selection, panel, or settings behavior changed

## File Selection Rules

- Always review `docs/manual.md` for visible UI or behavior changes.
- Review `README.md` when the main usage flow changed.
- Review `docs/ui-behavior.md` when UI behavior or control behavior changed.
- Review `docs/processing-flow.md` when implementation flow or derived data flow changed.
- Review `docs/data-structure.md` when event fields, IDs, or data contracts changed.
- Review `docs/deploy.md` when deployment, public path, hosted subdirectory, or public link behavior changed.

## Change-To-Docs Matrix

| Change type | Docs to review |
| --- | --- |
| UI labels, controls, panels, menus, settings, manual, or selection behavior | `docs/manual.md`, `docs/ui-behavior.md` |
| Main user workflow or project overview | `README.md` |
| Data fields, IDs, contracts, extraction, or normalization | `docs/data-structure.md`, `docs/processing-flow.md` |
| Deployment, public paths, hosting, or links | `docs/deploy.md`, `README.md` when user-facing |
| Agent workflow, validation, helper, or policy behavior | `AGENTS.md`, `docs/agent/`, `agents-rules/` |

## Update Rules

- Update only the files whose current text is affected.
- Keep human-facing docs focused on user behavior and maintainable explanation depth.
- Do not copy agent-only phrasing into human-facing docs.
- Save human-facing docs as UTF-8 and re-open them after editing.

## Common Misses

- `docs/manual.md` left on old controls after UI changes
- `README.md` still describing removed input behavior
- `docs/ui-behavior.md` missing new close/open behavior
- `docs/processing-flow.md` still referencing removed derived fields

## Final Check

- Implementation and docs describe the same behavior
- No mojibake was introduced
