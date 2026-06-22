const yearsAgo = (years) => 1 - years;
const yearOf = (year) => year;

export default {
  id: "tsubame_amaya",
  name: "雨夜 燕",
  color: "#7C69EE",
  events: [
    {
      id: "tsubame_debut",
      start: { year: yearOf(1), month: 1 },
      end: { year: yearOf(1), month: 1 },
      occurrenceType: "singleWithinRange",
      title: "副会長として登場",
      detail: "雨夜燕として生徒会副会長で登場",
    },
  ],
};
