<template>
  <div
    ref="root"
    class="ridges"
    @pointermove="onPointerMove"
    @pointerleave="onPointerLeave"
    @pointerdown="onPointerDown"
  >
    <canvas ref="canvas" class="ridges-canvas" aria-hidden="true"></canvas>

    <!-- Fuente del relieve: el organismo de Unreal. No se ve, solo se lee su brillo -->
    <video
      ref="video"
      class="ridges-source"
      :poster="poster"
      muted
      loop
      playsinline
      preload="none"
      aria-hidden="true"
      tabindex="-1"
    ></video>

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
 * Pie interactivo: líneas horizontales apiladas (al estilo de "Unknown Pleasures") cuyo
 * relieve sale del brillo del video del organismo hecho en Unreal. El cursor levanta las
 * líneas a su paso y engrosa las letras del nombre que tiene cerca.
 */
import { onBeforeUnmount, onMounted, ref } from "vue";
import { followWeight } from "../weightFollow.js";

const props = defineProps({
  /** Imagen en escala de grises que da el relieve (blanco = alto); también es el respaldo del video */
  poster: { type: String, required: true },
  /** Loop opcional del mismo relieve, en orden de preferencia: [{ src, type }] */
  videos: { type: Array, default: () => [] },
  name: { type: String, default: "Diego Rosso" },
});

const letters = [...props.name.toUpperCase()];

const root = ref(null);
const canvas = ref(null);
const video = ref(null);
const letterEls = ref([]);

const LINES = 56; // cantidad de líneas
const STEP = 4; // separación horizontal entre puntos de cada línea, px
const SAMPLE = 96; // resolución con la que se lee el brillo del video
const WEIGHT_MIN = 250; // como el título de la referencia
const WEIGHT_MAX = 800;

let ctx;
let sampleCtx;
let lum = new Float32Array(SAMPLE * SAMPLE); // brillo del video, 0..1
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

// Cursor relativo al bloque, con inercia
const pointer = { x: 0, y: 0, inside: false };
const smooth = { x: 0, y: 0, hover: 0 };

// Onda expansiva del clic
const RIPPLE_LIFE = 1.8; // segundos
const ripple = { x: 0, y: 0, start: -1 };

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

/** Lee el brillo del cuadro actual del video (o del póster) en una grilla chica */
function sampleSource() {
  const source = video.value && video.value.readyState >= 2 ? video.value : posterImg;
  if (!source || (source === posterImg && !posterImg.complete)) return;
  // Un leve desenfoque suaviza el grano de la imagen: las crestas salen continuas
  sampleCtx.filter = "blur(1.5px)";
  sampleCtx.drawImage(source, 0, 0, SAMPLE, SAMPLE);
  sampleCtx.filter = "none";
  const data = sampleCtx.getImageData(0, 0, SAMPLE, SAMPLE).data;
  for (let i = 0; i < SAMPLE * SAMPLE; i++) {
    const l = (0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]) / 255;
    lum[i] = Math.min(1, Math.max(0, (l - 0.04) / 0.7));
  }
}

function lumAt(u, v) {
  if (u < 0 || u > 1 || v < 0 || v > 1) return 0;
  const x = Math.min(SAMPLE - 1, Math.floor(u * SAMPLE));
  const y = Math.min(SAMPLE - 1, Math.floor(v * SAMPLE));
  return lum[y * SAMPLE + x];
}

function draw(now) {
  if (!ctx || !width) return;
  const time = reduceMotion ? 0 : (now - startTime) / 1000;
  sampleSource();

  smooth.hover += ((pointer.inside ? 1 : 0) - smooth.hover) * 0.08;
  smooth.x += (pointer.x - smooth.x) * 0.15;
  smooth.y += (pointer.y - smooth.y) * 0.15;

  ctx.clearRect(0, 0, width, height);

  const top = height * 0.08;
  const bottom = height * 0.96;
  const avgGap = (bottom - top) / (LINES - 1);
  // El relieve ocupa una franja central del pie
  const region = Math.min(width * 0.62, height * 1.6);
  const regionLeft = width / 2 - region / 2;

  // Onda expansiva del clic: edad en segundos (o -1 si no hay)
  const rippleAge = ripple.start < 0 ? -1 : (now - ripple.start) / 1000;
  if (rippleAge > RIPPLE_LIFE) ripple.start = -1;
  const rippleFade = rippleAge < 0 ? 0 : Math.pow(1 - rippleAge / RIPPLE_LIFE, 2);
  const rippleFront = rippleAge * Math.max(width, height) * 0.55;
  const rippleWidth = avgGap * 6;

  // Los costados se apagan: las líneas no terminan cortadas contra el borde
  const edgeFade = ctx.createLinearGradient(0, 0, width, 0);
  edgeFade.addColorStop(0, rgba(colors.paper, 0));
  edgeFade.addColorStop(0.14, rgba(colors.paper, 1));
  edgeFade.addColorStop(0.86, rgba(colors.paper, 1));
  edgeFade.addColorStop(1, rgba(colors.paper, 0));

  // De atrás (arriba) hacia adelante (abajo): cada línea tapa a las anteriores
  for (let i = 0; i < LINES; i++) {
    const t = i / (LINES - 1); // 0 = fondo, 1 = frente
    // Perspectiva: las del fondo más juntas, las de adelante más separadas
    const base = top + (bottom - top) * Math.pow(t, 1.45);
    const near = 0.45 + 0.55 * t; // lo cercano se ve más grande
    const gap = avgGap * near;
    const amp = avgGap * 13 * near; // cuánto sube el relieve

    ctx.beginPath();
    for (let x = 0; x <= width + STEP; x += STEP) {
      const u = (x - regionLeft) / region;
      // Curva sobre el brillo: lo más claro sube mucho más que el resto y aparece un pico
      const l = Math.pow(lumAt(u, t), 1.8);
      const jitter = (noise(x * 0.03 + i * 7.3 + time * 0.6) - 0.5) * gap * (0.3 + l * 1.4);
      // Onda lenta que recorre las líneas todo el tiempo
      const wave = Math.sin(x * 0.006 - time * 0.8 + i * 0.32) * gap * (0.35 + l * 0.9);
      // El cursor levanta las líneas cerca suyo
      const dx = (x - smooth.x) / 170;
      const dy = (base - smooth.y) / 150;
      const bump = Math.exp(-(dx * dx + dy * dy)) * gap * 7 * smooth.hover;
      // La onda del clic: un anillo que sale del punto y empuja las líneas hacia arriba
      let shock = 0;
      if (rippleFade > 0) {
        const d = Math.hypot(x - ripple.x, base - ripple.y);
        shock = Math.exp(-Math.pow((d - rippleFront) / rippleWidth, 2)) * gap * 6 * rippleFade;
      }
      const y = base - l * amp - bump - shock + jitter + wave;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    // Relleno debajo de la línea con el fondo: tapa las líneas de atrás
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = colors.ink;
    ctx.fill();

    // Las del fondo tenues y finas, las de adelante brillantes y un poco más gruesas
    ctx.globalAlpha = 0.08 + 0.72 * Math.pow(t, 1.3);
    ctx.strokeStyle = edgeFade;
    ctx.lineWidth = 0.8 + 0.7 * t;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
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
  video.value?.play().catch(() => {});
  frame = requestAnimationFrame(loop);
}

function stop() {
  running = false;
  cancelAnimationFrame(frame);
  video.value?.pause();
}

function onPointerMove(event) {
  const rect = root.value.getBoundingClientRect();
  pointer.x = event.clientX - rect.left;
  pointer.y = event.clientY - rect.top;
  if (!pointer.inside) {
    smooth.x = pointer.x;
    smooth.y = pointer.y;
  }
  pointer.inside = true;
  if (!running) draw(performance.now());
}

function onPointerLeave() {
  pointer.inside = false;
}

function onPointerDown(event) {
  if (reduceMotion) return;
  const rect = root.value.getBoundingClientRect();
  ripple.x = event.clientX - rect.left;
  ripple.y = event.clientY - rect.top;
  ripple.start = performance.now();
}

let posterImg;
let stopWeight;

onMounted(() => {
  reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  ctx = canvas.value.getContext("2d");
  const sampleCanvas = document.createElement("canvas");
  sampleCanvas.width = SAMPLE;
  sampleCanvas.height = SAMPLE;
  sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });

  posterImg = new Image();
  posterImg.onload = () => {
    if (!running) draw(performance.now());
  };
  posterImg.src = props.poster;

  readColors();
  startTime = performance.now();

  // El video solo se carga si se puede animar y el navegador reproduce alguna fuente
  const el = video.value;
  const source = props.videos.find(({ type }) => !type || el.canPlayType(type) !== "");
  if (!reduceMotion && source) {
    el.preload = "auto";
    el.src = source.src;
  }

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
  if (video.value) {
    video.value.removeAttribute("src");
    video.value.load();
  }
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

.ridges-source {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
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
