---
created: "2026-04-04"
project: "gakumasu-timeline"
status: planning
tags: ["timeline", "pm", "candidate-selection", "ux"]
---

# Gakumasu Timeline Candidate Selection

## Purpose

用語統一確認の次に、操作感の細かな磨き込み候補を 1 件だけ選ぶための PM 比較メモを作る。

## Candidate Comparison

### A. 詳細パネルの閉じ方の理解

Value:
- イベントを開いた後の迷いを減らしやすい

Risk:
- すでに説明は複数箇所にあり、追加変更が重複説明になりやすい

PM View:
- 再確認対象としては良いが、現時点では最優先候補ではない

### B. ズーム操作エリアの理解

Value:
- 初回理解に直結する
- interaction feel を壊さず、説明改善だけで価値を出しやすい

Risk:
- wording と UI の両方に手を出すと scope が広がりやすい

PM View:
- 現時点の第一候補

### C. abstract timeline の補助説明

Value:
- 誤読防止には効く

Risk:
- 直近で関連調整を入れたばかりなので、短期間で同じ論点を再度触ることになりやすい

PM View:
- 今回の実表示再確認結果が悪い場合のみ再浮上させる

## Provisional Choice

- 第一候補は `ズーム操作エリアの理解`
- ただし先に wording consistency check を閉じ、同じ論点の重複改修を避ける

## Current Status

- wording consistency check は完了
- よって次の PM 作業は、`ズーム操作エリアの理解` を 1 件の bounded task に圧縮できるかの整理に進む
- bounded task としては `Zoom Panel Wording Clarity` を採用し、見た目ではなく文言改善に限定する
- `Zoom Panel Wording Clarity` は実装完了
- 次に候補比較を続ける場合は、安定性整理のあとに再度 1 件だけ選ぶ

## Decision Rule

- 次の開発依頼は 1 件だけにする
- wording で閉じられるなら wording で閉じる
- interaction feel に手を入れる場合でも、見た目か説明のどちらか一方に限定する
