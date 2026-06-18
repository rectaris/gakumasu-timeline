# 配色システム

このドキュメントは、学マス公式色とタイムライン表示色の扱いを確認するための参照資料です。

## 基本方針

- 元の色データは `src/data/colorSources.js` に集約します。
- 表示で使う色は `src/utils/colorTokens.js` でロールへ変換します。
- `event.color` と各世界線データの `color` は互換用に残します。
- コンポーネントは可能な限り `colorRoles` を使い、直接 hex 値を持ちません。

## 出典レベル

- `official-css`: 公式サイトCSSから確認した色。キャラクター色では最優先です。
- `official-image-sampled`: 公式サイト掲載画像からサンプリングした色。光源や圧縮の影響があるため低信頼です。
- `local-legacy`: 既存データに入っていた色。公式出典が未確認の世界線色などで使います。
- `inferred`: UIの意味を表すために定義した色。共通イベントや選択状態などで使います。
- `temporary`: 未確定の一時色です。残す場合は理由を記録します。

## 優先順位

イベント表示色は次の順で決定します。

1. 共通イベントの場合は `common_events` の意味色を使い、レーン色は枠線やパネルアクセントにだけ使う。
2. レーンIDに対応する `colorSources` の公式色または世界線色を使う。
3. `colorSources` に無い場合は、各データにある `color` を使う。
4. `color` も無効な場合は、カテゴリ内のフォールバック色を使う。

選択状態と不確定状態は、元のイベント色を置換しません。選択はアウトライン、不確定は破線と両端マーカーで示します。

## 主要ロール

- `accent`: 公式または出典色そのもの。
- `accentSoft`: レーンラベル背景などに使う淡い派生色。
- `accentStrong`: 淡い色でも境界が見えるようにした強い派生色。
- `labelText` / `labelBg`: レーンラベル専用の文字色と背景色。
- `eventFill` / `eventStroke`: タイムライン上のイベントバーと境界線。
- `markerFill`: 開始点・終了点マーカー。
- `selectedStroke`: 選択中イベントのアウトライン。
- `uncertainMarker`: `singleWithinRange` の不確定マーカー。
- `panelAccent`: 詳細パネル上部とメタ情報の細いアクセント。

## 公式CSS由来のキャラクター色

出典: `https://gakuen.idolmaster-official.jp/assets/css/share.css?date=251119`

| ID | 公式色 | 旧データ色 |
| --- | --- | --- |
| `saki_hanami` | `#E30F25` | `#E30920` |
| `temari_tsukimura` | `#0C7BBB` | `#0D7CBC` |
| `kotone_fujita` | `#F8C112` | `#F8C216` |
| `mao_arimura` | `#7F1184` | `#801184` |
| `lilja_katsuragi` | `#EAFDFF` | `#EAFDFF` |
| `china_kuramoto` | `#F68B1F` | `#F68C21` |
| `sumika_shiun` | `#7CFC00` | `#7EFC04` |
| `hiro_shinosawa` | `#00AFCC` | `#02B0CD` |
| `rinami_himesaki` | `#F6ADC6` | `#F6AEC6` |
| `ume_hanami` | `#EA533A` | `#EA543B` |
| `sena_juo` | `#F6AE54` | `#F7B869` |
| `misuzu_hataya` | `#7A99CF` | `#7B9ACF` |
| `tsubame_amaya` | `#7B68EE` | `#7C69EE` |

## 公式画像サンプリング色

出典ページ: `https://gakuen.idolmaster-official.jp/system/`

これらは実装の主要UI色としては使わず、今後のゲームシステム色検討用の参照データとして保持します。

| ID | 色 | 備考 |
| --- | --- | --- |
| `produce.lesson-pink` | `#D654BD` | `thumb_produce_1_pc.png` の彩度が高いピンク領域 |
| `produce.training-blue` | `#5FABD4` | `thumb_produce_2_pc.png` の青系領域 |
| `produce.live-yellow` | `#FEDC3F` | `thumb_produce_4_pc.png` の黄色系領域 |
| `stage.light-warm` | `#FBE0B2` | `thumb_stage_1_pc.png` の暖色照明 |
| `stage.cool-blue` | `#6795FE` | `thumb_stage_3_pc.png` の寒色照明 |

## 検証観点

- レーンラベルの文字と背景が読めること。
- リーリヤ、清夏、ことねなど明るい色のイベント境界が見えること。
- ダークモードで共通イベントが白ベタにならず、レーンとの関連も分かること。
- 選択状態と `singleWithinRange` が色だけに依存しないこと。
- 公式色と既存データ色の差分が `colorSources.js` で追えること。
