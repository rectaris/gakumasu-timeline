import { yearsAgo, yearOf } from "../utils/time";

export default {
  id: "common_events",
  name: "共通イベント",
  color: "#FFFFFF",
  events: [
    {
      id: "hatsuboshi_founding_a_school",
      start: { year: yearsAgo(40), month: 5, day: 16 },
      end: { year: yearsAgo(30), month: 5, day: 16 },
      title: "初星学園建学",
      detail: "初星学園が建学される",
      occurrenceType: "singleWithinRange",
      participants: [""], //juo_kunio
      source: [
        "https://gakuen.idolmaster-official.jp/media/fankit/schoolguidebook-view/ 2ページ",
      ],
      note: "おそらく普通科のみ、中等部と高等部が存在する。設立年月日は1990年5月16日だが、学マス世界では何年が学マス世界線の開始年かわからないため、生徒がスマホを持っている、未来すぎる時空を描きすぎることはないだろうという想定で、30～40年前としている。",
    },
    {
      id: "hatsuboshi_auditorium_stage_construction_start",
      start: { year: yearsAgo(24), month: 1, day: 1 },
      end: { year: yearsAgo(20), month: 1, day: 1 },
      title: "講堂メインステージ着工",
      detail: "講堂メインステージ着工",
      occurrenceType: "singleWithinRange",
      participants: [""], //juo_kunio
      source: [
        "https://gakuen.idolmaster-official.jp/media/fankit/schoolguidebook-view/ 7ページ",
      ],
      note: "約150億円の建設費を投じられたメインステージ",
    },
    {
      id: "hatsuboshi_founding_idol_course",
      start: { year: yearsAgo(22), month: 4, day: 1 },
      end: { year: yearsAgo(18), month: 4, day: 1 },
      title: "高等部アイドル科設立",
      detail: "初星学園に高等部アイドル科が設立される",
      occurrenceType: "singleWithinRange",
      participants: [""], //juo_kunio
      source: [
        "https://gakuen.idolmaster-official.jp/media/fankit/schoolguidebook-view/ 2ページ",
      ],
      note: "高等部アイドル科が設立されるが、同じ時期に中等部アイドルコースも設立される？おなじくプロデュース科も設立？",
    },
    {
      id: "hatsuboshi_auditorium_stage_construction_end",
      start: { year: yearsAgo(22), month: 1, day: 1 },
      end: { year: yearsAgo(18), month: 1, day: 1 },
      title: "講堂メインステージ竣工",
      detail: "講堂メインステージ竣工",
      occurrenceType: "singleWithinRange",
      participants: [""], //juo_kunio
      source: [
        "https://gakuen.idolmaster-official.jp/media/fankit/schoolguidebook-view/ 7ページ",
      ],
    },
    {
      id: "kaya_kei_prima-stella",
      start: { year: yearsAgo(9), month: 6, day: 1 }, //期間に関しては、継が一番星になるときの年齢や、SyngUp!アイドルの年齢が不明のため、期間を広くとっている（小学生低学年からライブに参加することは考えにくいため、4~6年前くらいが妥当かもしれない）
      end: { year: yearsAgo(4), month: 3, day: 31 },
      title: "賀陽継が一番星になる",
      detail: "賀陽継が一番星になる",
      occurrenceType: "singleWithinRange",
      participants: [""], //kaya_kei
      source: [
        "月村手毬 雪解けに 第1話",
        "月村手毬 雪解けに 第2話",
        "月村手毬 親愛度 第10話",
        "秦谷美鈴 親愛度 第10話",
        "雨夜燕 親愛度 第8話",
        "有村麻央 親愛度 第25話",
      ],
      note: "手毬が小学生のころ、継が一番星となる。おそらく手毬、美鈴か小学生後半の時期。夏季か冬季のどちらかは決まっていない。「十王星南は、初星学園で別格」「星南は初星学園史上最高の『一番星』」という言葉から、賀陽継は2年生から一番星である十王星南には劣っている可能性が高いため、継は3年時の夏冬のどちらかで一番星となっている可能性がある。（もしかしたら2年生冬の可能性もある）",
    },
    {
      id: "rinha_temari_misuzu_meet",
      start: { year: yearsAgo(9), month: 6, day: 1 }, //期間に関しては、継が一番星になるときの年齢や、SyngUp!アイドルの年齢が不明のため、期間を広くとっている（小学生低学年からライブに参加することは考えにくいため、4~6年前くらいが妥当かもしれない）
      end: { year: yearsAgo(4), month: 3, day: 31 },
      title: "賀陽継が一番星になる日に、燐羽と手毬と美鈴が出会う",
      detail: "賀陽継が一番星になる日に、燐羽と手毬と美鈴が出会う",
      occurrenceType: "singleWithinRange",
      participants: ["tsukimura_temari", "hataiya_misuzu"], //kaya_rinha
      source: [
        "月村手毬 雪解けに 第1話",
        "月村手毬 雪解けに 第2話",
        "月村手毬 親愛度 第16話", //手毬の「はじめて会ったあの日の燐羽の方が、ずっと凄いアイドルだった！！」という言葉から、NIA CUARTETオーディション合格時の手毬と近い実力を初めて会ったときの燐羽が持っていることになる。
        "秦谷美鈴 親愛度 第10話",
      ],
    },
    {
      id: "syngup_formation",
      start: { year: yearsAgo(3), month: 4, day: 1 },
      end: { year: yearsAgo(3), month: 12, day: 31 },
      title: "SyngUp!結成",
      detail:
        "SyngUp!が結成される。メンバーは月村手毬、秦谷美鈴、賀陽燐羽の3人",
      occurrenceType: "singleWithinRange",
      participants: ["tsukimura_temari", "hataiya_misuzu"], //kaya_rinha
      source: ["月村手毬 親愛度 第17話"],
    },
    {
      id: "rinha_go_astray",
      start: { year: yearsAgo(3), month: 10, day: 1 }, //
      end: { year: yearsAgo(2), month: 3, day: 31 },
      title: "燐羽がグレる",
      detail: "燐羽がグレる。継が関係している可能性が高い。",
      occurrenceType: "singleWithinRange",
      participants: ["tsukimura_temari", "hataiya_misuzu"], //kaya_rinha
      source: [
        "秦谷美鈴 親愛度 第14話",
        "秦谷美鈴 親愛度 第15話",
        "秦谷美鈴 親愛度 第16話",
        "秦谷美鈴 親愛度 第20話",
      ],
      note: "燐羽が最後に本気で歌ったのは中等部1年生の終わりごろ。そこから本気で歌うことが無くなった（歌えなくなった）ため、グレたのはそこから少し後の可能性が高い。",
    },
    {
      id: "summer-hif_sena_first_prima-stella",
      start: { year: yearsAgo(1), month: 6, day: 1 },
      end: { year: yearsAgo(1), month: 9, day: 31 },
      title: "十王星南が夏のHIFで一番星になる",
      detail:
        "十王星南が夏のHIFで一番星になる、参加は3回目（選抜試験？）、本戦出場は2回目",
      occurrenceType: "singleWithinRange",
      participants: ["juo_sena", "amaya_tsubame"],
      source: [
        "十王星南 親愛度 第2話",
        "十王星南 親愛度 第25話",
        "イベントコミュ 3年1組の修学旅行 第4話",
        "イベントコミュ ライブツアーイベント 渋谷編 第4話",
        "イベントコミュ ライブツアーイベント 渋谷編 第5話",
        "https://x.com/gkmas_official/status/1989531491727282186?s=20 (5-10ページまで)",
        "藤田ことね プロデュースコミュ NEXT IDLE AUDITION Normal End",
      ],
      note: "星南、燕ともにHIFの参加は3回目、本戦の出場は2回目。燕は本戦で「ENDLESS DANCE」、星南は本戦で「Choo Choo Choo」優勝ライブで「ENDLESS DANCE」を披露している。この夏のHIF以降、十王星南以外に「ENDLESS DANCE」は1年以上歌われなくなった。",
    },
    {
      id: "syngup_dissolution",
      start: { year: yearsAgo(1), month: 6, day: 4 },
      end: { year: yearOf(1), month: 2, day: 5 },
      title: "SyngUp!解散",
      detail: "SyngUp!が解散する。",
      occurrenceType: "singleWithinRange",
      participants: ["tsukimura_temari", "hataiya_misuzu"], //kaya_rinha
      source: [
        "月村手毬 親愛度 第3話",
        "月村手毬 親愛度 第4話",
        "月村手毬 親愛度 第8話", //「『SyngUp!』解散から時間が経ちましたし・・・・・・」というセリフから、おそらく4,5月あたりのコミュで時間が経っているということになり、解散の時期がそこそこ前であることがわかる。
        "月村手毬 親愛度 第15話",
        "秦谷美鈴 親愛度 第2話",
        "https://x.com/gkmas_official/status/1989531491727282186?s=20 (5-10ページまで)",
        "藤田ことね プロデュースコミュ NEXT IDLE AUDITION Normal End",
      ],
      note: "",
    },
    {
      id: "syngup_blow_up",
      start: { year: yearsAgo(1), month: 6, day: 5 },
      end: { year: yearOf(1), month: 2, day: 5 },
      title: "SyngUp!解散による騒動と燐羽の炎上",
      detail:
        "SyngUp!が解散し、炎上していた手毬を擁護する形で燐羽が批判を繰り返し、炎上する。",
      occurrenceType: "singleWithinRange",
      participants: ["tsukimura_temari", "hataiya_misuzu"], //kaya_rinha
      source: [
        "月村手毬 親愛度 第11話",
        "月村手毬 親愛度 第15話",
        "月村手毬 親愛度 第16話",
        "秦谷美鈴 親愛度 第2話",
        "イベントコミュ ライブツアーイベント 渋谷編 第5話",
        "https://x.com/gkmas_official/status/1989531491727282186?s=20 (5-10ページまで)",
        "藤田ことね プロデュースコミュ NEXT IDLE AUDITION Normal End",
      ],
      note: "",
    },
    {
      id: "winter-hif_sena_first_prima-stella",
      start: { year: yearsAgo(1), month: 12, day: 1 }, //冬のHIFが一番期間について語られていないため、あくまで予想の期間にしている。
      end: { year: yearOf(1), month: 2, day: 28 },
      title: "十王星南が冬のHIFで一番星になる",
      detail:
        "十王星南が冬のHIFで一番星になる、参加は4回目（選抜試験？）、本戦出場は3回目",
      occurrenceType: "singleWithinRange",
      participants: ["juo_sena"],
      source: ["十王星南 親愛度 第25話"],
      note: "星南、燕ともにHIFの参加は4回目、本戦の出場は3回目。",
    },
  ],
};
