<template>
  <section class="service" id="service" aria-label="Servicios">
    <h2 class="sr-only">Servicios</h2>

    <div class="service-band">
      <!-- Fondo: banda de ruido con trama (se genera al cargar) y un degradado que la apaga arriba y abajo -->
      <div class="service-noise" :style="noiseStyle" aria-hidden="true"></div>
      <div class="service-fade" aria-hidden="true"></div>

      <div class="marquee" aria-hidden="true">
        <div ref="track" class="marquee-track">
          <template v-for="copy in 2" :key="copy">
            <span
              v-for="(word, index) in words"
              :key="`${copy}-${index}`"
              class="marquee-item"
            >
              <span class="display" :class="{ outline: index % 2 === 1 }">{{ word }}</span>
              <span class="star">✳</span>
            </span>
          </template>
        </div>
      </div>

      <ul class="sr-only">
        <li v-for="word in words" :key="word">{{ word }}</li>
      </ul>

      <p class="service-caption label wrap">
        Del diseño al código, con IA donde suma.
      </p>
    </div>
  </section>
</template>

<script>
/** Velocidad de la marquesina sin scroll, en px por segundo */
const BASE_SPEED = 20;
/** Cuánto de la velocidad del scroll se le suma a la marquesina */
const SCROLL_BOOST = 0.7;

// Matriz de Bayer 4x4: el mismo tipo de trama ordenada que usa el hero
const BAYER_4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

const hash = (i, j) => {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const smooth = (t) => t * t * (3 - 2 * t);

/** Ruido suave (value noise): manchas difusas, siempre iguales en cada carga */
function valueNoise(x, y) {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = smooth(x - i);
  const fy = smooth(y - j);
  const top = hash(i, j) + (hash(i + 1, j) - hash(i, j)) * fx;
  const bottom = hash(i, j + 1) + (hash(i + 1, j + 1) - hash(i, j + 1)) * fx;
  return top + (bottom - top) * fy;
}

/**
 * Dibuja una banda de ruido nublado con trama ordenada y la devuelve como imagen.
 * Se usa como máscara: los puntos toman el color del tema (claro u oscuro).
 */
function ditherNoiseBand(width = 1600, height = 500, cell = 3) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";

  for (let row = 0; row * cell < height; row++) {
    for (let col = 0; col * cell < width; col++) {
      const x = col * cell;
      const y = row * cell;
      const clouds =
        0.55 * valueNoise(x / 190, y / 95) +
        0.3 * valueNoise(x / 80, y / 48 + 17) +
        0.15 * valueNoise(x / 28, y / 24 + 41);
      // Más denso en el medio de la banda, se apaga hacia arriba y abajo
      const band = Math.pow(Math.sin((Math.PI * y) / height), 1.2);
      const t = Math.min(1, Math.max(0, (clouds - 0.32) / 0.42));
      const level = smooth(t) * band;
      const threshold = (BAYER_4[(row % 4) * 4 + (col % 4)] + 0.5) / 16;
      if (level > threshold) ctx.fillRect(x, y, cell - 1, cell - 1);
    }
  }
  return canvas.toDataURL("image/png");
}

export default {
  name: "ServiceSection",
  data() {
    return {
      noiseUrl: "",
      words: [
        "Desarrollo web",
        "Producto",
        "IA aplicada",
        "Diseño gráfico",
        "Arte digital",
        "Apps móviles",
      ],
    };
  },
  computed: {
    noiseStyle() {
      return this.noiseUrl ? { "--noise": `url(${this.noiseUrl})` } : {};
    },
  },
  mounted() {
    this.noiseUrl = ditherNoiseBand();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Estado de la marquesina: posición, dirección (sigue al último scroll) y empuje del scroll
    this.x = 0;
    this.direction = -1;
    this.boost = 0;

    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) this.startMarquee();
      else this.stopMarquee();
    });
    this.observer.observe(this.$el);
  },
  beforeUnmount() {
    this.stopMarquee();
    this.observer?.disconnect();
  },
  methods: {
    startMarquee() {
      if (this.frame) return;
      this.lastY = window.scrollY;
      this.lastTime = performance.now();
      this.frame = requestAnimationFrame(this.tick);
    },
    stopMarquee() {
      cancelAnimationFrame(this.frame);
      this.frame = 0;
    },
    /**
     * Como en la referencia: avanza lento sola, se acelera con la velocidad del scroll
     * (y vuelve rápido a la base) y cambia de sentido según scrolleés hacia abajo o arriba.
     */
    tick(now) {
      const dt = Math.min(0.05, (now - this.lastTime) / 1000) || 1 / 60;
      this.lastTime = now;

      const dy = window.scrollY - this.lastY;
      this.lastY = window.scrollY;
      if (dy !== 0) this.direction = dy > 0 ? -1 : 1;

      const target = (Math.abs(dy) / dt) * SCROLL_BOOST;
      const rate = target > this.boost ? 18 : 6; // sube enseguida, baja en unos 300 ms
      this.boost += (target - this.boost) * (1 - Math.exp(-rate * dt));

      const track = this.$refs.track;
      this.x += this.direction * (BASE_SPEED + this.boost) * dt;
      const half = track.scrollWidth / 2;
      if (this.x <= -half) this.x += half;
      else if (this.x > 0) this.x -= half;
      track.style.transform = `translate3d(${this.x}px, 0, 0)`;

      this.frame = requestAnimationFrame(this.tick);
    },
  },
};
</script>

<style scoped>
.service {
  position: relative;
  border-block: 1px solid var(--line);
  overflow: hidden;
  scroll-margin-top: var(--header-h);
}

.service-band {
  position: relative;
  padding-block: 48px 44px;
}

/* Banda de ruido: toma el color del texto del tema a través de la máscara */
.service-noise {
  position: absolute;
  inset: 0;
  background-color: var(--paper);
  opacity: 0.35;
  -webkit-mask-image: var(--noise);
  mask-image: var(--noise);
  /* Nunca más angosta que su tamaño real (1600 px): así los puntos no se achican en el
     celular, donde se ve solo el centro de la banda */
  -webkit-mask-size: max(100%, 1600px) auto;
  mask-size: max(100%, 1600px) auto;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  pointer-events: none;
}

.service-fade {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    var(--ink),
    color-mix(in srgb, var(--ink) 40%, transparent),
    var(--ink)
  );
  pointer-events: none;
}

.marquee {
  position: relative;
  display: flex;
  overflow: hidden;
}

.marquee-track {
  display: flex;
  flex-shrink: 0;
  will-change: transform;
}

.marquee-item {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.marquee-item .display {
  font-size: clamp(7.2rem, 4rem + 9vw, 20.8rem);
  line-height: 1.08; /* deja lugar para tildes y la Ñ */
  white-space: nowrap;
  padding-inline: 0.12em;
}

.outline {
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in srgb, var(--paper) 55%, transparent);
}

.star {
  font-family: var(--fontFamily-mono);
  font-size: clamp(2.4rem, 1.6rem + 2vw, 4rem);
  color: color-mix(in srgb, var(--paper) 50%, transparent);
  padding-inline: 0.4em;
}

.service-caption {
  position: relative;
  max-width: 44rem;
  margin: 24px auto 0;
  text-align: center;
  color: color-mix(in srgb, var(--paper) 70%, transparent);
}

</style>
