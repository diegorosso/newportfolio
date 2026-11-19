<template>
  <section class="hero dot-grid" id="home" aria-label="Presentación">
    <ul class="hero-strip wrap">
      <li v-for="item in strip" :key="item.key" class="strip-item">
        <span class="label">{{ item.key }}</span>
        <span class="label label-dim">{{ item.value }}</span>
      </li>
      <li class="strip-item strip-time">
        <span class="label">Hora local</span>
        <span class="label label-dim">{{ time }}</span>
      </li>
    </ul>

    <div class="hero-main wrap">
      <figure class="hero-visual" aria-hidden="true">
        <DitherImage :src="heroPoster" :video="heroVideo" data-parallax />
      </figure>

      <div class="hero-copy">
        <p class="label hero-eyebrow">
          <span class="pulse" aria-hidden="true"></span>
          <span class="label-dim">[ 00 ]</span> · Diseño + desarrollo
        </p>
        <h1 class="display h1" data-split>
          Desarrollo web,<br />diseño e<br />IA aplicada
        </h1>
      </div>

      <div class="hero-card" data-reveal>
        <p>
          Desarrollador web con experiencia en interfaces de usuario y diseño.
          Construyo sitios, productos y herramientas con IA aplicada, desde la
          idea hasta el deploy.
        </p>
        <div class="hero-actions">
          <a href="#project" class="btn btn--ghost">Ver proyectos</a>
          <a href="#contact" class="btn">
            Hablemos <span class="arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>

    <div class="hero-wordmark wrap" aria-hidden="true">
      <!-- Alto 166: a 200 px las mayúsculas suben ~162 sobre la base; con menos se recortan arriba -->
      <svg viewBox="0 0 1000 166" preserveAspectRatio="none">
        <text x="0" y="164" textLength="1000" lengthAdjust="spacingAndGlyphs">
          DIEGO ROSSO
        </text>
      </svg>
    </div>

    <div class="hero-foot wrap">
      <span class="label label-dim">Desarrollador web · Portfolio {{ year }}</span>
      <a href="#service" class="label scroll-cue">
        Scroll <span aria-hidden="true">↓</span>
      </a>
    </div>
  </section>
</template>

<script>
import DitherImage from "./DitherImage.vue";
import heroPoster from "../assets/images/organismo-hero.webp";
import heroWebm from "../assets/videos/organismo-hero.webm";
import heroMp4 from "../assets/videos/organismo-hero.mp4";

const timeFormat = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export default {
  name: "HeroComponent",
  components: { DitherImage },
  data() {
    return {
      // "Organismo" (Unreal) sin trama: la trama la pone el shader de DitherImage
      heroPoster,
      heroVideo: [
        { src: heroWebm, type: 'video/webm; codecs="vp9"' },
        { src: heroMp4, type: 'video/mp4; codecs="avc1.64001F"' },
      ],
      time: timeFormat.format(new Date()),
      year: new Date().getFullYear(),
      strip: [
        { key: "Diego Rosso", value: "Desarrollador web" },
        { key: "San Isidro", value: "Buenos Aires, AR" },
        { key: "Foco", value: "Web · Producto · IA" },
      ],
    };
  },
  mounted() {
    this.clock = setInterval(() => {
      this.time = timeFormat.format(new Date());
    }, 15000);
  },
  beforeUnmount() {
    clearInterval(this.clock);
  },
};
</script>

<style scoped>
.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100svh;
  padding-block-start: var(--header-h);
  overflow: hidden;
}

/* Viñeta para que la grilla de puntos se apague hacia los bordes */
.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 65% 40%,
    transparent 0%,
    color-mix(in srgb, var(--ink) 70%, transparent) 70%,
    var(--ink) 100%
  );
  pointer-events: none;
}

.hero > * {
  position: relative;
}

/* Franja de datos */
.hero-strip {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px 16px;
  padding-block: 14px;
  border-block-end: 1px solid var(--line);
}

.strip-item {
  display: grid;
}

.strip-item:nth-child(3) {
  display: none;
}

.strip-time {
  display: none;
}

/* Bloque principal */
.hero-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 28px;
  padding-block: 32px 24px;
}

.hero-visual {
  position: absolute;
  top: 6%;
  right: -10%;
  width: min(78vw, 560px);
  aspect-ratio: 1 / 1; /* el video del organismo es cuadrado */
  pointer-events: none;
  opacity: 0.55; /* en pantallas chicas queda detrás del título: se baja para que se lea */
}

.hero-copy {
  position: relative;
  display: grid;
  gap: 18px;
}

.hero-eyebrow {
  display: flex;
  align-items: center;
  gap: 0.6em;
}

.pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--paper);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  50% {
    opacity: 0.2;
  }
}

.hero-card {
  position: relative;
  display: grid;
  gap: 18px;
  max-width: 420px;
  padding: 18px;
  border: 1px solid var(--line);
  background-color: color-mix(in srgb, var(--ink) 78%, transparent);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  font-size: var(--fs-small);
  color: var(--muted);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* Nombre gigante al pie */
.hero-wordmark {
  overflow: hidden;
}

.hero-wordmark svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.hero-wordmark text {
  font-family: var(--fontFamily-display);
  font-weight: 800;
  font-size: 200px;
  fill: var(--paper);
}

.hero-foot {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-block: 14px 18px;
}

.scroll-cue {
  display: flex;
  gap: 0.6em;
  color: var(--muted);
}

.scroll-cue span {
  animation: nudge 1.6s ease-in-out infinite;
}

@keyframes nudge {
  50% {
    transform: translateY(3px);
  }
}

@media (min-width: 640px) {
  .hero-strip {
    grid-template-columns: repeat(3, 1fr);
  }

  .strip-item:nth-child(3) {
    display: grid;
  }
}

@media (min-width: 992px) {
  .hero-strip {
    grid-template-columns: repeat(4, 1fr);
  }

  .strip-time {
    display: grid;
    justify-items: end;
  }

  .hero-main {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    padding-block: 48px 32px;
  }

  /* Cuadrada, con el mismo ancho que tenía el recuadro vertical: no pisa más el título */
  .hero-visual {
    top: 22%;
    bottom: -2%;
    right: auto;
    left: 52%;
    width: auto;
    max-width: 38vw;
    transform: translateX(-50%);
    opacity: 1;
  }

  .hero-card {
    margin-block-end: 6px;
  }
}

/* Desde 1440px el organismo va a la derecha, entre el título y la tarjeta (asoma por detrás
   de ella), y crece con el ancho. Su centro queda a 551px del borde derecho y su borde de
   arriba, 25px debajo de la franja. En el video el organismo ocupa del 10 % al 88 % del ancho
   (centro en 0.4915) y empieza al 16 % del alto (0.159). */
@media (min-width: 1440px) {
  .hero-visual {
    --w: min(50vw, 1000px);
    top: calc(25px - var(--w) * 0.159);
    bottom: auto;
    left: calc(100% - 551px - var(--w) * 0.4915);
    width: var(--w);
    max-width: none;
    transform: none;
  }
}
</style>
