# Gakumasu Real-World History View

status: active
task_type: product_logic
review_class: C
human_design_required: yes
human_approval_status: approved
target_files:
  - data/raw/realworld_events/
  - data/raw/story_events/
  - src/data/
  - src/types/
  - src/pages/RealworldHistoryPage.vue
  - src/components/realworld-history/
  - src/composables/
  - src/utils/
  - scripts/generate-data.mjs
  - scripts/validate-data.mjs
  - tests/
  - docs/realworld-history/
  - docs/data-structure.md
  - docs/ui-behavior.md
  - docs/manual.md
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_ENVIRONMENT.md
  - docs/agent/SPEC_UI_DESIGN.md
validation:
  - npm run validate:data
  - npm run test
  - npm run build
  - browser verification for calendar scale, date precision, range events, filtering, selection, direct URLs, and mobile inspection
  - git diff --check
  - python3 scripts/validate-changes.py
acceptance:
  - The 学マス情報史 view presents curated real-world Gakumasu history on a Gregorian calendar rather than the narrative 31-day abstract calendar.
  - Real-world records preserve announcement time, occurrence or release time, duration, timezone, precision, category, and official source provenance when applicable.
  - Story-block release records can project into the history view without duplicating their source-of-truth metadata.
  - The view is addressable through mode=realworld and a stable item selection parameter.
  - Unknown or month-only dates remain visibly imprecise instead of being assigned invented days.
  - The final implementation begins only after the content scope, source policy, and calendar data contract receive a dedicated review.
acceptance_focus:
  - Gregorian time semantics
  - official provenance
  - sustainable data maintenance
expected_output: implementation
checked_summary_ja: 現実世界の日付で学マスの展開をたどる学マス情報史ビューを構築する。

## Goal

Build 学マス情報史 as a dedicated real-world timeline.

The view covers curated Gakumasu milestones such as game updates, story releases, music, live events, streams, media activity, and other approved official developments.
It must not reuse the narrative timeline's fixed 31-day month semantics.

## Start Gate

The contract review is complete and recorded in
`docs/realworld-history/decisions/`.

The focused specification proposal now exists in `docs/realworld-history/`.
Before promotion to active:

Completed:

- [x] Review every item in `docs/realworld-history/review-checklist.md`.
- [x] Record accepted decisions in `docs/realworld-history/decisions/`.
- [x] Change the specification from `Proposed` to `Approved`.

Representative factual records still require official-source verification.
The storage, validation, and UI implementation may proceed with an empty
published dataset; no candidate becomes production data before that review.

Plan 064 is complete. The application shell already provides the
`mode=realworld` page boundary; this plan owns the real-world page contents and
the `item` selection contract.

## Settled Direction

- Keep real-world calendar data separate from the narrative `DateLike` contract.
- Use ISO-compatible dates or timestamps with explicit precision and timezone semantics.
- Use `Asia/Tokyo` as the default timezone unless an event requires another explicit timezone.
- Distinguish an announcement date from a release, start, end, or occurrence date.
- Require stable IDs and official source provenance for curated factual records.
- Preserve unknown day or time precision rather than inventing a precise value.
- Reuse the shared application shell, selection, detail, color, URL, and interaction patterns while providing a Gregorian scale adapter and mode-owned filters.
- Derive eligible story-release history items from StoryBlock release metadata instead of manually maintaining duplicate records.

## Approved Specification 0.2

The following contracts are approved:

- Include high-signal game updates, story releases, music releases, official
  live events, and official streams.
- Exclude routine social posts, merchandise, minor campaign notices, and
  community-run events from the MVP.
- Treat one real-world occurrence as one InfoEvent. Store announcement and
  occurrence time separately on that record, and group separate performances
  with `groupId`.
- Use explicit `month`, `date`, or `minute` precision and preserve the authored
  timezone without viewer-local conversion.
- Keep official corrections as revisions, and show approved future events with
  a visible scheduled state.
- Require official provenance for published records. Keep secondary-source-only
  candidates unreviewed.
- Use category lanes, with an initial viewport from the previous 12 months to
  the next 90 days.
- Start with manual JSON authoring and a four-state publication lifecycle.

Canonical details and synthetic examples are linked from
`docs/realworld-history/README.md`.

## Specification Work

- [x] Propose the initial inclusion boundary and exclusions.
- [x] Propose the InfoEvent contract, datetime precision, states, and revisions.
- [x] Propose the official-source hierarchy and publication lifecycle.
- [x] Propose lanes, filters, date labels, default range, and mobile behavior.
- [x] Propose the projection and cross-view reference boundary.
- [x] Receive explicit approval or requested revisions for specification 0.2.
- [x] Select and verify the representative factual initial data set.
- [x] Record approved decisions and mark the specification `Approved`.

## Implementation Tasks

- [x] Add the InfoEvent model, datetime parsing, validation, and tests.
- [x] Add unreviewed and published raw-data boundaries and deterministic generation.
- [x] Prove that production bundles exclude unreviewed real-world records.
- [x] Build the Gregorian timeline scale, category lanes, precision-aware items, and status display.
- [x] Add search, category and status filters, viewport controls, details, and `item` URL restoration.
- [x] Verify desktop and mobile interaction, layout, empty states, and direct URLs.
- [x] Verify and publish a small representative official-source dataset, or document why production remains empty.
- [x] Update user and data documentation, run full validation, and archive this plan.

## Validation Notes

- `npm run verify`: 22 test files and 118 tests passed, production build passed,
  and both publication boundaries passed.
- `node scripts/verify-realworld-history.mjs`: development and production,
  desktop and mobile, filtering, selection URL, and unpublished-data exclusion
  passed.
- Screenshots inspected:
  `/tmp/realworld-history-desktop.png` and
  `/tmp/realworld-history-mobile.png`.
- The first production record was checked against the official product site;
  details are in `docs/realworld-history/initial-dataset-review.md`.
- `python3 scripts/security-static-check.py`,
  `python3 scripts/validate-changes.py`, plan lint, plan format, and
  `git diff --check` passed.

## Initial Validation Rules

- InfoEvent IDs are globally unique within the real-world namespace.
- Required date values use the approved ISO-compatible form.
- Start and end ordering is valid in the stated timezone.
- Precision fields agree with the supplied date or timestamp.
- Month-only and unknown-day records do not acquire generated concrete days as factual claims.
- Every factual record includes the required official provenance or an explicit unresolved source status.
- Derived story-release items reference an existing StoryBlock and are not duplicated by authored InfoEvent records.
- Published item URLs restore the same canonical record after data regeneration.
- Production bundles contain no `unreviewed` real-world records.

## Non-Goals For The Initial Specification

- Do not mix real-world dates with the in-world abstract year axis.
- Do not scrape arbitrary external sites in the first release.
- Do not treat every official social post as a historical milestone by default.
- Do not duplicate StoryBlock release metadata into a second manually edited source of truth.
- Do not add notification, calendar subscription, or live operational scheduling features until the historical view is stable.
