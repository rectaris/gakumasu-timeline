// イベントとして登録するためのJSONテンプレート

// timeユーティリティのインポート例
// yearsAgo: 現在から指定年数前の年を取得する関数
// yearOf: 指定された年数後の年を取得する関数
import { yearsAgo, yearOf } from "../utils/time";

export default {
    id: "commu_id",                                       // そのイベントやコミュに関するID。それぞれのJSONファイルごとにIDが作成される。タイムラインの1レーン。
    name: "イベント名",                                    // そのイベントやコミュの名前
    color: "#000000",                                   // キャラクター、イベントのイメージカラー
    events: [
        {
            id: "event_id",                                // イベントのID。各イベントごとに一意である必要がある。
            start: { year: yearOf(1), month: 1, day: 1 },  // 開始年月日
            end: { year: yearOf(1), month: 1, day: 1 },    // 終了年月日
            title: "イベントタイトル",                      // イベントのタイトル
            detail: "イベント詳細説明",                     // イベントの詳細説明
            occurrenceType: "singleWithinRange",           // 発生タイプ（singleWithinRange, continuousなど）特定の期間のうちの1日か、期間全体でそのイベントが発生しているかどうかを入力する
            worldlineId: [""],                             // 関連するワールドラインIDの配列 src/data/index.jsのそれぞれの`export const`
            participants: [""],                            // 関連するキャラクターの配列 src/data/characterCatalog.jsで取り出すことのできるキャラクターの名前が入力となる
            source: [""],                                  // 情報源の配列 どのコミュの何話であるかを入力する
            note: ""                                       // 備考、情報の補足がある時に入力する
        }
    ]
};