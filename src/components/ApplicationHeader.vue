<script setup>
import LoginLink from "./LoginLink.vue";
import TimelineModeSwitcher from "./TimelineModeSwitcher.vue";

defineProps({
  title: {
    type: String,
    required: true,
  },
  titleId: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <slot name="primary-actions"></slot>
    </div>

    <h1
      :id="titleId"
      class="app-title"
      data-timeline-page-heading
      tabindex="-1"
    >{{ title }}</h1>

    <div class="header-right">
      <TimelineModeSwitcher />
      <LoginLink />
      <a
        class="portal-link"
        href="https://rectaris.github.io/"
        aria-label="rectaris.github.ioへ移動"
        title="rectaris.github.ioへ移動"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
          <path d="M15 3h6v6" />
          <path d="M10 14 21 3" />
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        </svg>
      </a>
    </div>
  </header>
</template>
