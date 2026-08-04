# Validation

Generated for primary language: `mixed`.

Optional SkillSpector scan: `true`.

## Baseline

- Validate every non-trivial change.
- Choose the smallest complete command set for the files changed.
- Record commands that could not run and why.

## Matrix

- Docs-only: `git diff --check`.
- Shell scripts: `sh -n <script>` and a smoke run when possible.
- Python scripts: `python3 -m py_compile <files>` and tests when available.
- JavaScript/TypeScript: project build, unit tests, and lint when available.
- Agent workflow docs or hooks: structure lint plus syntax checks.
- Plan lifecycle, archive, handoff, or completion tooling: plan lint plus script syntax checks.
- Codex hook Python: Python compile validation.
- Codex config or custom agent TOML: TOML parse validation.
- GitHub Actions or maintained scripts: static security checks when enabled.
- Mixed default: run the smallest complete validation set for every language surface touched.

## Project-Specific Minimums

- Docs-only policy changes: `git diff --check`, plan lint when plan files changed, and structure scan when agent workflow files changed.
- Runtime logic changes: `npm run test` plus `npm run build`, or `npm run verify` when it covers both.
- Timeline data normalization or time math changes: include the focused Vitest files that cover data and time behavior.
- URL restore, common-event selection, ID handling, filters, lane visibility, or `singleWithinRange` changes require focused tests when a concise regression test is practical.
- UI interaction or layout changes: `npm run build` plus browser or visual verification when available.
- Public path, asset, or deploy config changes: `npm run build` and inspect or preview generated asset paths.
- Dependency changes: run `npm run test` and `npm run build`; run a security/audit check when the dependency change is security-relevant or broad.

## Browser Verification

- Use browser automation when available for timeline zoom, drag, panel, menu, and mobile viewport checks.
- If an expected browser helper is unavailable, use Playwright, Vite preview, or manual browser verification through the local stack when practical.
- For UI, route, asset, or interaction changes, inspect browser console errors and failed network requests when browser tooling exposes them.
- Treat new runtime errors, asset 404s, and failed app-data requests as validation failures unless they are proven unrelated and reported.
- If browser verification cannot run, report the exact blocker and identify which interaction or viewport remains unverified.
- For visual or interaction changes, report the viewport, scenario, saved evidence path when useful, and any remaining unverified risk.
- Save screenshots or logs only when they materially help review; keep them temporary unless a task explicitly requires tracked evidence.

## Failure Escalation

- If the same validation or implementation problem fails three times, stop broad trial-and-error.
- Isolate the smallest failing command or scenario, reread the relevant spec/source, and use a reviewer/helper when available and useful.
- Ask the user when the blocker is a product decision, data interpretation, approval boundary, or external-state dependency.
- Record unresolved blockers in the active or checked plan.

## Completion

Before final report:

1. Run required validation.
2. Run `scripts/validate-changes.py` when change-aware validation is enabled.
3. Run `scripts/check-agent-completion.sh` when plan lifecycle is enabled.
4. Inspect `git status --short`.
5. Commit coherent changes unless the user requested otherwise.
6. Report touched repositories, link changes, validation, and commit hash.

## Change-Aware Validation

- Use `scripts/validate-changes.py` to select the smallest complete validation set from changed files.
- It inspects staged files first, then unstaged files, unless `--all` is supplied.
- Use `--print-only` to review selected commands without running them.
- Treat selected commands as a floor, not a ceiling; add focused tests when risk requires it.

## Optional Checks

- Static security: `python3 scripts/security-static-check.py`
- SkillSpector agent-skill scan: `scripts/skillspector-scan.sh <skill-path>`
- Structure scanner: `python3 scripts/structure-map.py --check`
- Plan lint: `python3 scripts/lint-plan-docs.py`
- Plan format check: `python3 scripts/format-plan-docs.py --check`

## SkillSpector

Use NVIDIA SkillSpector before installing, updating, or vendoring AI agent skills from external sources.

- Run `scripts/skillspector-scan.sh <skill-path>` for static-only analysis.
- Set `SKILLSPECTOR_USE_LLM=1` only when semantic LLM analysis is intentionally required.
- Keep provider credentials in environment variables or a secret store; do not commit them.
- Treat HIGH or CRITICAL results as blocking until reviewed and remediated.
