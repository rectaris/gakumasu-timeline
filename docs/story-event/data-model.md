# 物語イベントのデータモデル

- 状態：Approved
- 仕様バージョン：1.0

## 対象

この文書は、物語イベントグラフを構成する保存データと表示時の派生データを定義します。

## エンティティ

### StorySeries

StoryBlockを分類するカテゴリ、シリーズ、章などの階層を表す契約を定義します。

シリーズや章は分類情報であり、グラフ上のノードにはしません。

StorySeriesには不変IDを発行し、StoryBlockから参照します。

StoryBlockの共通フィールドとカテゴリ固有の構造化情報を分け、カテゴリごとの入力規則を検証できる形にします。

StorySeriesは次の共通フィールドを持ちます。

- `id`：`series_`から始まる不変ID。
- `category`：`idol`、`event`、`support`、`hatsuboshi`のいずれか。
- `kind`：階層内での役割を示す制御値。
- `label`：表示タイトルへ使用する正式な階層ラベル。
- `parentSeriesId`：親StorySeriesのIDです。
- `externalIds`：ゲーム内IDなどの型付き外部識別子です。
- `aliases`：表示上の別名です。

最上位のStorySeriesだけは`parentSeriesId`を持ちません。

StoryBlockは最も具体的なStorySeriesのIDだけを保持し、上位階層は`parentSeriesId`をたどって取得します。

初期対象の階層は次のとおりです。

- アイドルコミュ
  - `idol`：アイドルを表します。
  - `idol-commu-type`：親愛度、プロデュース、Pアイドルを表します。
  - `affinity-step`：STEP1、STEP2、STEP3、STEP4を表します。
  - `produce-activity`：育成、授業、おでかけ、営業を表します。
  - `produce-route`：定期公演『初』、NEXT IDOL AUDITION、Hatsuboshi IDOL FESTIVALを表します。
  - `p-idol`：「[楽曲]アイドル名」で表されるPアイドルを表します。
- イベントコミュ
  - `event`：イベントを表します。
- サポートコミュ
  - `support-card`：サポートカードを表します。
- 初星コミュ
  - `hatsuboshi-commu`：コミュを表します。
  - `chapter`：章を表します。

許可する初期階層は次のとおりです。

- 親愛度：`idol` → `idol-commu-type` → `affinity-step`。
- プロデュースの育成：`idol` → `idol-commu-type` → `produce-activity` → `produce-route`。
- プロデュースの授業、おでかけ、営業：`idol` → `idol-commu-type` → `produce-activity`。
- Pアイドル：`idol` → `idol-commu-type` → `p-idol`。
- イベントコミュ：`event`。
- サポートコミュ：`support-card`。
- 初星コミュ：`hatsuboshi-commu` → `chapter`。

### StoryBlock

ゲーム内で1つのコミュとして存在する「話」を表します。

各StoryBlockは、次の共通フィールドを持ちます。

- `id`：`block_`から始まる不変ID。
- `seriesId`：最も具体的なStorySeriesのID。
- `label`：表示タイトルの末尾に使用する正式な話ラベル。
- `episodeOrder`：参照先StorySeries内でのゲーム上の表示順。
- `episodeNumber`：ゲーム内で明示されている場合の話数。
- `characters`：役割付き人物参照。
- `externalIds`：ゲーム内IDなどの型付き外部識別子。
- `aliases`：表示上の別名。
- `sourceNotes`：データ登録上の注記。

StoryBlockに独立した`title`は保存しません。

`episodeOrder`はゲーム内での表示順であり、物語上の前後関係を意味しません。

`episodeNumber`、`externalIds`、`aliases`、`sourceNotes`は、該当情報がない場合に省略できます。

人物参照には、`owner`、`focus`、`participant`の役割を付けられます。

1人の人物へ複数の役割を付けられます。

アイドルコミュでは`owner`を1人要求し、他のカテゴリでは要求しません。

同じ人物を`characters`へ複数回登録せず、1つの人物参照へ役割をまとめます。

同じ話を人物別に複製しません。

内容が同一でも、ゲーム内で別のコミュとして管理されている場合は別のStoryBlockとします。

同じゲーム内コミュを別の場所から閲覧できるだけの場合は、別名または外部識別子として同じStoryBlockへ対応付けます。

PアイドルはStorySeriesとして扱い、その配下にあるゲーム内の各コミュをStoryBlockとします。

### 表示タイトル

表示タイトルは、StoryBlockから`parentSeriesId`をルート方向へたどり、表示対象のStorySeriesラベルをルートから順に並べ、最後にStoryBlockの`label`を追加して生成します。

`idol`、`event`、`support`、`hatsuboshi`という技術的なカテゴリ名は表示タイトルへ含めません。

各ラベルは1つの空白で連結します。

生成例は次のとおりです。

- `花海咲季 親愛度 STEP1 第5話`
- `イベント名 第4話`
- `おでん、とおりま〜すッ！ 向き合うべきはおでん？`
- `Story of Re;IRIS 1章 第1話`

### 外部識別子と別名

外部識別子は次のフィールドを持ちます。

- `system`：識別子を発行したシステム。
- `type`：コミュ、カード、イベントなどの識別子種別。
- `value`：外部システム上の値。

同じ`system`、`type`、`value`の組み合わせを重複して登録しません。

`aliases`には旧名称や表記揺れを文字列として保存し、外部識別子を混在させません。

### StoryEdge

1つの論理エッジとして、次の情報を保持します。

- `id`：`edge_`から始まる不変ID。
- `sourceBlockId`、`targetBlockId`：接続するStoryBlock ID。
- `kind`：`sequence`または`semantic`。
- `direction`：`undirected`、`forward`、`bidirectional`。
- `relationType`：制御された関係種別。
- `label`：任意の表示ラベル。`other`では必須です。
- `origin`：`authored`または`generated`。
- `rationale`：関係を登録した理由。
- `evidence`：根拠となる自由記述または出典識別子の配列。
- `confidence`：`confirmed`、`inferred`、`speculative`。

`sequence`は`forward`かつ`before`だけを許可します。
手動登録した`sequence`と全`semantic`には、`rationale`または`evidence`と`confidence`を要求します。
シリーズで話番号順の生成を明示した場合だけ、`generated`の`sequence`を作成できます。

### StoryReference

「物語時系列」または「学マス情報史」の要素からStoryBlockを参照する型付き契約を定義します。

参照元のデータが次の情報を保持します。

- `id`：`ref_`から始まる不変ID。
- `storyBlockId`：参照するStoryBlock ID。
- `type`：`evidence`、`source`、`subject`、`related`。
- `label`：任意の補助表示。
- `note`：任意の登録注記。
- `order`：同じ参照元に複数ある場合の任意の表示順。

StoryBlockから参照元を列挙する逆引き情報は、保存データへ重複させずに生成します。
1つの参照元から複数のStoryBlockを参照できます。
削除済みまたは未登録のStoryBlockへの参照は検証エラーとし、参照を伴うStoryBlockの削除は暗黙に連鎖させません。

## ID

系列、ノード、エッジ、StoryReferenceには、次の接頭辞と小文字UUIDを組み合わせた不変IDを発行します。

- StorySeries：`series_<uuid>`。
- StoryBlock：`block_<uuid>`。
- StoryEdge：`edge_<uuid>`。
- StoryReference：`ref_<uuid>`。

UUIDはハイフンを含む標準形式で保存します。

IDは専用スクリプトまたは編集画面で発行し、表示ラベルや階層から生成しません。

ゲーム内ID、旧名称、現在の表示名は、不変IDとは別の外部識別子または別名として保持できます。

日本語の表示名やカテゴリ階層だけから正規IDを生成しません。

## 物語上の順序

StoryBlockには物語内時刻や現実世界の日時を保持しません。

物語上の時系列は、`sequence`エッジによる単純な前後関係だけで表します。

ノード間距離、エッジの長さ、画面座標には時間的な意味を持たせません。

## 保存データと派生データ

編集用原データはJSONとし、最上位または独立して編集するStorySeriesごとに1ファイルへ保存します。

ファイルパスとファイル名はエンティティの同一性に使用しません。

表示用一覧、検索索引、階層展開結果、ビュー間参照の逆引きは原データから生成します。

話番号などから生成できる`sequence`エッジと、手動登録する`semantic`エッジを区別します。

## 検証

IDの書式と一意性、参照整合性、StorySeriesの循環、許可されたカテゴリ階層、StoryBlockラベル、シリーズ内表示順、人物の役割、外部識別子、方向、関係種別、自己エッジ、並列エッジ、前後関係の循環を検証します。

`episodeOrder`を確認できない場合は省略し、推測値を保存しません。
