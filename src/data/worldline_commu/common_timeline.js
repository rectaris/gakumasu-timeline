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
      note: "おそらく普通科のみ、中等部と高等部が存在する。設立年月日は1990年5月16日だが、学マス世界では何年が学マス世界線の開始年かわからないため、生徒がスマホを持っている、未来すぎる時空を描きすぎることはないだろうという想定で、30～40年前としている。"
    },
    {
      id: "hatsuboshi_auditorium_stage_construction_start",
      start: { year: yearsAgo(24), month: 1, day: 1 },
      end: { year: yearsAgo(20), month: 1, day: 1 },
      title: "講堂メインステージ着工",
      detail: "講堂メインステージ着工",
      occurrenceType: "singleWithinRange",
      participants: [""], //juo_kunio
      source: ["https://gakuen.idolmaster-official.jp/media/fankit/schoolguidebook-view/ 7ページ"],
      note: "約150億円の建設費を投じられたメインステージ"
    },
    {
      id: "hatsuboshi_founding_idol_course",
      start: { year: yearsAgo(22), month: 4, day: 1 },
      end: { year: yearsAgo(18), month: 4, day: 1 },
      title: "高等部アイドル科設立",
      detail: "初星学園に高等部アイドル科が設立される",
      occurrenceType: "singleWithinRange",
      participants: [""], //juo_kunio
      source: ["https://gakuen.idolmaster-official.jp/media/fankit/schoolguidebook-view/ 2ページ"],
      note: "高等部アイドル科が設立されるが、同じ時期に中等部アイドルコースも設立される？おなじくプロデュース科も設立？"
    },
    {
      id: "hatsuboshi_auditorium_stage_construction_end",
      start: { year: yearsAgo(22), month: 1, day: 1 },
      end: { year: yearsAgo(18), month: 1, day: 1 },
      title: "講堂メインステージ竣工",
      detail: "講堂メインステージ竣工",
      occurrenceType: "singleWithinRange",
      participants: [""], //juo_kunio
      source: ["https://gakuen.idolmaster-official.jp/media/fankit/schoolguidebook-view/ 7ページ"],
    },
    {
      id: "kaya_kei_prima-stella",
      start: { year: yearsAgo(6), month: 6, day: 1 },
      end: { year: yearsAgo(4), month: 3, day: 31 },
      title: "賀陽継が一番星になる",
      detail: "賀陽継が一番星になる",
      occurrenceType: "singleWithinRange",
      participants: [""], //kaya_kei
      source: ["月村手毬 雪解けに 1話", "月村手毬 雪解けに 2話", "秦谷美鈴 親愛度 第10話"],
      note: "手毬が小学生のころ、継が一番星となる。おそらく手毬、美鈴か小学生後半の時期。夏季か冬季のどちらかは決まっていない。"
    }
  ]
};
