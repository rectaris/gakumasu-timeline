import { yearsAgo, yearOf } from "../../utils/time";

export default {
  id: "temari_tsukimura",
  name: "月村 手毬",
  color: "#0D7CBC",
  events: [
    {
      id: "002_birth",
      start: { year: yearsAgo(16), month: 4, day: 2 },
      end: { year: yearsAgo(16), month: 4, day: 2 },
      title: "誕生",
      detail: "月村手毬、誕生",
      participants: ["temari_tsukimura"]
    },
    {
      id: "002_scout",
      start: { year: yearOf(1), month: 4, day: 1 },
      end: { year: yearOf(1), month: 4, day: 10 },
      title: "プロデューサーにスカウトされる",
      detail: "プロデューサーにスカウトされ、アイドル活動を開始する",
      worldlineId: ["story_of_re;iris", "likability_story"],
      participants: ["temari_tsukimura"]
    },
    {
      id: "002_debut",
      start: { year: yearOf(1), month: 4, day: 1 },
      end: { year: yearOf(1), month: 4, day: 10 },
      title: "初星学園高等部進学",
      detail: "初星学園高等部に進学、1年1組に配属される",
      participants: ["temari_tsukimura"]
    },
  ]
};
