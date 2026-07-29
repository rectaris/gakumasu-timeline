# 学マス情報史のデータモデル

- 状態：Approved
- 仕様バージョン：0.2

## 対象

この文書は、現実世界の学マス関連情報を取得する境界、InfoEvent、表示用派生データを定義します。

## 取得境界

取得データは次の二つの契約を使います。

### SourceOrigin

`source-registry.json`の各項目は、取得を許可した公式発信元を表します。

- `id`：`origin_<英小文字・数字・_>`形式の不変IDです。
- `platform`：Webサイト、YouTubeチャンネル、YouTubeプレイリスト、Xアカウントの種別です。
- `url`：人が確認する代表URLです。
- `externalId`：APIまたは取得処理で使う発信元IDです。
- `acquisition`：Web取得、YouTube Data API、X APIの取得方式です。
- `scopeMode`：全件を候補にするか、学マス明示項目だけを候補にするかを示します。
- `keywords`：学マス明示判定に使う語です。
- `discoveryUrls`：Webサイトで取得対象にする任意のページ一覧です。
- `collectionState`：任意の取得状態です。省略時は`active`とし、`paused`では取得処理を呼び出しません。
- `pauseReason`：`paused`で必須となる保留理由です。

### IntakeRecord

`intake/<sourceRegistryId>.json`は、一回の取得結果と正規化済み候補を保存します。
データセットは`collected`、`partial`、`skipped`の状態を持ちます。

- `collected`：取得対象の末尾まで確認した結果です。
- `partial`：ページ上限に達し、次ページが残っている結果です。
- `skipped`：認証情報不足または発信元の保留によって取得を実行しなかった結果です。

ページングを使う結果は`pagination`を持ちます。
`pagesFetched`、`pageLimit`、`nextPageAvailable`により取得範囲を示し、`fetchedItemCount`と`retainedItemCount`で今回取得した候補と以前の結果から保持した候補を区別します。

`partial`の結果は、安定した`resourceKey`を使って既存の有効なデータセットとマージします。
今回取得しなかった既存候補を削除せず、今回取得した同一候補の内容を優先します。
`collected`の結果だけが既存候補全体を置き換えます。

発信元固有の通信失敗はデータセット状態として保存せず、実行結果とローカルの実行記録へ残します。
この場合、最後の有効なデータセットを変更しません。

各候補は次の情報を持ちます。

- `id`：正規化した識別情報から作る`intake_<SHA-256>`形式のIDです。
- `resourceType`：Webページ、YouTube動画、X投稿の種別です。
- `externalId`：取得元プラットフォーム内の識別子です。
- `resourceKey`：`web:`、`youtube:`、`x:`を接頭辞にした重複確認用の識別子です。
- `canonicalUrl`：公式リソースへ到達するHTTPS URLです。
- `title`、`summary`：候補判定とレビューに使う軽量な表示情報です。
- `publishedAt`：取得元が提供する任意の公開日時です。
- `retrievedAt`：取得を実行した日時です。
- `contentHash`：取得内容の変化を比較するSHA-256です。
- `match`：学マス候補に含めるかと、その判定理由です。

IntakeRecordはInfoEventではありません。
複数のIntakeRecordを1件のInfoEventの出典へまとめることがあり、候補の公開日時をInfoEventの発生日時として自動採用しません。

## InfoEventの単位

現実世界で発生する1つの公開、更新、公演、配信を1件のInfoEventとします。

発表日時と実施日時は、同じInfoEventの別フィールドへ保存します。

同じライブ企画でも開催日時または会場が異なる公演は別のInfoEventとし、任意の`groupId`でまとめます。

単なる告知投稿を、告知対象とは別のInfoEventとして重複登録しません。

## InfoEvent

InfoEventは次のフィールドを持ちます。

- `id`：`info_<小文字UUID>`形式の不変IDです。
- `category`：制御された情報カテゴリです。
- `title`：公式表記を基にした表示名です。
- `summary`：任意の短い説明です。
- `groupId`：複数公演などをまとめる任意の不変IDです。
- `announcedAt`：任意の発表日時です。
- `startsAt`：公開、開始、開催の日時です。
- `endsAt`：期間を持つ場合の終了日時です。
- `status`：予定、進行中、完了、延期、中止の状態です。
- `publicationStatus`：`draft`、`unreviewed`、`approved`、`published`の状態です。
- `sources`：主張を支える出典です。
- `revisions`：予定や内容の変更履歴です。
- `storyReferences`：関連するStoryBlockへの型付き参照です。
- `characterIds`：任意の関連キャラクターIDです。
- `tags`：検索に使用する任意の制御語です。

`startsAt`は初期カテゴリのInfoEventで必須とします。

発表だけが歴史項目となる情報を将来扱う場合は、別カテゴリと開始条件を仕様レビューします。

## 情報カテゴリ

MVPでは次のカテゴリを提案します。

- `game`：サービス開始と利用者へ影響する主要更新です。
- `story`：公式ストーリーの公開です。
- `music`：楽曲または音源の公式公開です。
- `live`：公式ライブとステージ公演です。
- `stream`：日時を定めて行う公式配信です。

カテゴリの追加は、収録範囲とレーン構成を変更するため仕様レビューを必要とします。

## 日時値

`announcedAt`、`startsAt`、`endsAt`は、次のフィールドを持つ日時値です。

- `value`：精度に対応したISO互換文字列です。
- `precision`：`month`、`date`、`minute`のいずれかです。
- `timezone`：`minute`で必須となるIANAタイムゾーンです。

日時値の詳細は[暦意味論](calendar-semantics.md)で定義します。

## 状態

`status`は次の値を使用します。

- `scheduled`：公式に予定されています。
- `active`：期間中または配信中です。
- `completed`：終了または公開済みです。
- `postponed`：延期され、変更先が未確定または別日時へ変更されています。
- `cancelled`：中止されています。

現在時刻だけで状態を暗黙に書き換えません。

状態変更はレビュー済み更新として保存します。

## 変更履歴

`revisions`は次の情報を持ちます。

- `id`：`revision_<小文字UUID>`形式の不変IDです。
- `recordedAt`：変更が公式発表された日時値です。
- `type`：`schedule`、`status`、`title`、`detail`、`source`のいずれかです。
- `summary`：何が変わったかを説明します。
- `sourceIds`：変更を支える出典IDです。
- `previous`：変更前の対象値です。
- `next`：変更後の対象値です。

延期、中止、日時変更では元の予定を削除せず、現在値と変更履歴を更新します。

## 出典

各出典は次の情報を持ちます。

- `id`：InfoEvent内で一意な出典IDです。
- `type`：制御された公式出典種別です。
- `label`：利用者へ表示する名称です。
- `url`：確認したURLです。
- `checkedAt`：最後に内容を確認した日です。
- `availability`：`available`、`moved`、`deleted`のいずれかです。
- `supports`：`identity`、`announcement`、`schedule`、`status`、`detail`のうち、出典が支える主張です。
- `archiveUrl`：削除または移動後に使用する任意の参照先です。

公開条件は[出典方針](source-policy.md)で定義します。

## StoryBlockとの関係

物語イベントの公開日をInfoEventから手動で重複管理しません。

StoryBlock側に承認済みの公開メタデータが存在する場合は、生成処理が学マス情報史へ投影します。

手動InfoEventからStoryBlockを参照するときは、参照元側の`storyReferences`へ保存します。

投影項目と手動項目が同じ公開を表す場合は検証エラーとします。

## ID

InfoEvent IDは表示名、日付、URLから生成しません。

名称、日時、状態、出典URLが変更されても、同じ現実世界の出来事であればIDを維持します。

複数公演を統合または分割する場合は、公開URLへの影響を確認して移行計画を作成します。

## 保存データと派生データ

手動登録するInfoEventをJSONの正本とします。

StoryBlockからの投影、検索索引、カテゴリ別一覧、描画座標は生成物とします。

未レビュー候補を本番成果物へ含めません。
SourceOriginとIntakeRecordもアプリの本番入力へ含めません。

## 検証

次の条件を機械検証します。

- IDと参照IDが規定形式で一意であること。
- カテゴリ、状態、公開状態が許可値であること。
- 日時文字列と精度が一致すること。
- `minute`の日時にタイムゾーンが存在すること。
- 開始と終了の順序が有効であること。
- 出典が支える主張と必須日時が存在すること。
- 公開項目が公式出典を持つこと。
- 変更履歴が参照する出典が存在すること。
- StoryBlock参照が公開済みStoryBlockを指すこと。
- 投影項目と手動項目が重複しないこと。
- SourceOrigin IDとIntakeRecord IDが規定形式で一意であること。
- IntakeRecordが登録済みSourceOriginを参照し、取得状態、URL、日時、`resourceKey`を満たすこと。
- `partial`が次ページの存在と取得件数、保持件数を明示すること。
