<script setup>
const props = defineProps({
  zoomMode: { type: String, required: true },
  isYearMode: { type: Boolean, required: true },
  isMonthMode: { type: Boolean, required: true },
  isDayMode: { type: Boolean, required: true },
  zoomLabel: { type: String, required: true },
  zoomCenterYear: { type: Number, required: true },
  zoomCenterMonth: { type: Number, required: true },
  yearBounds: { type: Object, required: true },
  monthBounds: { type: Object, required: true },
  yearLabel: { type: Function, required: true },
  monthLabel: { type: Function, required: true },
  zoomIn: { type: Function, required: true },
  zoomOut: { type: Function, required: true },
  prevYear: { type: Function, required: true },
  nextYear: { type: Function, required: true },
  prevMonth: { type: Function, required: true },
  nextMonth: { type: Function, required: true },
  startHold: { type: Function, required: true },
  stopHold: { type: Function, required: true },
  handleNavClick: { type: Function, required: true }
});

const emit = defineEmits([
  "update:zoomCenterYear",
  "update:zoomCenterMonth"
]);

function updateYear(event) {
  emit("update:zoomCenterYear", Number(event.target.value));
}

function updateMonth(event) {
  emit("update:zoomCenterMonth", Number(event.target.value));
}
</script>

<template>
  <div class="zoom-controls">
    <button
      class="zoom-button zoom-button--out"
      @click="zoomOut"
      :disabled="zoomMode === 'all'"
    >
      −
    </button>
    <span class="zoom-label">{{ zoomLabel }}</span>
    <button
      class="zoom-button zoom-button--in"
      @click="zoomIn"
      :disabled="isDayMode"
    >
      ＋
    </button>
  </div>

  <div class="year-slider" v-if="isYearMode">
    <label>
      中心年：
      {{ yearLabel(zoomCenterYear) }}
    </label>

    <div class="slider-row">
      <button
        class="slider-nav slider-nav--prev"
        @mousedown="startHold(prevYear)"
        @touchstart="startHold(prevYear)"
        @click="handleNavClick(prevYear)"
        @mouseup="stopHold"
        @mouseleave="stopHold"
        @touchend="stopHold"
        @touchcancel="stopHold"
        :disabled="zoomCenterYear <= yearBounds.minYear"
      >
        &lt;
      </button>
      <input
        type="range"
        :min="yearBounds.minYear"
        :max="yearBounds.maxYear"
        :value="zoomCenterYear"
        @input="updateYear"
        step="1"
      />
      <button
        class="slider-nav slider-nav--next"
        @mousedown="startHold(nextYear)"
        @touchstart="startHold(nextYear)"
        @click="handleNavClick(nextYear)"
        @mouseup="stopHold"
        @mouseleave="stopHold"
        @touchend="stopHold"
        @touchcancel="stopHold"
        :disabled="zoomCenterYear >= yearBounds.maxYear"
      >
        &gt;
      </button>
    </div>
  </div>

  <div class="month-slider" v-if="isMonthMode">
    <label>
      中心月：
      {{ monthLabel(zoomCenterMonth) }}
    </label>

    <div class="slider-row">
      <button
        class="slider-nav slider-nav--prev"
        @mousedown="startHold(prevMonth)"
        @touchstart="startHold(prevMonth)"
        @click="handleNavClick(prevMonth)"
        @mouseup="stopHold"
        @mouseleave="stopHold"
        @touchend="stopHold"
        @touchcancel="stopHold"
        :disabled="zoomCenterMonth <= monthBounds.minMonth"
      >
        &lt;
      </button>
      <input
        type="range"
        :min="monthBounds.minMonth"
        :max="monthBounds.maxMonth"
        :value="zoomCenterMonth"
        @input="updateMonth"
        step="1"
      />
      <button
        class="slider-nav slider-nav--next"
        @mousedown="startHold(nextMonth)"
        @touchstart="startHold(nextMonth)"
        @click="handleNavClick(nextMonth)"
        @mouseup="stopHold"
        @mouseleave="stopHold"
        @touchend="stopHold"
        @touchcancel="stopHold"
        :disabled="zoomCenterMonth >= monthBounds.maxMonth"
      >
        &gt;
      </button>
    </div>
  </div>
</template>
