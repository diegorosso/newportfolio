<template>
  <div class="dither" :class="{ ready }">
    <canvas ref="canvas" class="dither-canvas" aria-hidden="true"></canvas>
    <!-- Fuente del video: no se ve, solo alimenta la textura del shader -->
    <video
      v-if="video.length"
      ref="videoEl"
      class="dither-source"
      muted
      loop
      playsinline
      disablepictureinpicture
      preload="none"
      aria-hidden="true"
      tabindex="-1"
    ></video>
  </div>
</template>

<script setup>
/**
 * Campo interactivo del hero, en WebGL. Ocupa todo el contenedor y dibuja dos capas:
 *  - una grilla de puntos de fondo que el cursor empuja en cualquier parte, y
 *  - el organismo (imagen o video) con trama ordenada (Bayer), ubicado dentro de la
 *    caja del elemento `anchor`, que también se aparta del cursor e inclina hacia él.
 * Emite `ready` cuando ya dibuja; mientras tanto (o sin WebGL) el padre muestra un respaldo.
 */
import { onBeforeUnmount, onMounted, ref } from "vue";
import { introDone, markDitherReady } from "../intro.js";

const props = defineProps({
  /** Imagen de la trama; con `video`, es el póster (primer cuadro) */
  src: { type: String, required: true },
  /**
   * Fuentes de video opcionales, en orden de preferencia: [{ src, type }].
   * Si el navegador puede reproducir alguna, sus cuadros reemplazan a la imagen.
   */
  video: { type: Array, default: () => [] },
  /** Selector del elemento que marca dónde va el organismo; sin él, ocupa todo el campo */
  anchor: { type: String, default: "" },
  /** Tamaño de cada celda de la trama del organismo, en px de CSS */
  cell: { type: Number, default: 4.5 },
  /** Separación de la grilla de puntos de fondo, en px de CSS (igual que `.dot-grid`) */
  grid: { type: Number, default: 22 },
  /** Dibuja la grilla de puntos de fondo (en el hero sí; en otras secciones, solo la figura) */
  showGrid: { type: Boolean, default: true },
  /**
   * Modo tranquilo: sin hueco ni onda del clic. Solo se desliza apenas hacia el cursor
   * (como un paralaje), para figuras que están detrás de un formulario o de texto
   */
  calm: { type: Boolean, default: false },
});

const emit = defineEmits(["ready"]);

const canvas = ref(null);
const videoEl = ref(null);
const ready = ref(false);

const VERTEX = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform sampler2D uTex;
uniform vec2 uRes;       // tamaño del canvas en px reales
uniform vec4 uOrg;       // caja del organismo en px del canvas: x, y (abajo a la izq.), ancho, alto
uniform vec2 uCover;     // encuadre tipo object-fit: cover de la textura dentro de esa caja
uniform float uOrgAlpha; // opacidad del organismo (más baja en pantallas chicas)
uniform vec2 uLean;      // cuánto se inclina el organismo hacia el cursor, en px
uniform vec2 uMouse;     // cursor en px reales, origen abajo a la izquierda
uniform float uHover;    // 0..1: el cursor está dentro del campo
uniform float uCell;     // celda de la trama del organismo, px
uniform float uGrid;     // separación de la grilla de fondo, px
uniform float uDotR;     // radio de los puntos de la grilla, px
uniform float uDotAlpha; // opacidad de los puntos de la grilla
uniform float uTime;
uniform float uIntro;    // 0..1, aparición inicial del organismo
uniform vec3 uRipple;    // centro (xy) y edad en segundos (z) de la onda del clic
uniform vec3 uPaper;
varying vec2 vUv;

// Matriz de Bayer 8x8: umbral ordenado para el dithering
float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

// Empuje, como las partículas en Unreal: devuelve de dónde viene lo que se ve en p.
// Todo lo que había dentro de 'reach' se comprime en un anillo entre 'hole' y 'reach',
// y en el centro queda un hueco vacío.
vec2 pushSource(vec2 p, float hole, float reach, out float pushed, out float holeMask) {
  vec2 d = p - uMouse;
  float dist = length(d);
  pushed = 0.0;
  // El hueco siempre queda limpio; lo que crece con uHover es su radio
  holeMask = uHover > 0.001 ? smoothstep(hole * 0.85, hole * 1.1 + uCell, dist) : 1.0;
  if (uHover <= 0.001 || dist >= reach) return p;
  float t = clamp((dist - hole) / (reach - hole), 0.0, 1.0);
  // Más apretado junto al hueco y suelto hacia afuera, sin salto en el borde de 'reach'
  float source = reach * mix(t, 1.0 - (1.0 - t) * (1.0 - t), 0.45);
  pushed = uHover * (1.0 - t);
  return uMouse + (d / max(dist, 0.0001)) * source;
}

// Onda expansiva del clic: un frente ancho que recorre todo el campo. Delante del frente
// empuja la trama hacia afuera y detrás la deja volver, así se siente como un golpe
vec2 rippleOffset(vec2 p, float reach, out float ring) {
  ring = 0.0;
  if (uRipple.z < 0.0) return vec2(0.0);
  float age = uRipple.z;
  vec2 d = p - uRipple.xy;
  float front = age * reach * 3.2;
  float width = max(uCell * 10.0, reach * 0.14);
  float s = (length(d) - front) / width;
  float fade = max(0.0, 1.0 - age / 1.8);
  fade *= fade; // se apaga suave, no de golpe
  ring = exp(-s * s) * fade;
  return -normalize(d + 0.0001) * (s * exp(-s * s)) * reach * 0.45 * fade;
}

void main() {
  vec2 frag = vUv * uRes;

  // El tamaño del hueco va con el del organismo, así guarda la proporción en cualquier pantalla
  float hole = uOrg.z * 0.11 * uHover;
  float reach = uOrg.z * 0.30;

  // ---------- Grilla de fondo: reacciona al cursor en todo el campo ----------
  float gPushed;
  float gHole;
  float gRing;
  vec2 gp = pushSource(frag, hole, reach, gPushed, gHole);
  gp += rippleOffset(frag, reach, gRing);
  vec2 nearest = (floor(gp / uGrid) + 0.5) * uGrid;
  float gridDot = 1.0 - smoothstep(uDotR - 0.6, uDotR + 0.6, length(gp - nearest));
  // Se apaga hacia los bordes, como la viñeta que tenía la grilla en CSS
  float e = length((vUv - vec2(0.65, 0.6)) / vec2(0.92, 0.85));
  float vignette = e < 0.7 ? mix(1.0, 0.3, e / 0.7) : mix(0.3, 0.0, clamp((e - 0.7) / 0.3, 0.0, 1.0));
  // El frente de la onda enciende la grilla en todo el campo, también en los bordes
  float gridAlpha = min(1.0, gridDot * gHole * (uDotAlpha * vignette * (1.0 + gPushed * 2.0) + gRing * 0.7));

  // ---------- Organismo ----------
  vec2 cellId = floor(frag / uCell);
  vec2 center = (cellId + 0.5) * uCell;

  float oPushed;
  float oHole;
  float oRing;
  vec2 samplePos = pushSource(center, hole, reach, oPushed, oHole);
  samplePos += rippleOffset(center, reach, oRing);

  // Respiración lenta para que nunca esté del todo quieto
  samplePos += vec2(
    sin(center.y * 0.012 + uTime * 0.6),
    cos(center.x * 0.010 + uTime * 0.5)
  ) * uCell * 0.7;

  // Se inclina hacia el cursor: la imagen se corre un poco en esa dirección
  samplePos -= uLean;

  vec2 local = (samplePos - uOrg.xy) / uOrg.zw;
  vec2 texUv = (local - 0.5) * uCover + 0.5;
  vec3 color = texture2D(uTex, clamp(texUv, 0.0, 1.0)).rgb;
  float luma = dot(color, vec3(0.299, 0.587, 0.114));
  luma = smoothstep(0.06, 0.8, luma);

  // Máscara ovalada dentro de la caja del organismo. Se calcula sobre la celda, no sobre
  // el punto desplazado: así el borde siempre se disuelve en la trama y nunca corta en recto
  float edge = length(((center - uOrg.xy) / uOrg.zw - 0.5) * 2.0);
  float mask = smoothstep(1.0, 0.78, edge);

  // El anillo apretado brilla solo donde hay organismo (el fondo del video es negro).
  // La onda brilla fuerte sobre el organismo y deja un anillo de trama en todo el campo
  float content = smoothstep(0.0, 0.25, luma);
  float onOrganism = mask * content;
  float level = (
    luma * mask
    + oPushed * 0.35 * onOrganism
    + oRing * (0.9 * onOrganism + 0.38 * (1.0 - onOrganism))
  ) * oHole;
  // Se centra cada umbral en su escalón: así ninguno vale 0 y fuera del óvalo no queda nada prendido
  float threshold = bayer8(cellId) + 0.5 / 64.0;
  float on = step(threshold, level) * step(threshold, uIntro);

  // Cada celda encendida es un cuadrado con un poco de aire alrededor
  vec2 inCell = fract(frag / uCell) - 0.5;
  float box = max(abs(inCell.x), abs(inCell.y));
  float cellOn = on * step(box, 0.36);

  // Las celdas apagadas dentro del organismo dejan un punto tenue
  float ghost = (1.0 - on) * mask * content * oHole * step(box, 0.12) * 0.22 * uIntro;
  float orgAlpha = max(cellOn, ghost) * uOrgAlpha;

  float alpha = max(orgAlpha, gridAlpha);
  gl_FragColor = vec4(uPaper * alpha, alpha);
}`;

const UNIFORMS = [
  "uTex", "uRes", "uOrg", "uCover", "uOrgAlpha", "uLean", "uMouse", "uHover", "uCell",
  "uGrid", "uDotR", "uDotAlpha", "uTime", "uIntro", "uRipple", "uPaper",
];

/** Inclinación máxima del organismo hacia el cursor, como fracción de su ancho */
const MAX_LEAN = 0.035;
const MAX_LEAN_CALM = 0.07; // en modo tranquilo es la única reacción, así que es un poco mayor

let gl;
let program;
let uniforms = {};
let texture;
let frame = 0;
let running = false;
let visible = true;
let reduceMotion = false;
let startTime = 0;
let introStart = Infinity; // hasta que se retire la pantalla de carga no aparece el organismo
let imageSize = { w: 1, h: 1 };
let dpr = 1;
let rippleStart = -1;
let rippleCenter = [0, 0];
let player = null; // <video> que alimenta la textura, si hay uno reproducible
let videoTime = -1; // tiempo del último cuadro subido a la textura
let anchorEl = null;
let lastFrame = 0; // momento del último cuadro, para la inercia por tiempo

// Se guarda la posición en pantalla y se pasa al canvas en cada cuadro:
// así el efecto sigue bien aunque la página se mueva sin mover el mouse
const pointer = { clientX: 0, clientY: 0, active: false };
const smooth = { x: -9999, y: -9999, hover: 0, leanX: 0, leanY: 0 };

let resizeObserver;
let intersectionObserver;
let themeObserver;

function compile(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram() {
  const vs = compile(gl.VERTEX_SHADER, VERTEX);
  const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(prog));
    return null;
  }
  return prog;
}

/** Lee --paper y la opacidad de --dot del tema actual y los pasa al shader */
function updateThemeColor() {
  if (!gl) return;
  const styles = getComputedStyle(document.body);
  let rgb = [0.95, 0.95, 0.93];
  const hex = styles.getPropertyValue("--paper").trim().match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    rgb = [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  const dotAlpha = styles.getPropertyValue("--dot").match(/,\s*([\d.]+)\s*\)\s*$/);

  gl.useProgram(program);
  gl.uniform3f(uniforms.uPaper, rgb[0], rgb[1], rgb[2]);
  gl.uniform1f(uniforms.uDotAlpha, props.showGrid ? (dotAlpha ? parseFloat(dotAlpha[1]) : 0.13) : 0);
  if (!running) draw(performance.now());
}

function resize() {
  const el = canvas.value;
  if (!el || !gl) return;
  // El campo ocupa todo el hero: con 1.5 de densidad alcanza y es bastante más liviano
  dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const rect = el.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width * dpr));
  const height = Math.max(1, Math.round(rect.height * dpr));
  if (el.width !== width || el.height !== height) {
    el.width = width;
    el.height = height;
  }
  gl.viewport(0, 0, width, height);

  gl.useProgram(program);
  gl.uniform2f(uniforms.uRes, width, height);
  gl.uniform1f(uniforms.uCell, props.cell * dpr);
  gl.uniform1f(uniforms.uGrid, props.grid * dpr);
  gl.uniform1f(uniforms.uDotR, 1.1 * dpr);
  if (!running) draw(performance.now());
}

/**
 * Caja del organismo en px del canvas (origen abajo a la izquierda). Se mide en cada
 * cuadro porque el ancla se mueve con el parallax del scroll.
 */
function organismBox(canvasRect) {
  if (props.anchor && !anchorEl?.isConnected) anchorEl = document.querySelector(props.anchor);
  const r = anchorEl ? anchorEl.getBoundingClientRect() : canvasRect;
  const alpha = anchorEl
    ? parseFloat(getComputedStyle(anchorEl).getPropertyValue("--org-alpha")) || 1
    : 1;
  return {
    x: (r.left - canvasRect.left) * dpr,
    y: (canvasRect.bottom - r.bottom) * dpr,
    w: Math.max(1, r.width * dpr),
    h: Math.max(1, r.height * dpr),
    alpha,
  };
}

/** Sube el cuadro actual del video a la textura, solo si avanzó desde el último */
function uploadVideoFrame() {
  if (!player || player.readyState < 2 || player.currentTime === videoTime) return;
  videoTime = player.currentTime;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, player);
}

function draw(now) {
  uploadVideoFrame();
  const time = (now - startTime) / 1000;
  const intro = reduceMotion ? 1 : Math.max(0, Math.min(1, (now - introStart) / 1600));
  const easedIntro = 1 - Math.pow(1 - intro, 3);

  const canvasRect = canvas.value.getBoundingClientRect();
  const box = organismBox(canvasRect);

  // El cursor en px del canvas. Cuenta como "adentro" en cualquier parte del campo
  const mouseX = (pointer.clientX - canvasRect.left) * dpr;
  const mouseY = (canvasRect.bottom - pointer.clientY) * dpr;
  const inside =
    pointer.active &&
    pointer.clientX >= canvasRect.left &&
    pointer.clientX <= canvasRect.right &&
    pointer.clientY >= canvasRect.top &&
    pointer.clientY <= canvasRect.bottom;

  // El hueco y la inclinación siguen al puntero con un poco de inercia. La inercia va por
  // tiempo, no por cuadro: así sigue al cursor igual en una pantalla de 144 Hz que en una
  // compu lenta que dibuja pocos cuadros por segundo
  const dt = lastFrame ? Math.min(0.1, (now - lastFrame) / 1000) : 1 / 60;
  lastFrame = now;
  const ease = (ratePerSecond) => 1 - Math.exp(-ratePerSecond * dt);

  const target = inside && !reduceMotion ? 1 : 0;
  smooth.hover += (target - smooth.hover) * ease(5);
  if (smooth.x < -9000) {
    smooth.x = mouseX;
    smooth.y = mouseY;
  } else {
    smooth.x += (mouseX - smooth.x) * ease(9);
    smooth.y += (mouseY - smooth.y) * ease(9);
  }

  // Inclinación: hacia donde esté el cursor, más fuerte cuanto más lejos del centro
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const reachX = Math.max(canvasRect.width * dpr, 1) * 0.5;
  const reachY = Math.max(canvasRect.height * dpr, 1) * 0.5;
  const leanTargetX = Math.max(-1, Math.min(1, (smooth.x - cx) / reachX)) * box.w * (props.calm ? MAX_LEAN_CALM : MAX_LEAN) * smooth.hover;
  const leanTargetY = Math.max(-1, Math.min(1, (smooth.y - cy) / reachY)) * box.w * (props.calm ? MAX_LEAN_CALM : MAX_LEAN) * smooth.hover;
  smooth.leanX += (leanTargetX - smooth.leanX) * ease(3.7);
  smooth.leanY += (leanTargetY - smooth.leanY) * ease(3.7);

  // Encuadre tipo "cover" de la imagen dentro de la caja del organismo
  const boxAspect = box.w / box.h;
  const imageAspect = imageSize.w / imageSize.h;
  const cover = boxAspect > imageAspect ? [1, imageAspect / boxAspect] : [boxAspect / imageAspect, 1];

  const rippleAge = rippleStart < 0 ? -1 : (now - rippleStart) / 1000;
  if (rippleAge > 1.8) rippleStart = -1; // misma duración que la onda en el shader

  gl.useProgram(program);
  gl.uniform4f(uniforms.uOrg, box.x, box.y, box.w, box.h);
  gl.uniform2f(uniforms.uCover, cover[0], cover[1]);
  gl.uniform1f(uniforms.uOrgAlpha, box.alpha);
  gl.uniform2f(uniforms.uLean, smooth.leanX, smooth.leanY);
  gl.uniform1f(uniforms.uTime, reduceMotion ? 0 : time);
  gl.uniform1f(uniforms.uIntro, easedIntro);
  gl.uniform2f(uniforms.uMouse, smooth.x, smooth.y);
  gl.uniform1f(uniforms.uHover, props.calm ? 0 : smooth.hover);
  gl.uniform3f(uniforms.uRipple, rippleCenter[0], rippleCenter[1], rippleStart < 0 ? -1 : rippleAge);

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function loop(now) {
  draw(now);
  frame = requestAnimationFrame(loop);
}

function start() {
  if (running || reduceMotion || !visible || document.hidden || !ready.value) return;
  running = true;
  frame = requestAnimationFrame(loop);
  player?.play().catch(() => {}); // si el navegador no deja, queda el último cuadro
}

function stop() {
  running = false;
  cancelAnimationFrame(frame);
  player?.pause();
}

/**
 * Prepara el video como fuente de la textura. Con "reducir movimiento", sin
 * fuentes compatibles o si falla la carga, la trama sigue usando el póster.
 */
function setupVideo() {
  const el = videoEl.value;
  if (!el || reduceMotion) return;
  const source = props.video.find(({ type }) => !type || el.canPlayType(type) !== "");
  if (!source) return;

  el.muted = true;
  el.addEventListener(
    "loadedmetadata",
    () => {
      imageSize = { w: el.videoWidth, h: el.videoHeight };
    },
    { once: true }
  );
  el.addEventListener("error", () => {
    player = null;
  });
  el.preload = "auto";
  el.src = source.src;
  player = el;
}

function onPointerMove(event) {
  pointer.clientX = event.clientX;
  pointer.clientY = event.clientY;
  pointer.active = true;
}

function onPointerLeave() {
  pointer.active = false;
}

/** En pantallas táctiles el hueco se cierra al levantar el dedo (con mouse sigue al cursor) */
function onPointerUp(event) {
  if (event.pointerType !== "mouse") pointer.active = false;
}

function onPointerDown(event) {
  if (!canvas.value || reduceMotion || props.calm) return;
  const rect = canvas.value.getBoundingClientRect();
  const inside =
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom;
  if (!inside) return;
  rippleCenter = [(event.clientX - rect.left) * dpr, (rect.bottom - event.clientY) * dpr];
  rippleStart = performance.now();
}

function onVisibility() {
  if (document.hidden) stop();
  else start();
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

onMounted(async () => {
  reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  gl = canvas.value.getContext("webgl", { premultipliedAlpha: true, antialias: false, alpha: true });
  if (!gl) return markDitherReady(false); // sin WebGL: el padre deja su respaldo

  program = createProgram();
  if (!program) return markDitherReady(false);
  gl.useProgram(program);

  // Un rectángulo que cubre todo el canvas (dos triángulos)
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  UNIFORMS.forEach((name) => {
    uniforms[name] = gl.getUniformLocation(program, name);
  });

  let image;
  try {
    image = await loadImage(props.src);
  } catch {
    return markDitherReady(false); // la imagen no cargó: queda el respaldo
  }
  if (!canvas.value) return; // el componente se desmontó mientras cargaba

  imageSize = { w: image.naturalWidth, h: image.naturalHeight };
  texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(uniforms.uTex, 0);

  startTime = performance.now();
  // El organismo aparece cuando se retira la pantalla de carga
  introDone.then(() => {
    introStart = performance.now() + 200;
  });

  resize();
  updateThemeColor();
  setupVideo();
  ready.value = true;
  emit("ready");
  markDitherReady(true);

  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas.value);

  // Solo se anima mientras el hero está en pantalla
  intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
    else stop();
  });
  intersectionObserver.observe(canvas.value);

  // Al cambiar de tema se actualiza el color de los puntos
  themeObserver = new MutationObserver(updateThemeColor);
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerDown, { passive: true });
  window.addEventListener("pointerup", onPointerUp, { passive: true });
  window.addEventListener("pointercancel", onPointerUp, { passive: true });
  document.documentElement.addEventListener("pointerleave", onPointerLeave);
  document.addEventListener("visibilitychange", onVisibility);

  if (reduceMotion) draw(performance.now());
  else start();
});

onBeforeUnmount(() => {
  stop();
  resizeObserver?.disconnect();
  intersectionObserver?.disconnect();
  themeObserver?.disconnect();
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerdown", onPointerDown);
  window.removeEventListener("pointerup", onPointerUp);
  window.removeEventListener("pointercancel", onPointerUp);
  document.documentElement.removeEventListener("pointerleave", onPointerLeave);
  document.removeEventListener("visibilitychange", onVisibility);
  if (player) {
    // Corta la descarga del video
    player.removeAttribute("src");
    player.load();
    player = null;
  }
  gl?.getExtension("WEBGL_lose_context")?.loseContext();
});
</script>

<style scoped>
.dither {
  position: relative;
  width: 100%;
  height: 100%;
}

.dither-canvas {
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.6s ease;
}

.dither.ready .dither-canvas {
  opacity: 1;
}

/* En el layout (algunos navegadores pausan videos fuera de él), pero invisible */
.dither-source {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
}
</style>
