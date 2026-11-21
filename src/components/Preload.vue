<template>
  <div
    v-if="visible"
    ref="root"
    class="loader"
    role="progressbar"
    aria-label="Cargando el sitio"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="count"
  >
    <div class="loader-top label pl-fade" aria-hidden="true">
      <span>Diego Rosso — Portfolio</span>
      <span class="label-dim">©{{ year }}</span>
    </div>

    <ul class="loader-log label" aria-hidden="true">
      <li
        v-for="step in steps"
        :key="step.label"
        class="log-line pl-fade"
        :class="{ shown: step.state !== 'idle' }"
      >
        <span><span class="label-dim">&gt;</span> {{ step.label }}</span>
        <span :class="{ 'label-dim': step.state !== 'ok' }">{{ statusText(step.state) }}</span>
      </li>
    </ul>

    <div class="loader-bottom" aria-hidden="true">
      <span class="loader-count display pl-fade">{{ count }}</span>
      <span class="label label-dim pl-fade loader-place">San Isidro, AR — 34.50°S</span>
    </div>

    <span ref="bar" class="loader-bar" aria-hidden="true"></span>
  </div>
</template>

<script setup>
import gsap from "gsap";
import { onMounted, reactive, ref } from "vue";
import { ditherReady, finishIntro, markIntroSeen, showIntro } from "../intro.js";

const visible = ref(showIntro);
const count = ref(0);
const root = ref(null);
const bar = ref(null);
const year = new Date().getFullYear();

/** Tiempo mínimo en pantalla, para que el log se alcance a leer */
const MIN_ON_SCREEN = 1400;
/** Si un paso tarda más que esto, se marca "—" y se sigue: la carga nunca se traba */
const STEP_TIMEOUT = 3000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runStep = (task) =>
  Promise.race([
    Promise.resolve(task()).then((result) => (result === false ? "skip" : "ok")),
    wait(STEP_TIMEOUT).then(() => "skip"),
  ]);

// Cada línea espera algo real: las tipografías y la trama WebGL del hero
const steps = reactive(
  [
    { label: "iniciar renderer", task: () => wait(220) },
    { label: "cargar tipografías", task: () => document.fonts.ready },
    { label: "compilar shader de trama", task: () => ditherReady },
    { label: "sincronizar scroll", task: () => wait(180) },
    { label: "listo", task: () => wait(120) },
  ].map((step) => ({ ...step, state: "idle" }))
);

const statusText = (state) =>
  ({ idle: "", run: "…", ok: "ok", skip: "—" })[state];

onMounted(async () => {
  if (!visible.value) {
    finishIntro();
    return;
  }

  markIntroSeen();
  // Que la carga siempre arranque arriba, aunque el navegador recuerde el scroll
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  const progress = { v: 0 };
  const render = () => {
    count.value = Math.round(progress.v);
    if (bar.value) bar.value.style.transform = `scaleX(${progress.v / 100})`;
  };

  const startedAt = performance.now();

  for (const [index, step] of steps.entries()) {
    step.state = "run";
    step.state = await runStep(step.task);
    gsap.to(progress, {
      v: ((index + 1) / steps.length) * 92,
      duration: 0.9,
      ease: "power2.inOut",
      overwrite: true,
      onUpdate: render,
    });
  }

  const elapsed = performance.now() - startedAt;
  if (elapsed < MIN_ON_SCREEN) await wait(MIN_ON_SCREEN - elapsed);

  await gsap.to(progress, {
    v: 100,
    duration: 0.5,
    ease: "power3.out",
    overwrite: true,
    onUpdate: render,
  });

  // Salida: los textos suben y se apagan, y la pantalla se recorta hacia arriba
  gsap
    .timeline({ onComplete: () => (visible.value = false) })
    .to(root.value.querySelectorAll(".pl-fade"), {
      yPercent: -120,
      opacity: 0,
      duration: 0.6,
      ease: "expo.in",
      stagger: 0.04,
    })
    .call(finishIntro, null, "-=0.15")
    .fromTo(
      root.value,
      { clipPath: "inset(0% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 100% 0%)", duration: 1.1, ease: "expo.inOut" },
      "<"
    );
});
</script>

<style scoped>
.loader {
  position: fixed;
  inset: 0;
  z-index: 45; /* sobre el header (40), debajo del grano (50) y del cursor */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px var(--gutter) 28px;
  background-color: var(--ink);
  color: var(--paper);
  overflow: hidden;
}

.loader-top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.loader-log {
  align-self: center;
  display: grid;
  gap: 6px;
  width: min(100%, 440px);
}

.log-line {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.log-line.shown {
  opacity: 1;
}

/* El reset global vuelve bloque a todos los span: acá van en línea ("> paso ... ok") */
.log-line span {
  display: inline;
}

.loader-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  padding-block-end: 20px;
}

.loader-count {
  font-size: clamp(12rem, 6rem + 18vw, 32rem);
  line-height: 0.78;
  font-variant-numeric: tabular-nums;
}

.loader-place {
  text-align: right;
}

.loader-bar {
  position: absolute;
  left: var(--gutter);
  right: var(--gutter);
  bottom: 28px;
  height: 1px;
  background-color: var(--paper);
  transform: scaleX(0);
  transform-origin: left;
}
</style>
