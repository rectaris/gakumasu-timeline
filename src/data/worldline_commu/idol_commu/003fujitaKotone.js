import { yearsAgo, yearOf } from "../../utils/time";

export default {
  id: "kotone_fujita",
  name: "藤田 ことね",
  color: "#F8C216",
  events: [
    {
      id: "003_birth",
      start: { year: yearsAgo(16), month: 4, day: 2 },
      end: { year: yearsAgo(16), month: 4, day: 2 },
      occurrenceType: "singleWithinRange",
      title: "誕生",
      detail: "藤田ことね、誕生",
      participants: ["kotone_fujita"],
    },
    {
      id: "003_scout",
      start: { year: yearOf(1), month: 4, day: 1 },
      end: { year: yearOf(1), month: 4, day: 10 },
      occurrenceType: "singleWithinRange",
      title: "プロデューサーにスカウトされる",
      detail: "プロデューサーにスカウトされ、アイドル活動を開始する",
      worldlineId: ["hatsuboshi_commu", "idol_story"],
      participants: ["kotone_fujita"],
    },
    {
      id: "003_debut",
      start: { year: yearOf(1), month: 4, day: 1 },
      end: { year: yearOf(1), month: 4, day: 10 },
      occurrenceType: "singleWithinRange",
      title: "初星学園高等部進学",
      detail: "初星学園高等部に進学、1年1組に配属される",
      participants: ["kotone_fujita"],
    },
  ],
};
