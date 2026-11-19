<template>
  <div class="theme-switch label" role="group" aria-label="Tema de color">
    <button
      type="button"
      :class="{ active: !isLight }"
      :aria-pressed="!isLight"
      @click="isLight = false"
    >
      Osc
    </button>
    <button
      type="button"
      :class="{ active: isLight }"
      :aria-pressed="isLight"
      @click="isLight = true"
    >
      Clr
    </button>
  </div>
</template>

<script setup>
import { onMounted, computed } from "vue";
import { globalState } from "../globalState";

const isLight = computed({
  get: () => !globalState.isDarkMode,
  set: (val) => {
    globalState.isDarkMode = !val;
    document.body.classList.toggle("light-theme", val);
    try {
      localStorage.setItem("theme", val ? "light" : "dark");
    } catch {
      /* sin almacenamiento disponible: el tema solo dura esta visita */
    }
  },
});

onMounted(() => {
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem("theme");
  } catch {
    savedTheme = null;
  }
  if (savedTheme === "light") isLight.value = true;
});
</script>

<style scoped>
.theme-switch {
  display: flex;
  height: 32px;
  border: 1px solid var(--line-strong);
}

.theme-switch button {
  padding-inline: 9px;
  font-size: 1rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--faint);
  transition: background-color var(--transition-1), color var(--transition-1);
}

.theme-switch button.active {
  background-color: var(--paper);
  color: var(--ink);
}
</style>
