# 物語イベントのグラフ意味論

- 状態：Approved
- 仕様バージョン：1.0

## グラフ形式

無方向、片方向、双方向、並列エッジ、循環を扱う混合マルチグラフとして定義します。

グラフ全体では循環を許容しますが、前後関係を表す`sequence`エッジだけの部分グラフでは循環を禁止します。

## ノード

StoryBlockを1つの正規ノードとして扱い、参加キャラクターごとに複製しない規則を定義します。

物語上の位置が不明なStoryBlockも登録し、前後関係が判明するまでは孤立ノードとして扱います。

## エッジ方向

1つの論理エッジに`undirected`、`forward`、`bidirectional`のいずれかを設定します。

双方向関係を2本の片方向エッジへ分割しません。

## 関係種別

relationTypeは制御された値として保存し、必要に応じて任意の表示ラベルを併用します。

初期relationTypeと方向は次のとおりです。

| kind | relationType | 許可する方向 | 意味 |
| --- | --- | --- | --- |
| sequence | `before` | `forward` | 接続元が接続先より物語上で前 |
| semantic | `continuation` | `forward` | 内容上の続き |
| semantic | `reference` | `forward`, `bidirectional` | 一方または相互の参照 |
| semantic | `same_event` | `undirected` | 同じ出来事を扱う |
| semantic | `alternative` | `undirected` | 代替的な展開 |
| semantic | `complement` | `undirected` | 相互に内容を補う |
| semantic | `contrast` | `undirected` | 対比関係 |
| semantic | `other` | すべて | 初期一覧にない関係 |

`other`では表示ラベルを必須とします。
既存relationTypeの意味または許可方向を変える場合はデータ移行と仕様レビューを要求します。
既存の意味を変えないrelationTypeの追加はMVP評価で扱えます。

## 前後関係と意味的関係

`sequence`エッジは物語上の前後関係を表し、上から下への配置順を決めます。

`semantic`エッジは参照、補完、対比などの意味的関係を表し、物語上の配置順を変更しません。

`sequence`エッジは全ノードを一直線に並べる必要がなく、分岐や互いに順序を比較できない部分を許容します。

## 物語上の流れ

物語内時刻や現実世界の日時は使用しません。

ノードの前後関係によって物語上の時系列を表し、イベントの流れは上から下へ配置します。

ノード間距離とエッジの長さには、時間的な意味を持たせません。

## 根拠と確度

解釈を伴う`semantic`エッジには、根拠または説明と確度を付与します。

話番号などから機械的に生成する`sequence`エッジには、個別の解釈根拠を要求しません。

確度は`confirmed`、`inferred`、`speculative`のいずれかです。

## 重複と削除

- 自己エッジは禁止します。
- kind、direction、relationType、および方向を正規化した端点が同一のエッジは重複として拒否します。
- relationTypeが異なる並列エッジは許可します。
- 同じ関係を支える複数の根拠は1エッジの`evidence`へまとめます。
- 接続中のStoryBlock削除は拒否し、暗黙の連鎖削除をしません。
