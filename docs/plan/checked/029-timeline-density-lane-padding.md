# Timeline density lane padding and dynamic bounds

status: checked
task_type: ui_layout
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/composables/useTimelineLayout.js
  - src/composables/useZoomMachine.js
  - src/App.vue
  - src/utils/constants.js
  - tests/useTimelineLayout.test.js
  - tests/useZoomMachine.test.js
  - docs/ui-behavior.md
  - docs/processing-flow.md
  - docs/manual.md
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_UI_DESIGN.md
  - docs/agent/SPEC_JAPANESE_TECH_WRITING.md
  - agents-rules/invariants.md
  - agents-rules/ui-change-playbook.md
  - agents-rules/timeline-regression-checklist.md
validation:
  - npm run test -- tests/useTimelineLayout.test.js tests/useZoomMachine.test.js
  - npm run build
  - python3 scripts/lint-plan-docs.py
  - git diff --check
acceptance:
  - Changing lane density must not change the distance between a lane top edge and the topmost event in that lane.
  - Existing fixed event height and fixed overlapping-event vertical spacing must remain unchanged.
  - Lane density lower bound must represent the smallest usable height for one event in one lane, not a fixed 75%.
  - Lane density upper bound must represent the largest one-lane display that can fit in a Full HD viewport, not a fixed 250%.
  - Saved and restored URL `scale` values must remain compatible by clamping to the new dynamic bounds.
  - Timeline zoom, drag, wheel, touch, keyboard selection, URL restore, dense summaries, and `singleWithinRange` semantics must not regress.
acceptance_focus:
  - Fixed lane top padding
  - Dynamic density bounds
  - Preserved interaction feel
expected_output: full-implementation
checked_summary_ja: 密度変更時のレーン上端余白と密度範囲を調整する。

## Notes

## Request Summary

利用者は、密度操作でタイムラインのレーン上端と最上部イベントの距離が変動する問題を報告している。

期待する挙動は、イベント間の縦距離と同じように、レーン上端から最上イベントまでの距離を密度変更の対象外にすること。

密度範囲も固定の `75%` から `250%` ではなく、表示に必要な最小値と FHD 表示での最大値から決める。

## Current Hypothesis

`src/composables/useTimelineLayout.js` は `lanePadding` を `Math.max(6, LANE_PADDING * verticalScale.value)` で算出している。

`yPos()` は `lane.laneTop + layoutMetrics.value.lanePadding + ... + eventBarHeight / 2` を使うため、`verticalScale` が変わるとレーン上端から最上イベントまでの距離も変わる。

直近の計画 `028` で `EVENT_BAR_HEIGHT` と `EVENT_SUB_LANE_SPACING` は固定化されている。

今回の修正は、その固定化をレーン上端パディングにも広げる作業になる。

`src/composables/useZoomMachine.js` は `MIN_VERTICAL_SCALE = 0.75` と `MAX_VERTICAL_SCALE = 2.5` を固定値として持つ。

新しい密度範囲は、レーンレイアウト側の固定寸法、表示対象レーン数、実表示領域、FHD 相当の高さを踏まえて算出する必要がある。

## Implementation Plan

1. レーン上端余白の所有箇所を確認する。
   - `layoutMetrics.lanePadding`、`laneHeight`、`yPos()` の関係を追う。
   - レーン上端から最上イベントまでの距離を、`lanePadding + eventBarHeight / 2` として扱うか、イベント上端基準の固定余白として扱うかを実装前に明確にする。

2. 密度スケールの適用対象を分離する。
   - イベント高さは `EVENT_BAR_HEIGHT` の固定契約を維持する。
   - 重なりイベントの中心間隔は `EVENT_SUB_LANE_SPACING` の固定契約を維持する。
   - レーン上端から最上イベントまでの余白も固定契約にする。
   - `verticalScale` は、固定余白やイベント行間ではなく、レーン全体の余剰領域や最小レーン高さの調整に限定する。

3. 密度下限を「イベント1つ分」から導く。
   - 下限は、1レーン内に1イベントを表示できる最小高さとして定義する。
   - 候補式は、固定上端余白、`EVENT_BAR_HEIGHT`、固定下端余白、必要な境界線余白を足した値にする。
   - 既存の `75%` を前提にしたテストや表示文言があれば、新しい契約に合わせて更新する。

4. 密度上限を FHD 表示から導く。
   - FHD は `1920x1080` を基準にする。
   - ヘッダー、ズーム操作 UI、余白、タイムライン上部オフセットを除いた実表示領域を使う。
   - 1レーンだけを表示する場合に、レーン高さがその実表示領域を超えない最大密度を上限にする。
   - 実行環境の viewport が FHD より小さい場合でも、上限定義そのものは FHD 基準として安定させる。

5. ズーム状態と URL 復元を調整する。
   - `useZoomMachine` の固定 `MIN_VERTICAL_SCALE` / `MAX_VERTICAL_SCALE` を、計算された境界値で置き換えるか、境界値を引数として受ける形にする。
   - `zoomInVertical`、`zoomOutVertical`、`zoomVerticallyBy`、`setVerticalScale`、`canZoomInVertical`、`canZoomOutVertical` を新しい境界値で clamp する。
   - URL の `scale` パラメータは廃止せず、復元時に新しい境界値へ clamp する。

6. 回帰テストを追加する。
   - `tests/useTimelineLayout.test.js` で、低密度、標準密度、高密度の `yPos(0, 0) - laneTop` またはイベント上端距離が変わらないことを検証する。
   - 既存のイベント高さ固定とサブレーン間隔固定の検証を維持する。
   - `tests/useZoomMachine.test.js` で、固定 `75%` / `250%` ではなく新しい境界値で clamp されることを検証する。

7. 人間向けドキュメントを同期する。
   - `docs/ui-behavior.md` の密度説明を、イベント高さ、サブレーン間隔、レーン上端余白は固定である説明へ更新する。
   - `docs/processing-flow.md` の `verticalScale` 説明を、実装後の責務に合わせる。
   - `docs/manual.md` は表示文言や利用説明が現状とずれる場合だけ更新する。

8. ブラウザで挙動を確認する。
   - デスクトップ viewport とモバイル相当 viewport で、密度変更時の最上イベント位置、レーン高さ、スクロール感を確認する。
   - ホイール、ドラッグ、タッチ相当、イベント選択、密集イベント、`singleWithinRange` 表示の代表シナリオを確認する。

## Decisions To Confirm During Implementation

**固定余白の基準**：利用者の表現は「レーンの上端と最上部にあるイベントの距離」なので、イベント中心ではなくイベント上端までの距離を固定するのが自然。

**下限の意味**：最低値の「イベント1つ分」は、イベントバー本体だけではなく、クリック、選択アウトライン、不確定表示、境界線との視覚的干渉を避ける最小表示単位として扱う。

**FHD 上限の基準**：FHD の物理高さ `1080px` 全体ではなく、アプリのヘッダーや固定操作 UI を除いたタイムライン表示可能領域を基準にする。

**URL 互換性**：過去 URL の `scale=2.5` のような値は無効化せず、新しい上限に丸めて復元する。

## Implementation Decisions

1. Density value semantics
   - Keep the current meaning where a larger density value makes lane height larger.
   - Keep `100%` as the standard reset point so existing operation feel and URL state remain understandable.

2. Fixed lane top spacing
   - Fix the distance from the lane top edge to the event bar top edge.
   - Keep both event bar height and adjacent overlapping-event center spacing fixed.
   - Keep bottom lane padding fixed as well, so the minimum one-event lane size is explicit.

3. Lower bound
   - Derive the lower bound from one fixed event slot: fixed lane top padding, one fixed sub-lane slot, and fixed lane bottom padding.
   - Do not use the previous fixed `75%` lower bound.

4. Upper bound
   - Derive the upper bound from a Full HD `1080px` viewport minus the fixed app header, timeline top offset, bottom SVG padding, and zoom-control reserve.
   - Keep this bound stable instead of recalculating it per current browser viewport.
   - Use a one-lane basis and allow multi-sub-lane lanes to scroll when their content exceeds the visible area.

5. URL and scroll behavior
   - Keep the existing `scale` URL parameter and clamp restored values to the new bounds.
   - Do not add broad scroll anchoring in this task; existing selected-event return behavior remains responsible for explicit recentering.

6. Empty lanes and tests
   - Apply the same density calculation to empty lanes and event lanes.
   - Test both concrete spacing contracts and invariance across density changes.

## Out Of Scope

- イベントデータ、時系列解釈、出典、キャラクター名、canonical ID の変更。
- 密度操作 UI の全面再設計。
- 横方向ズーム、期間プリセット、検索、絞り込み、レーン選択仕様の変更。
- FHD 以外の画面ごとに密度上限を動的に変える仕様。

## Implementation Summary

- Added derived density bounds in `src/utils/constants.js`.
- Replaced the fixed `75%` / `250%` vertical-scale clamp with event-slot and Full-HD-derived bounds.
- Kept `lanePadding` fixed so the lane top edge to topmost event bar distance no longer changes with density.
- Kept event bar height and overlapping-event sub-lane spacing fixed.
- Updated focused layout and zoom-machine tests for the new spacing and clamp contracts.
- Updated behavior documentation and the operation manual to describe fixed top spacing and dynamic bounds.

## Validation Notes

実装完了時は、少なくとも `npm run test -- tests/useTimelineLayout.test.js tests/useZoomMachine.test.js`、`npm run build`、`git diff --check` を実行する。

UI 挙動に触れるため、ブラウザ検証が使える場合は desktop と mobile viewport の目視または自動確認を実施する。

## Validation Results

- `npm run test -- tests/useTimelineLayout.test.js tests/useZoomMachine.test.js`: passed.
- `npm run test`: passed, 14 files and 71 tests.
- `npm run build`: passed.
- `python3 scripts/lint-plan-docs.py`: passed.
- `python3 scripts/format-plan-docs.py --check`: passed.
- `git diff --check`: passed.
- `python3 scripts/validate-changes.py --print-only`: selected `git diff --check`, `python3 scripts/lint-plan-docs.py`, and `python3 scripts/format-plan-docs.py --check`.

## Browser Verification

- Preview URL: `http://127.0.0.1:4174/timeline/`.
- Desktop `1280x900`: first-lane top distance stayed `10px` when density changed from `100%` to `132%`; keyboard selection opened the detail panel.
- Mobile `375x812`: first-lane top distance stayed `10px` when density changed from `100%` to `132%`; keyboard selection opened the detail panel.
- Desktop extended density check: first-lane height changed from `86px` to `183.54137175234365px` at `306%`, while top distance stayed `10px`.

## Residual Notes

- Browser verification observed aborted external `https://www.google.com/recaptcha/api2/aframe` requests on localhost. No app asset or data request failed.
