---
created: "2026-04-04"
project: "gakumasu-timeline"
status: review
tags: ["timeline", "pm", "intro-guide", "wording"]
---

# Gakumasu Timeline Intro Guide Recheck

## Purpose

`gakumasu-timeline` の直近 PM 作業として、現在のイントロガイド文言に追加調整が必要かを小さく再確認する。

## Goal

- 追加の intro-guide 修正が不要かどうかを判断する
- 必要な場合でも、追従作業を 1 件の bounded ticket に限定する
- interaction feel を崩さず、1 リポジトリ内で判断を閉じる

## Milestones

| # | Milestone | Due | Status |
|---|---|---|---|
| 1 | 現在の intro-guide 文言を再確認する | 2026-04-05 | completed |
| 2 | 追加調整の要否を判断する | 2026-04-05 | completed |
| 3 | 必要なら follow-up ticket を 1 件に絞る | 2026-04-05 | completed |

## Scope

- intro-guide 周辺の現在文言を対象にする
- abstract time の説明と初回理解のつながりを見る
- UI / README / manual の用語差分を次段の確認対象として整理する

## Non-Goals

- onboarding 全体の作り直し
- portal 側文言への展開
- build / test の環境課題への深入り

## Owners

- lead: `pm`
- support: `creative` only if one more wording pass is justified
- support: `engineering` only if the result becomes one bounded implementation task

## Success Signal

- 次にやることが「何もしない」または「1件の小さな追従チケット」のどちらかに明確化されている

## Current Result

- `日付ラベル` を主語にした小さな wording adjustment を 1 件だけ実施した
- 実装は 1 リポジトリ内で完結し、portal 側作業は不要のまま
- 次は creative を挟まず、実表示の再確認結果を見て追加作業不要として閉じられるかを判断する段階
