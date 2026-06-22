// イベントとして登録するためのJSモジュールテンプレート
// data/raw/worldline_commu/ 配下へコピーして使う。
//
// yearsAgo: 現在から指定年数前の年を取得する関数
// yearOf: 学園の1年目を基準にした年を取得する関数
const yearsAgo = (years) => 1 - years;
const yearOf = (year) => year;

export default {
  id: "replace_me_lane_id", // レーンID。例: saki_hanami, story_of_reiris
  name: "レーン名", // 画面に表示されるキャラクター名やコミュ名
  color: "#000000", // キャラクター、イベントのイメージカラー
  events: [
    {
      id: "replace_me_event_id", // 全イベントで一意の安定ID。URL復元に使われる。
      start: { year: yearOf(1), month: 4, day: 1 }, // 開始年月日
      end: { year: yearOf(1), month: 4, day: 10 }, // 終了年月日
      title: "イベントタイトル", // イベントのタイトル
      detail: "イベント詳細説明", // イベントの詳細説明
      // continuous: startからendまで継続する期間
      // singleWithinRange: startからendまでの範囲内のどこか1日
      occurrenceType: "singleWithinRange",
      // 任意。未指定のsingleWithinRangeはrangeOnlyとして表示される。
      // dateConfidence: confirmed / inferred / rangeOnly
      dateConfidence: "rangeOnly",
      // 任意。sourceBasis: explicit / inferred / mixed / unknown
      sourceBasis: "explicit",
      // 任意。sourceStatus: confirmed / inferred / conflicting / unreviewed / unsourced / unknown
      sourceStatus: "confirmed",
      // 任意。singleWithinRangeの候補範囲理由。
      // monthOnly / sourceRange / chapterOrder / relativeOrder / unknown
      rangeReason: "sourceRange",
      // 既知の場合のみ src/data/worldlines.js のIDを入れる。
      worldlineId: ["idol_story"],
      // src/data/characterCatalog.js のIDだけを入れる。未登録人物はnoteに自然文で残す。
      participants: ["saki_hanami"],
      // 新規データでは原則として出典を入れる。
      source: ["出典コミュ名 第1話"],
      // 任意。出典ごとの主張や状態が必要な場合だけ使う。
      sourceDetails: [
        {
          id: "source_id_optional",
          label: "出典コミュ名 第1話",
          status: "confirmed",
          claim: "候補期間の根拠",
          supports: ["event", "date"],
        },
      ],
      // 任意。出典同士の時期主張が矛盾する場合だけ使う。
      conflicts: [
        {
          summary: "出典ごとに候補時期が異なる",
          sources: ["出典コミュ名 第1話", "別出典"],
          resolution: "未解決",
        },
      ],
      // 任意。空配列や空文字ではなく、補足がある時だけ項目を残す。
      note: ["日付幅の根拠や未登録人物などの補足"],
    },
  ],
};
