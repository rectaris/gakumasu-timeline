<script setup>
defineProps({
  years: { type: Array, required: true },
  monthTicks: { type: Array, required: true },
  dayTicks: { type: Array, required: true },
  showMonthScale: { type: Boolean, required: true },
  showDayScale: { type: Boolean, required: true },
  xPos: { type: Function, required: true },
  timelineViewport: { type: Object, required: true }
});
</script>

<template>
  <g>
    <g v-for="y in years" :key="y.year">
      <line
        class="timeline-grid-line timeline-grid-line--year"
        :x1="xPos(y.time)"
        :y1="timelineViewport.y"
        :x2="xPos(y.time)"
        :y2="timelineViewport.y + timelineViewport.height"
      />
    </g>

    <g v-if="showMonthScale">
      <g v-for="tick in monthTicks" :key="`month-${tick.time}`">
        <line
          class="timeline-grid-line timeline-grid-line--month"
          :x1="xPos(tick.time)"
          :y1="timelineViewport.y"
          :x2="xPos(tick.time)"
          :y2="timelineViewport.y + timelineViewport.height"
        />
      </g>
    </g>

    <g v-if="showDayScale">
      <g v-for="tick in dayTicks" :key="`day-${tick.time}`">
        <line
          class="timeline-grid-line timeline-grid-line--day"
          :x1="xPos(tick.time)"
          :y1="timelineViewport.y"
          :x2="xPos(tick.time)"
          :y2="timelineViewport.y + timelineViewport.height"
        />
      </g>
    </g>
  </g>
</template>
