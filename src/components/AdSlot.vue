<script setup>
import { onMounted } from "vue";

const ADSENSE_CLIENT = "ca-pub-1161740700371268";

const props = defineProps({
  adClient: { type: String, default: ADSENSE_CLIENT },
  adSlot: { type: String, required: true },
  label: { type: String, default: "広告" }
});

onMounted(() => {
  if (!props.adSlot) return;

  window.adsbygoogle = window.adsbygoogle || [];
  window.adsbygoogle.push({});
});
</script>

<template>
  <section class="ad-slot" :aria-label="label">
    <p class="ad-slot__label">{{ label }}</p>
    <ins
      class="adsbygoogle ad-slot__unit"
      style="display: block"
      :data-ad-client="adClient"
      :data-ad-slot="adSlot"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  </section>
</template>
