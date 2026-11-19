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
    <!-- Respaldo: se ve mientras carga y si el navegador no tiene WebGL -->
    <img v-if="!ready" :src="src" alt="" class="dither-fallback halftone" />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  /** Imagen de la trama; con `video`, es el póster (primer cuadro) */
  src: { type: String, required: true },
  /**
   * Fuentes de video opcionales, en orden de preferencia: [{ src, type }].
   * Si el navegador puede reproducir alguna, sus cuadros reemplazan a la imagen.
   */
  video: { type: Array, default: () => [] },
  /** Tamaño de cada celda de la trama, en px de CSS */
  cell: { type: Number, default: 4.5 },
  /** Radio de la lupa que sigue al cursor, en px de CSS */
  radius: { type: Number, default: 140 },
});

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
uniform vec2 uRes;      // tamaño del canvas en px reales
uniform vec2 uCover;    // escala para encuadrar la imagen tipo object-fit: cover
uniform vec2 uMouse;    // cursor en px reales, origen abajo a la izquierda
uniform float uHover;   // 0..1, cuánto actúa la lupa
uniform float uRadius;
uniform float uCell;
uniform float uTime;
uniform float uIntro;   // 0..1, aparición inicial de los puntos
uniform vec3 uRipple;   // centro (xy) y edad en segundos (z) de la onda del clic
uniform vec3 uPaper;
varying vec2 vUv;

// Matriz de Bayer 8x8: umbral ordenado para el dithering
float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

void main() {
  vec2 frag = vUv * uRes;
  vec2 cellId = floor(frag / uCell);
  vec2 center = (cellId + 0.5) * uCell;

  // Lupa: cerca del cursor la imagen se agranda y se ilumina
  vec2 toMouse = center - uMouse;
  float dist = length(toMouse);
  float lens = uHover * exp(-(dist * dist) / (2.0 * uRadius * uRadius));
  vec2 samplePos = center - normalize(toMouse + 0.0001) * lens * uRadius * 0.6;

  // Onda del clic: un anillo que se expande y empuja la trama
  float ring = 0.0;
  if (uRipple.z >= 0.0) {
    float age = uRipple.z;
    float rDist = length(center - uRipple.xy);
    float front = age * uRadius * 5.0;
    ring = exp(-pow((rDist - front) / (uCell * 6.0), 2.0)) * max(0.0, 1.0 - age / 1.4);
    samplePos += normalize(center - uRipple.xy + 0.0001) * ring * uCell * 3.0;
  }

  // Respiración lenta para que la imagen nunca esté del todo quieta
  samplePos += vec2(
    sin(center.y * 0.012 + uTime * 0.6),
    cos(center.x * 0.010 + uTime * 0.5)
  ) * uCell * 0.7;

  vec2 uv = samplePos / uRes;
  vec2 texUv = (uv - 0.5) * uCover + 0.5;
  vec3 color = texture2D(uTex, clamp(texUv, 0.0, 1.0)).rgb;
  float luma = dot(color, vec3(0.299, 0.587, 0.114));
  luma = smoothstep(0.06, 0.8, luma);

  // Máscara ovalada con borde que se disuelve en la trama. Se calcula sobre la
  // celda, no sobre el punto desplazado por la lupa: si no, cerca del borde del
  // canvas la máscara deja de ser 0 y la trama se corta en recto
  float edge = length((center / uRes - 0.5) * 2.0);
  float mask = smoothstep(1.0, 0.78, edge);

  // La lupa ilumina solo donde hay organismo (el fondo del video es negro)
  float content = smoothstep(0.0, 0.25, luma);
  float level = luma * mask + lens * 0.45 * mask * content + ring * 0.6 * mask;
  // Se centra cada umbral en su escalón: así ninguno vale 0 y fuera del óvalo no queda nada prendido
  float threshold = bayer8(cellId) + 0.5 / 64.0;
  float on = step(threshold, level) * step(threshold, uIntro);

  // Cada celda encendida es un cuadrado con un poco de aire alrededor
  vec2 local = fract(frag / uCell) - 0.5;
  float box = max(abs(local.x), abs(local.y));
  float cellOn = on * step(box, 0.36);

  // Las celdas apagadas dentro del organismo dejan un punto tenue (fuera de él, nada:
  // el canvas puede pasar por encima de la franja y del título)
  float ghost = (1.0 - on) * mask * content * step(box, 0.12) * 0.22 * uIntro;

  float alpha = max(cellOn, ghost);
  gl_FragColor = vec4(uPaper * alpha, alpha);
}`;

let gl;
let program;
let uniforms = {};
let texture;
let frame = 0;
let running = false;
let visible = true;
let reduceMotion = false;
let startTime = 0;
let introStart = 0;
let imageSize = { w: 1, h: 1 };
let dpr = 1;
let rippleStart = -1;
let rippleCenter = [0, 0];
let player = null; // <video> que alimenta la textura, si hay uno reproducible
let videoTime = -1; // tiempo del último cuadro subido a la textura

const pointer = { x: -9999, y: -9999, inside: false };
const smooth = { x: -9999, y: -9999, hover: 0 };

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

/** Lee --paper del tema actual y lo pasa al shader como rgb 0..1 */
function updateThemeColor() {
  if (!gl) return;
  const value = getComputedStyle(document.body).getPropertyValue("--paper").trim();
  let r = 0.95;
  let g = 0.95;
  let b = 0.93;
  const hex = value.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    r = ((n >> 16) & 255) / 255;
    g = ((n >> 8) & 255) / 255;
    b = (n & 255) / 255;
  }
  gl.useProgram(program);
  gl.uniform3f(uniforms.uPaper, r, g, b);
  if (!running) draw(performance.now());
}

function resize() {
  const el = canvas.value;
  if (!el || !gl) return;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = el.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width * dpr));
  const height = Math.max(1, Math.round(rect.height * dpr));
  if (el.width !== width || el.height !== height) {
    el.width = width;
    el.height = height;
  }
  gl.viewport(0, 0, width, height);

  // Encuadre tipo "cover": recorta la imagen para llenar el canvas sin deformarla
  const canvasAspect = width / height;
  const imageAspect = imageSize.w / imageSize.h;
  const cover =
    canvasAspect > imageAspect ? [1, imageAspect / canvasAspect] : [canvasAspect / imageAspect, 1];

  gl.useProgram(program);
  gl.uniform2f(uniforms.uRes, width, height);
  gl.uniform2f(uniforms.uCover, cover[0], cover[1]);
  gl.uniform1f(uniforms.uCell, props.cell * dpr);
  gl.uniform1f(uniforms.uRadius, props.radius * dpr);
  if (!running) draw(performance.now());
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
  const intro = reduceMotion ? 1 : Math.min(1, (now - introStart) / 1600);
  const easedIntro = 1 - Math.pow(1 - intro, 3);

  // El cursor y la lupa siguen al puntero con un poco de inercia
  const target = pointer.inside && !reduceMotion ? 1 : 0;
  smooth.hover += (target - smooth.hover) * 0.08;
  if (smooth.x < -9000) {
    smooth.x = pointer.x;
    smooth.y = pointer.y;
  } else {
    smooth.x += (pointer.x - smooth.x) * 0.14;
    smooth.y += (pointer.y - smooth.y) * 0.14;
  }

  const rippleAge = rippleStart < 0 ? -1 : (now - rippleStart) / 1000;
  if (rippleAge > 1.4) rippleStart = -1;

  gl.useProgram(program);
  gl.uniform1f(uniforms.uTime, reduceMotion ? 0 : time);
  gl.uniform1f(uniforms.uIntro, easedIntro);
  gl.uniform2f(uniforms.uMouse, smooth.x, smooth.y);
  gl.uniform1f(uniforms.uHover, smooth.hover);
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
      resize();
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

/** Pasa las coordenadas del puntero al sistema del canvas (px reales, y hacia arriba) */
function toCanvas(event) {
  const rect = canvas.value.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * dpr,
    y: (rect.bottom - event.clientY) * dpr,
    inside:
      event.clientX > rect.left - props.radius &&
      event.clientX < rect.right + props.radius &&
      event.clientY > rect.top - props.radius &&
      event.clientY < rect.bottom + props.radius,
  };
}

function onPointerMove(event) {
  if (!canvas.value) return;
  const p = toCanvas(event);
  pointer.x = p.x;
  pointer.y = p.y;
  pointer.inside = p.inside;
}

function onPointerLeave() {
  pointer.inside = false;
}

function onPointerDown(event) {
  if (!canvas.value || reduceMotion) return;
  const p = toCanvas(event);
  if (!p.inside) return;
  rippleCenter = [p.x, p.y];
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
  if (!gl) return; // sin WebGL: queda la imagen de respaldo

  program = createProgram();
  if (!program) return;
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

  [
    "uTex", "uRes", "uCover", "uMouse", "uHover", "uRadius", "uCell",
    "uTime", "uIntro", "uRipple", "uPaper",
  ].forEach((name) => {
    uniforms[name] = gl.getUniformLocation(program, name);
  });

  let image;
  try {
    image = await loadImage(props.src);
  } catch {
    return; // la imagen no cargó: queda el respaldo
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
  // Los puntos aparecen cuando se retira el preloader
  introStart = startTime + 900;

  resize();
  updateThemeColor();
  setupVideo();
  ready.value = true;

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

.dither-fallback {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
</style>
