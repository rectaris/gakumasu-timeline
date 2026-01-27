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
    <div class="manual-overlay" @click="onClose"></div>
    <div class="manual-modal" role="dialog" aria-modal="true">
      <div class="manual-header">
        <h2>操作マニュアル</h2>
        <button class="manual-close" type="button" @click="onClose">
          ×
        </button>
      </div>
      <div class="manual-content" v-html="renderedHtml"></div>
    </div>
  </div>
</template>
