---
created: "2026-04-04"
project: "gakumasu-timeline"
assignee: "pm / engineering"
priority: normal
status: done
---

# Zoom Panel Wording Clarity

## Goal

ズーム操作エリアの理解を改善するため、見た目変更には広げず、文言だけで迷いを減らせるかを 1 件の bounded task として定義する。

## Scope

- `src/components/ZoomControls.vue` の表示文言
- 必要な場合のみ README / manual の対応文言

## Problem Statement

- 現在のズーム操作エリアは機能自体はそろっているが、初見で「表示期間」と「レーン密度」の役割差が直感的に伝わりにくい可能性がある
- ここで見た目変更まで含めると scope が広がるため、まずは wording だけで改善余地を検証したい

## Bounded Change Rule

- UI レイアウト変更はしない
- 追加ボタンや新機能は入れない
- 対象は `表示期間` と `レーン密度` の理解補助に限る

## Acceptance Criteria

- PM が、文言だけで改善すべき論点を 1 つに絞れている
- engineering へ渡す場合でも、変更対象は 1 コンポーネント中心で閉じる
- docs 同期が必要でも README / manual の最小差分にとどまる

## Candidate Direction

- `表示期間`: 「どのくらいの期間を画面に出すか」
- `レーン密度`: 「レーンの詰まり具合」

この役割差が UI 上でより早く読める表現にできるかを検討対象にする。

## Exit

- outcome A: wording 変更なし
- outcome B: wording だけの小さな engineering task を起票

## Result

- outcome B
- `表示期間` と `レーン密度` をそれぞれ `横軸` / `縦軸` と結び付ける wording change を実施した
- 変更は `src/components/ZoomControls.vue` を中心に、`README.md` と `docs/manual.md` の最小同期に限定した
- UI レイアウト変更や機能追加は行っていない
- `npm run build` は 2026-04-04 に成功した
