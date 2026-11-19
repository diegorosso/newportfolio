<template>
  <header class="section-head">
    <p class="label">
      <span class="label-dim">[</span> {{ pad(index) }}
      <span class="label-dim">/ {{ pad(total) }} ]</span>
      <span class="label-dim">·</span> {{ label }}
    </p>
    <h2 class="display h2" data-split>{{ title }}</h2>
    <p v-if="$slots.default" class="section-head-text muted">
      <slot />
    </p>
  </header>
</template>

<script setup>
defineProps({
  index: { type: Number, required: true },
  total: { type: Number, required: true },
  label: { type: String, required: true },
  title: { type: String, required: true },
});

const pad = (n) => String(n).padStart(2, "0");
</script>

<style scoped>
.section-head {
  display: grid;
  gap: 20px;
  margin-block-end: 56px;
}

.section-head .label {
  display: flex;
  gap: 0.6em;
}

.section-head-text {
  max-width: 46ch;
}

@media (min-width: 992px) {
  .section-head {
    margin-block-end: 88px;
  }
}
</style>
