<template>
  <div ref="root" class="ridges">
    <canvas ref="canvas" class="ridges-canvas" aria-hidden="true"></canvas>

    <p class="ridges-name display" :aria-label="name">
      <span
        v-for="(letter, index) in letters"
        :key="index"
        ref="letterEls"
        class="ridges-letter"
        :class="{ 'ridges-space': letter === ' ' }"
        aria-hidden="true"
        >{{ letter }}</span
      >
    </p>
  </div>
</template>

<script setup>
/**
 * Pie interactivo al estilo de la tapa de "Unknown Pleasures": líneas horizontales apiladas,
 * todas iguales, planas a los costados y con picos altos y en punta en la franja central,
 * distintos en cada línea (como los pulsos del púlsar de la carátula). Cada línea tapa a las
 * de atrás. El cursor engrosa las letras del nombre que tiene cerca (las líneas no reaccionan).
 */
import { onBeforeUnmount, onMounted, ref } from "vue";
import { followWeight } from "../weightFollow.js";

const props = defineProps({
  name: { type: String, default: "Diego Rosso" },
});

const letters = [...props.name.toUpperCase()];

const root = ref(null);
const canvas = ref(null);
const letterEls = ref([]);

const LINES = 50; // cantidad de líneas
const STEP = 3; // separación horizontal entre puntos de cada línea, px
const WEIGHT_MIN = 250; // como el título de la referencia
const WEIGHT_MAX = 800;

let ctx;
let frame = 0;
let running = false;
let reduceMotion = false;
let dpr = 1;
let width = 0;
let height = 0;
let colors = { ink: "#050505", paper: "#f2f2ee" };
let startTime = 0;
let observer;
let resizeObserver;
let themeObserver;

/** Ruido suave en 1D para que las crestas no sean perfectas */
function noise(x) {
  const i = Math.floor(x);
  const f = x - i;
  const h = (n) => {
    const s = Math.sin(n * 127.1) * 43758.5453;
    return s - Math.floor(s);
  };
  const t = f * f * (3 - 2 * f);
  return h(i) + (h(i + 1) - h(i)) * t;
}

function readColors() {
  const styles = getComputedStyle(document.body);
  colors = {
    ink: styles.getPropertyValue("--ink").trim() || colors.ink,
    paper: styles.getPropertyValue("--paper").trim() || colors.paper,
  };
}

function resize() {
  const el = canvas.value;
  if (!el) return;
  dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const rect = el.getBoundingClientRect();
  width = rect.width;
  height = rect.height;
  el.width = Math.round(width * dpr);
  el.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (!running) draw(performance.now());
}

function draw(now) {
  if (!ctx || !width) return;
  const time = reduceMotion ? 0 : (now - startTime) / 1000;

  ctx.clearRect(0, 0, width, height);

  // Como en la carátula: líneas a la misma distancia, sin perspectiva, con lugar arriba para los picos
  const top = height * 0.17;
  const bottom = height * 0.98;
  const avgGap = (bottom - top) / (LINES - 1);

  // Los extremos se apagan apenas, para que las líneas no terminen cortadas contra el borde
  const edgeFade = ctx.createLinearGradient(0, 0, width, 0);
  edgeFade.addColorStop(0, rgba(colors.paper, 0));
  edgeFade.addColorStop(0.05, rgba(colors.paper, 1));
  edgeFade.addColorStop(0.95, rgba(colors.paper, 1));
  edgeFade.addColorStop(1, rgba(colors.paper, 0));

  const amp = avgGap * 8; // los picos altos suben de seis a diez líneas, como en la carátula

  // De atrás (arriba) hacia adelante (abajo): cada línea tapa a las anteriores
  for (let i = 0; i < LINES; i++) {
    const base = top + avgGap * i;
    const pulses = linePulses(i, time);

    ctx.beginPath();
    for (let x = 0; x <= width + STEP; x += STEP) {
      const u = x / width;
      const p = pulseAt(u, pulses);
      // Aspereza fina en toda la línea (los dientes de la carátula), más fuerte sobre los picos
      const rough = noise(u * 170 + i * 3.7 + time * 0.3) - 0.5;
      const l = Math.max(0, p + rough * (0.05 + 0.22 * Math.min(1, p * 3)));
      const y = base - l * amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    // Relleno debajo de la línea con el fondo: tapa las líneas de atrás
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = colors.ink;
    ctx.fill();

    // Todas iguales, como en la carátula: mismo blanco y mismo grosor de adelante a atrás
    ctx.strokeStyle = edgeFade;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    ctx.stroke();
  }
}

/**
 * Pulsos de una línea (como los del púlsar de la carátula): cuatro picos dentro de la
 * franja central, con posición, alto y ancho que cambian de una línea a la otra. Las líneas
 * vecinas se parecen porque el ruido avanza despacio con el número de línea.
 */
function linePulses(i, time) {
  const pulses = [];
  for (let k = 0; k < 4; k++) {
    const pos = 0.5 + 0.14 * (2 * noise(i * 0.23 + k * 17.3 + time * 0.035) - 1);
    // Potencia: casi todos bajos y unos pocos muy altos; los dos primeros mandan
    const height = Math.pow(noise(i * 0.31 + k * 9.1 + time * 0.05), 2.2) * (k < 2 ? 1.3 : 0.75);
    const spread = 0.006 + 0.014 * noise(i * 0.47 + k * 4.7 + 50);
    pulses.push({ pos, height, spread });
  }
  return pulses;
}

/** Altura de la línea en u (0..1): suma de picos en punta, solo dentro de la ventana central */
function pulseAt(u, pulses) {
  const c = (u - 0.5) / 0.2;
  const windowed = Math.exp(-c * c * c * c); // ventana de techo plano: afuera, la línea queda plana
  if (windowed < 0.003) return 0;
  let p = 0;
  for (const { pos, height, spread } of pulses) {
    p += height * Math.exp(-Math.abs(u - pos) / spread);
  }
  return p * windowed;
}

/** "#f2f2ee" → "rgba(242, 242, 238, a)" */
function rgba(hex, alpha) {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) return `rgba(242, 242, 238, ${alpha})`;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function loop(now) {
  draw(now);
  frame = requestAnimationFrame(loop);
}

function start() {
  if (running || reduceMotion) return;
  running = true;
  frame = requestAnimationFrame(loop);
}

function stop() {
  running = false;
  cancelAnimationFrame(frame);
}

let stopWeight;

onMounted(() => {
  reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  ctx = canvas.value.getContext("2d");
  readColors();
  startTime = performance.now();

  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas.value);
  resize();

  // Solo se anima mientras el pie está en pantalla
  observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) start();
    else stop();
  });
  observer.observe(root.value);

  // Al cambiar de tema se actualizan los colores
  themeObserver = new MutationObserver(() => {
    readColors();
    if (!running) draw(performance.now());
  });
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });

  // Las letras del nombre engordan cerca del cursor, como en la referencia. Las letras son
  // muy grandes: con un radio corto solo se engrosa la que está bajo el mouse
  stopWeight = followWeight(
    () => letterEls.value.filter((el) => el && !el.classList.contains("ridges-space")),
    { min: WEIGHT_MIN, max: WEIGHT_MAX, radius: 170 }
  );
});

onBeforeUnmount(() => {
  stopWeight?.();
  stop();
  observer?.disconnect();
  resizeObserver?.disconnect();
  themeObserver?.disconnect();
});
</script>

<style scoped>
.ridges {
  position: relative;
  height: clamp(420px, 62vh, 680px);
  overflow: hidden;
  border-block-start: 1px solid var(--line);
}

.ridges-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* El nombre apoyado abajo y cortado por el borde, como en la referencia */
.ridges-name {
  position: absolute;
  inset: auto 0 0 0;
  display: flex;
  justify-content: center;
  font-size: clamp(9rem, 4rem + 13vw, 30rem);
  line-height: 0.8;
  letter-spacing: 0;
  color: var(--paper);
  transform: translateY(14%);
  pointer-events: none;
  user-select: none;
}

.ridges-letter {
  font-weight: 250;
  transition: font-weight 0.35s var(--ease-out);
}

.ridges-space {
  width: 0.28em;
}
</style>
