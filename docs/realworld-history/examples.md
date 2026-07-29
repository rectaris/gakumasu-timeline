# 学マス情報史の例

- 状態：Proposed
- 仕様バージョン：0.2

## 目的

この文書は、日時、状態、グループ化、訂正、投影の境界を確認する合成例です。
名称、ID、日付、URLはすべて説明用であり、実際の学マス情報として公開しません。

## 例1：発表日と公開日が異なる楽曲

```json
{
  "id": "info_00000000-0000-4000-8000-000000000001",
  "category": "music",
  "title": "検証用楽曲A 配信開始",
  "announcedAt": {
    "value": "2099-04-01T18:00",
    "precision": "minute",
    "timezone": "Asia/Tokyo"
  },
  "startsAt": {
    "value": "2099-04-10",
    "precision": "date",
    "timezone": "Asia/Tokyo"
  },
  "status": "scheduled"
}
```

一つの公開という出来事を一つのInfoEventとし、告知だけを別ノードにしません。
画面上の位置は `startsAt`、詳細には `announcedAt` も表示します。

## 例2：月だけが判明している予定

```json
{
  "id": "info_00000000-0000-4000-8000-000000000002",
  "category": "game",
  "title": "検証用メジャーアップデート",
  "startsAt": {
    "value": "2099-05",
    "precision": "month",
    "timezone": "Asia/Tokyo"
  },
  "status": "scheduled"
}
```

`2099-05-01` や `00:00` は補いません。
表示は5月全体に対応する帯とします。

## 例3：同じ催事の複数公演

```json
[
  {
    "id": "info_00000000-0000-4000-8000-000000000003",
    "groupId": "group_example_live",
    "category": "live",
    "title": "検証用ライブ 昼公演",
    "startsAt": {
      "value": "2099-06-01T13:00",
      "precision": "minute",
      "timezone": "Asia/Tokyo"
    }
  },
  {
    "id": "info_00000000-0000-4000-8000-000000000004",
    "groupId": "group_example_live",
    "category": "live",
    "title": "検証用ライブ 夜公演",
    "startsAt": {
      "value": "2099-06-01T18:00",
      "precision": "minute",
      "timezone": "Asia/Tokyo"
    }
  }
]
```

発生時刻が異なるため別InfoEventとし、`groupId` で同じ催事だと示します。

## 例4：延期

```json
{
  "id": "info_00000000-0000-4000-8000-000000000005",
  "category": "stream",
  "title": "検証用公式配信",
  "startsAt": {
    "value": "2099-07-08T20:00",
    "precision": "minute",
    "timezone": "Asia/Tokyo"
  },
  "status": "postponed",
  "revisions": [
    {
      "id": "revision_example_1",
      "recordedAt": {
        "value": "2099-07-01T12:00",
        "precision": "minute",
        "timezone": "Asia/Tokyo"
      },
      "type": "schedule",
      "summary": "配信予定が変更された",
      "sourceIds": ["source_example_correction"],
      "previous": {
        "startsAt": {
          "value": "2099-07-02T20:00",
          "precision": "minute",
          "timezone": "Asia/Tokyo"
        }
      },
      "next": {
        "startsAt": {
          "value": "2099-07-08T20:00",
          "precision": "minute",
          "timezone": "Asia/Tokyo"
        }
      }
    }
  ]
}
```

現在値を変更しつつ、以前に公式発表された予定を履歴として残します。

## 例5：物語イベントとの関連

```json
{
  "id": "info_00000000-0000-4000-8000-000000000006",
  "category": "story",
  "title": "検証用イベントコミュ 公開",
  "startsAt": {
    "value": "2099-08-01",
    "precision": "date",
    "timezone": "Asia/Tokyo"
  },
  "storyReferences": [
    {
      "targetType": "story-event",
      "targetId": "story_00000000-0000-4000-8000-000000000001"
    }
  ]
}
```

InfoEventは現実世界での公開という出来事だけを表し、コミュ本文や物語上の前後関係を複製しません。
StoryBlockに公開メタデータを持たせる設計を採用した場合、この例は手動InfoEventではなく投影項目になります。

## 初期データセットで確認する境界

- 各採用カテゴリに少なくとも一つの代表例があること。
- 発表と開始が異なる例。
- 月精度または日付精度の例。
- 複数公演などグループ化が必要な例。
- 延期、中止、訂正のいずれかの例。
- 物語イベントと関連する公開情報の例。
- 削除または移動された公式URLがあれば、その扱いを確認できる例。

実在情報の選定と出典確認は、仕様承認後の初回データレビューで行います。
