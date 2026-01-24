import { yearOf } from "../../utils/time";

export default {
  id: "story_of_reiris",
  name: "Story of Re;Iris",
  events: [
    {
      id: "001_h_debut",
      start: { year: yearOf(1), month: 4, day: 1 },
      end: { year: yearOf(1), month: 4, day: 10 },
      title: "初星学園高等部入学式",
      detail: "初星学園高等部に入学、1年1組に配属される",
      occurrenceType: "singleWithinRange",
      worldlineId: ["hatsuboshi_commu"],
      participants: ["saki_hanami"],
      source: ["Story of Re;IRIS 1話"],
      note: "初星学園は私立の学校法人のため、入学式の日程にはばらつきがある可能性がある。\n初星学園は関東圏の学校である可能性が高いため、4月7日〜8日の間に入学式が行われたと推測される。"
    },
    {
      id: "001_h_meet_ume",
      start: { year: yearOf(1), month: 4, day: 1 },
      end: { year: yearOf(1), month: 4, day: 10 },
      title: "遅刻した佑芽と出会う",
      detail: "入学式に遅刻してきた佑芽と出会う。咲季とも会話。",
      occurrenceType: "singleWithinRange",
      worldlineId: ["hatsuboshi_commu"],
      participants: ["saki_hanami", "ume_hanami"],
      source: ["Story of Re;IRIS 1話"]
    },
    {
      id: "001_h_meet_reiris",
      start: { year: yearOf(1), month: 4, day: 1 },
      end: { year: yearOf(1), month: 4, day: 10 },
      title: "咲季、手毬、ことねが出会う",
      detail: "プロデューサーが用意した教室で、咲季、手毬、ことねが出会う。",
      occurrenceType: "singleWithinRange",
      worldlineId: ["hatsuboshi_commu"],
      participants: ["saki_hanami", "temari_tsukimura", "kotone_fujita"],
      source: ["Story of Re;IRIS 3話"],
      note: "咲季からアイドル事務所としては「765プロ」という言葉が出る。"
    },
    {
      id: "001_h_rest_kotone",
      start: { year: yearOf(1), month: 4, day: 1 },
      end: { year: yearOf(1), month: 4, day: 12 },
      title: "ことね、体調回復のために休養する",
      detail: "ことねが体調不良のため、咲季とのダンス勝負の日まで休養する。",
      occurrenceType: "singleWithinRange",
      worldlineId: ["hatsuboshi_commu"],
      participants: ["kotone_fujita"],
      source: ["Story of Re;IRIS 7話"]
    },
    {
      id: "001_h_battle_saki_kotone",
      start: { year: yearOf(1), month: 4, day: 3 },
      end: { year: yearOf(1), month: 4, day: 12 },
      title: "咲季とことねのダンス勝負",
      detail: "咲季をユニット入りさせるために、ことねがダンス勝負をする。",
      occurrenceType: "singleWithinRange",
      worldlineId: ["hatsuboshi_commu"],
      participants: ["saki_hanami", "kotone_fujita"],
      source: ["Story of Re;IRIS 8話", "Story of Re;IRIS 9話"]
    },
    {
      id: "001_h_first_dance_lesson",
      start: { year: yearOf(1), month: 4, day: 4 },
      end: { year: yearOf(1), month: 4, day: 13 },
      title: "ユニット初回のダンスレッスン",
      detail: "咲季、手毬、ことねの3人で初めてのダンスレッスンを行う。",
      occurrenceType: "singleWithinRange",
      worldlineId: ["hatsuboshi_commu"],
      participants: ["saki_hanami", "temari_tsukimura", "kotone_fujita"],
      source: ["Story of Re;IRIS 10話"]
    }
  ]
};
