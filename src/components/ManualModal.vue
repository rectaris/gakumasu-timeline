<script setup>
import { computed } from "vue";
import { marked } from "marked";

const props = defineProps({
  open: { type: Boolean, required: true },
  content: { type: String, required: true },
  onClose: { type: Function, required: true }
});

const renderedHtml = computed(() => marked.parse(props.content));
</script>

<template>
  <div v-if="open">
    <div class="manual-overlay" aria-hidden="true" @click="onClose"></div>
    <div
      id="manual-modal"
      class="manual-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="manual-modal-title"
      aria-describedby="manual-modal-content"
    >
      <div class="manual-header">
        <h2 id="manual-modal-title">操作マニュアル</h2>
        <button
          class="manual-close"
          type="button"
          aria-label="操作マニュアルを閉じる"
          title="操作マニュアルを閉じる"
          @click="onClose"
        >
          ×
        </button>
      </div>
      <div
        id="manual-modal-content"
        class="manual-content"
        v-html="renderedHtml"
      ></div>
    </div>
  </div>
</template>
