---
created: "2026-04-05"
project: "gakumasu-timeline"
assignee: "engineering"
priority: normal
status: done
tags: ["ux", "mobile", "css"]
---

# Mobile Overlap Fix (SidePanel vs ZoomControls)

## Goal

モバイル表示時（画面幅が狭い場合）に、開いた詳細パネル（`.side-panel`）のコンテンツが、画面下部中央のズーム操作エリア（`.zoom-panel`）と重なり、詳細テキストが読めなくなる、あるいは誤タップを誘発する問題を防止する。

## Investigation
- `.side-panel` は `width: 320px` で右端に表示され、`z-index: 1000` を持つ。
- `.zoom-panel` は `left: 50%` かつ `bottom: 16px` に配置され、`z-index: 1100` を持つ。
- モバイルのような狭い画面幅（例: 375px）では、両者が大きく重なる。
- `.zoom-panel` の方が Z-index が高いため、詳細パネルの下部にあるテキストが物理的に隠されてしまう。
- また「詳細パネルを開いたままズーム操作を使える」というルール（`ui-behavior.md`）を満たすためには、単に Z-index の上下関係を入れ替えて隠すよりは、スクロール領域で逃がす方が適している。

## Resolution
- `src/style.css` の `.panel-content` に `padding-bottom: 120px;` を追加した。
- これにより、詳細テキストを最後までスクロールした場合でも、最下部に 120px の「オーバースクロール余白」が確保され、ズーム操作パネルと干渉せずに全て読めるようになる。
- 余白を設けただけなので、複雑なメディアクエリの追加や Z-index の変更による新たな副作用を回避できた。

## Verification
- `npm run verify` の実行により、ビルド成功と 6件のテスト通過を確認済み。
- CSSのみの変更であり、Javascriptのロジックや interaction feel を壊していない。
