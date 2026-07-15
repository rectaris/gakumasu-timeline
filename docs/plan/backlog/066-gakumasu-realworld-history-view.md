# Gakumasu Real-World History View

status: backlog
task_type: product_logic
review_class: C
human_design_required: yes
human_approval_status: approved
target_files:
  - data/raw/realworld_events/
  - data/raw/story_blocks/
  - src/data/
  - src/types/
  - src/pages/RealworldHistoryPage.vue
  - src/components/realworld-history/
  - src/composables/
  - src/utils/
  - scripts/generate-data.mjs
  - scripts/validate-data.mjs
  - tests/
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

Do not begin implementation from this backlog outline alone.

Before promotion to active, produce and approve a focused specification that defines content inclusion, official-source policy, Gregorian date and time fields, category taxonomy, correction workflow, update ownership, and representative initial records.
Record only the accepted decisions in the promoted active plan.

Plan 064 must provide the `mode=realworld` page boundary and selection URL contract, or this plan must coordinate that prerequisite without duplicating shell ownership.

## Settled Direction

- Keep real-world calendar data separate from the narrative `DateLike` contract.
- Use ISO-compatible dates or timestamps with explicit precision and timezone semantics.
- Use `Asia/Tokyo` as the default timezone unless an event requires another explicit timezone.
- Distinguish an announcement date from a release, start, end, or occurrence date.
- Require stable IDs and official source provenance for curated factual records.
- Preserve unknown day or time precision rather than inventing a precise value.
- Reuse the shared application shell, selection, detail, color, URL, and interaction patterns while providing a Gregorian scale adapter and mode-owned filters.
- Derive eligible story-release history items from StoryBlock release metadata instead of manually maintaining duplicate records.

## Specification Work

- Define the initial inclusion boundary for game, story, music, live, stream, media, product, campaign, and announcement records.
- Define whether routine social posts, minor corrections, reruns, merchandise, and community events belong in the first release.
- Define the InfoEvent contract for stable ID, category, title, announcement time, start, end, precision, timezone, detail, source, and related entities.
- Define all-day, month-only, scheduled, postponed, cancelled, corrected, and ongoing-event semantics.
- Define the canonical source hierarchy and how deleted or corrected official pages are recorded.
- Define the update and review workflow so the timeline does not become stale or silently rewrite history.
- Define grouping lanes, category filters, density handling, date labels, default range, and mobile inspection behavior.
- Define cross-view links between real-world story releases and their 物語イベント nodes.
- Define the initial manually curated data set before considering automated collection.
- Define whether future events are shown and how scheduled information is visually distinguished from completed history.

## Initial Validation Rules

- InfoEvent IDs are globally unique within the real-world namespace.
- Required date values use the approved ISO-compatible form.
- Start and end ordering is valid in the stated timezone.
- Precision fields agree with the supplied date or timestamp.
- Month-only and unknown-day records do not acquire generated concrete days as factual claims.
- Every factual record includes the required official provenance or an explicit unresolved source status.
- Derived story-release items reference an existing StoryBlock and are not duplicated by authored InfoEvent records.
- Published item URLs restore the same canonical record after data regeneration.

## Non-Goals For The Initial Specification

- Do not mix real-world dates with the in-world abstract year axis.
- Do not scrape arbitrary external sites in the first release.
- Do not treat every official social post as a historical milestone by default.
- Do not duplicate StoryBlock release metadata into a second manually edited source of truth.
- Do not add notification, calendar subscription, or live operational scheduling features until the historical view is stable.
