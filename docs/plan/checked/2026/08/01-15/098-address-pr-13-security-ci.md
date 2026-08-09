# Address PR 13 security review and CodeQL failure

status: checked
task_types:
  - security
  - planning_docs
  - orchestration_meta
review_class: B
human_design_required: no
human_approval_status: not_required
write_scope:
  - .project-agent-workflow/scripts/human-report.py
  - .project-agent-workflow/docs/agent/SPEC_COPIER_ADOPTION.md
  - .codex/hooks/stop_review_gate.py
  - docs/plan/
context_files:
  - .project-agent-workflow/hooks/stop_review_gate.py
target_json:
  - none
required_specs:
  - docs/agent/PROJECT_POLICY.md
  - .project-agent-workflow/docs/agent/SPEC_VALIDATION.md
  - .project-agent-workflow/docs/agent/SPEC_GIT_WORKFLOW.md
  - .project-agent-workflow/docs/agent/SPEC_FILE_MANAGEMENT.md
  - .project-agent-workflow/docs/agent/SPEC_USER_COMMUNICATION.md
  - .project-agent-workflow/docs/agent/SPEC_HUMAN_REPORTING.md
  - .project-agent-workflow/docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - .project-agent-workflow/docs/agent/SPEC_SECURITY.md
  - .project-agent-workflow/docs/agent/SPEC_PLAN_WORKFLOW.md
  - .project-agent-workflow/docs/agent/SPEC_ORCHESTRATION.md
validation:
  - git diff --check
  - python3 -m py_compile .project-agent-workflow/scripts/human-report.py
  - python3 -m py_compile .codex/hooks/stop_review_gate.py
  - python3 .project-agent-workflow/scripts/security-static-check.py --changed
  - python3 .project-agent-workflow/scripts/validate-changes.py --all
  - npm run test
  - npm run build
acceptance:
  - The two clear-text logging alerts no longer reproduce on the updated PR head.
  - Human-report assessment and render refusal return only aggregate safety metadata and never echo detected secret material.
  - The legacy Stop bridge remains non-blocking and does not invoke the canonical lifecycle gate a second time.
  - Repository validation passes and PR 13 has no remaining failing actionable check caused by this change.
acceptance_focus:
  - Remove the CodeQL taint path without weakening secret detection.
  - Preserve the human-report CLI JSON contract, single Stop-gate invocation, and existing application behavior.
checked_summary_ja: PR #13 の GitHub Advanced Security 指摘2件を修正し、CodeQL と既存検証を通過させた。

## Problem

PR #13 initially had two GitHub Advanced Security review threads at the human-report CLI's assessment output sites. CodeQL traced secret-detection regular expressions through the paired detector-description container into printed assessment JSON, causing the aggregate CodeQL check to fail even though the language analysis jobs completed successfully. After that fix, automated review identified that the legacy Stop bridge contradicts the managed orchestration policy by forwarding to the canonical blocker and allowing duplicate invocation.

## Goal

Separate secret detectors from their fixed diagnostic labels so assessment output cannot carry regex-derived sensitive data, and restore the legacy Stop bridge's non-blocking compatibility behavior while preserving the canonical managed gate and all existing validation behavior.

## Implementation Instructions

Refactor only the secret-pattern declaration and assessment loop in `human-report.py`. Keep the four detections and their existing user-facing reason text, but ensure the matched pattern object or match result is never stored with or appended as output metadata. Restore `.codex/hooks/stop_review_gate.py` as a stdin-consuming no-op bridge that prints `{}`, and align the Copier adoption description with the orchestration policy. Exercise normal assessment, secret blocking, render refusal, and Stop-bridge behavior, then run change-aware and application validation. Commit, push `dev`, and inspect PR #13's new checks and review-thread state.

## Decisions

- Treat both unresolved review threads and the failing CodeQL check as one root cause.
- Preserve the structured blocked-assessment output instead of suppressing CodeQL or removing secret detection.
- Treat the later Stop-bridge review as actionable because `SPEC_ORCHESTRATION.md` explicitly requires non-blocking compatibility behavior and duplicate hook execution cannot be deduplicated by source precedence.
- Do not reply to or manually resolve review threads because the user authorized fixes, not PR conversation mutations.

## Tasks

- [x] Reproduce and classify the two Advanced Security alerts and failing check.
- [x] Decouple secret detectors from output labels without weakening detection.
- [x] Validate normal, blocked, and refused-render behavior plus repository checks.
- [x] Restore and validate the non-blocking legacy Stop bridge.
- [x] Archive the plan, commit, push, and verify PR #13 checks and thread state.

## Validation Notes

- PR #13 had two unresolved, current GitHub Advanced Security threads on `human-report.py` assessment output and one failed aggregate CodeQL check. The actions, JavaScript/TypeScript, and Python analysis jobs themselves completed successfully.
- Alerts 8 and 9 both reported `py/clear-text-logging-sensitive-data` at the stdout and stderr assessment output sites and traced the finding to the paired secret-pattern declaration.
- The fix keeps all four secret detectors and existing diagnostic messages but separates each fixed output label from its detector and match result.
- Focused CLI smoke validation confirmed a safe report is skipped, a fake GitHub-token-like value is blocked, neither assessment nor render-refusal output echoes the fake value, and blocked render exits with status 3.
- `python3 .project-agent-workflow/scripts/plan_validation_commands.py run-plan docs/plan/active/098-address-pr-13-security-ci.md` passed Python compilation, changed-file static security, change-aware validation, 144 core tests, seven Worker tests, UI verification, and the Vite 7.3.6 build.
- After commit `e797e56`, all three CodeQL analysis jobs and the aggregate CodeQL check passed. Advanced Security marked alerts 8 and 9 fixed and automatically resolved both review threads.
- A later automated review identified the legacy Stop bridge's forwarding behavior as inconsistent with `SPEC_ORCHESTRATION.md`. The bridge now consumes stdin and returns `{}` without importing or invoking the canonical managed gate, and the Copier adoption description states the same single-invocation contract.
- The non-blocking bridge smoke check returned `{}` and contained no managed-gate import or target path. The complete active-plan validation passed again after the bridge correction.
- After commit `5eaf249`, the three language analysis jobs and aggregate CodeQL check passed again. The Stop-bridge review thread is outdated on the new diff; it remains manually unresolved because this task did not authorize resolving review conversations.
