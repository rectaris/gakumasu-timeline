import { yearsAgo, yearOf } from "../utils/time";

export default {
  id: "common_events",
  name: "共通イベント",
  color: "#000000",
  events: [
    {
      id: "hatsuboshi_founding_a_school",
      start: { year: yearsAgo(40), month: 5, day: 16 },
      end: { year: yearsAgo(30), month: 5, day: 16 },
      title: "初星学園建学",
      detail: "初星学園が建学される",
      occurrenceType: "singleWithinRange",
      participants: [""], //juo_kunio
      source: ["https://gakuen.idolmaster-official.jp/media/fankit/schoolguidebook-view/ 2ページ"],
    },
    {
        id: "hatsuboshi_founding_idol_course",
        start: { year: yearsAgo(22), month: 4, day: 1 },
        end: { year: yearsAgo(18), month: 4, day: 1 },
        title: "アイドルコース設立",
        detail: "初星学園にアイドルコースが設立される",
        occurrenceType: "singleWithinRange",
        participants: [""], //juo_kunio
        source: ["https://gakuen.idolmaster-official.jp/media/fankit/schoolguidebook-view/ 2ページ"],
    }
  ]
};
