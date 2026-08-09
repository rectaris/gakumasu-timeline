# Address PR 13 security review and CodeQL failure

status: in_progress
task_types:
  - security
  - planning_docs
review_class: B
human_design_required: no
human_approval_status: not_required
write_scope:
  - .project-agent-workflow/scripts/human-report.py
  - docs/plan/
context_files:
  - none
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
validation:
  - git diff --check
  - python3 -m py_compile .project-agent-workflow/scripts/human-report.py
  - python3 .project-agent-workflow/scripts/security-static-check.py --changed
  - python3 .project-agent-workflow/scripts/validate-changes.py --all
  - npm run test
  - npm run build
acceptance:
  - The two clear-text logging alerts no longer reproduce on the updated PR head.
  - Human-report assessment and render refusal return only aggregate safety metadata and never echo detected secret material.
  - Repository validation passes and PR 13 has no remaining failing actionable check caused by this change.
acceptance_focus:
  - Remove the CodeQL taint path without weakening secret detection.
  - Preserve the human-report CLI JSON contract and existing application behavior.
checked_summary_ja: PR #13 の GitHub Advanced Security 指摘2件を修正し、CodeQL と既存検証を通過させた。

## Problem

PR #13 has two unresolved GitHub Advanced Security review threads at the human-report CLI's assessment output sites. CodeQL traces secret-detection regular expressions through the paired detector-description container into printed assessment JSON, causing the aggregate CodeQL check to fail even though the language analysis jobs complete successfully.

## Goal

Separate secret detectors from their fixed diagnostic labels so assessment output cannot carry regex-derived sensitive data, while preserving the blocking response contract and all existing validation behavior.

## Implementation Instructions

Refactor only the secret-pattern declaration and assessment loop in `human-report.py`. Keep the four detections and their existing user-facing reason text, but ensure the matched pattern object or match result is never stored with or appended as output metadata. Exercise normal assessment, secret blocking, and render refusal, then run change-aware and application validation. Commit, push `dev`, and inspect PR #13's new CodeQL result and review-thread state.

## Decisions

- Treat both unresolved review threads and the failing CodeQL check as one root cause.
- Preserve the structured blocked-assessment output instead of suppressing CodeQL or removing secret detection.
- Do not reply to or manually resolve review threads because the user authorized fixes, not PR conversation mutations.

## Tasks

- [x] Reproduce and classify the two Advanced Security alerts and failing check.
- [x] Decouple secret detectors from output labels without weakening detection.
- [x] Validate normal, blocked, and refused-render behavior plus repository checks.
- [ ] Archive the plan, commit, push, and verify PR #13 checks and thread state.

## Validation Notes

- PR #13 had two unresolved, current GitHub Advanced Security threads on `human-report.py` assessment output and one failed aggregate CodeQL check. The actions, JavaScript/TypeScript, and Python analysis jobs themselves completed successfully.
- Alerts 8 and 9 both reported `py/clear-text-logging-sensitive-data` at the stdout and stderr assessment output sites and traced the finding to the paired secret-pattern declaration.
- The fix keeps all four secret detectors and existing diagnostic messages but separates each fixed output label from its detector and match result.
- Focused CLI smoke validation confirmed a safe report is skipped, a fake GitHub-token-like value is blocked, neither assessment nor render-refusal output echoes the fake value, and blocked render exits with status 3.
- `python3 .project-agent-workflow/scripts/plan_validation_commands.py run-plan docs/plan/active/098-address-pr-13-security-ci.md` passed Python compilation, changed-file static security, change-aware validation, 144 core tests, seven Worker tests, UI verification, and the Vite 7.3.6 build.
