// イベントとして登録するためのJSモジュールテンプレート
// コピー先が idol_commu/ などのサブディレクトリの場合は import を
// "../../utils/time" に変更する。
//
// yearsAgo: 現在から指定年数前の年を取得する関数
// yearOf: 学園の1年目を基準にした年を取得する関数
import { yearsAgo, yearOf } from "../utils/time";

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
      // 既知の場合のみ src/data/worldlines.js のIDを入れる。
      worldlineId: ["idol_story"],
      // src/data/characterCatalog.js のIDだけを入れる。未登録人物はnoteに自然文で残す。
      participants: ["saki_hanami"],
      // 新規データでは原則として出典を入れる。
      source: ["出典コミュ名 第1話"],
      // 任意。空配列や空文字ではなく、補足がある時だけ項目を残す。
      note: ["日付幅の根拠や未登録人物などの補足"],
    },
  ],
};
