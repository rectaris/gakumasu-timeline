---
created: "2026-04-04"
project: "gakumasu-timeline"
status: in-progress
tags: ["timeline", "pm", "next-phase", "roadmap"]
---

# Gakumasu Timeline Next Phase Plan

## Purpose

`intro-guide` の最小調整後に、`gakumasu-timeline` の次段を広げすぎずに進めるための PM 順序を定義する。

## Current Position

- intro-guide の abstract-time 注記は最小修正で更新済み
- 実装は 1 リポジトリ内で完結しており、portal 側への波及はまだ不要
- 次は「追加で直すか」ではなく、「何を確認したうえで次の小さな改善を選ぶか」を整理する段階

## Next Order

1. 実表示の再確認
2. 用語統一の確認
3. 操作感の細かな磨き込み候補の選定
4. 安定性と検証手順の整理
5. データ量増加時の見直し

## Immediate Plan

### 1. 実表示の再確認

Goal:
- 今回の wording adjustment で初見時の誤読余地が十分に減ったかを確認する

Owner:
- `pm`

Exit:
- 追加修正なしで閉じる、または 1 件の follow-up が必要と判断する
Current PM handling:
- 実ブラウザ確認待ちの間に、用語統一確認と次候補比較の PM 文書を先行で準備する
Current result:
- headless Chrome による desktop / mobile 幅の smoke check では大崩れなし
- ただし Windows Chrome 実機確認は未実施

### 2. 用語統一の確認

Goal:
- UI / README / manual の 3 面で、同じ概念を同じ言葉で説明できているかを見る

Owner:
- `pm`

Support:
- `engineering` only if one bounded docs or UI wording task appears

Exit:
- ずれがなければ完了
- ずれがあれば 1 件の bounded wording ticket に圧縮する
Current PM handling:
- `2026-04-04-wording-consistency-check.md` を起票して着手可能状態にする
Current result:
- wording consistency check は追加 ticket なしで完了

### 3. 操作感の細かな磨き込み候補の選定

Goal:
- 実装を増やす前に、ユーザーの迷いを減らす価値が高い候補を 1 件だけ選ぶ

Candidate Areas:
- 詳細パネルの閉じ方の理解
- ズーム操作エリアの理解
- abstract timeline の補助説明

Owner:
- `pm`

Exit:
- 1 件だけ次の候補を選ぶ
Current PM handling:
- `gakumasu-timeline-candidate-selection.md` で比較軸と仮順位を固定する
Next action:
- `ズーム操作エリアの理解` を対象に、1件の bounded task へ落とせるかを詰める
Current result:
- `2026-04-04-zoom-panel-wording-clarity.md` を起票し、見た目変更なし・文言限定の task に固定した
- `Zoom Panel Wording Clarity` は実装まで完了した

### 4. 安定性と検証手順の整理

Current next action:
- 実ブラウザ確認と運用上の確認手順をどう記録するかを PM 側で整理する
Current result:
- `Verification Baseline` を整理し、開発 docs に最小の検証フローを追加した
- `npm run verify` の成功で、自動確認の基準値は最新状態まで更新した

### 5. データ量増加時の見直し

Current next action:
- ここはまだ着手しない。実コンテンツ増加が起きるまで保留とする

## Non-Goals

- onboarding の全面改修
- portal / public URL の変更
- build / test 課題を UX 改修に混ぜること

## Success Signal

- 次の開発依頼が「確認だけで閉じる」か「1件の bounded task」かのどちらかに保たれている
