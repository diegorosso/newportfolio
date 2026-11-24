<template>
  <section class="hero" :class="{ 'dot-grid': !fieldReady }" id="home" aria-label="Presentación">
    <!-- Campo interactivo: la grilla de fondo y el organismo reaccionan al cursor en todo el hero -->
    <div class="hero-field" aria-hidden="true">
      <DitherImage
        :src="heroPoster"
        :video="heroVideo"
        anchor=".hero-visual-inner"
        @ready="fieldReady = true"
      />
    </div>

    <!-- Píldora de contacto, como la de la referencia -->
    <div class="hero-top wrap">
      <a href="#contact" class="hero-pill">
        <span class="pill-mark" aria-hidden="true">DR</span>
        <span class="label pill-text">Web, diseño e IA — ¿Tenés una idea para compartir?</span>
        <span class="label pill-cta">
          Escribime <span class="arrow" aria-hidden="true">→</span>
        </span>
      </a>
    </div>

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
      <!-- Marca dónde va el organismo dentro del campo (y lo mueve el parallax).
           Mientras el campo carga, o si no hay WebGL, muestra el póster en semitono -->
      <div class="hero-visual" aria-hidden="true">
        <div class="hero-visual-inner" data-parallax>
          <img v-if="!fieldReady" :src="heroPoster" alt="" class="hero-fallback halftone" />
        </div>
      </div>

      <div class="hero-copy">
        <p class="label hero-eyebrow">
          <span class="pulse" aria-hidden="true"></span>
          <span class="label-dim">[ 00 ]</span> · Diseño + desarrollo
        </p>
        <!-- Como en la referencia: la línea del medio va solo con contorno, y cada letra
             engorda cuando el cursor se acerca -->
        <h1 ref="title" class="display h1 hero-title" data-split>
          Desarrollo web,<br /><span class="title-outline">diseño e</span><br />IA aplicada
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
import { followWeight } from "../weightFollow.js";
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
      fieldReady: false,
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

    // Las letras del título son las que arma SplitText (divs sin hijos); se buscan en cada
    // actualización porque SplitText las vuelve a generar si cambia el ancho
    this.stopWeight = followWeight(
      () =>
        this.$refs.title
          ? [...this.$refs.title.querySelectorAll("div")].filter((el) => !el.children.length)
          : [],
      { min: 250, max: 800, radius: 280 }
    );
  },
  beforeUnmount() {
    clearInterval(this.clock);
    this.stopWeight?.();
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

/* El campo WebGL va detrás de todo el contenido del hero y no captura el mouse:
   el cursor se lee desde la ventana */
.hero > .hero-field {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* Píldora de contacto: centrada bajo el header, translúcida como en la referencia.
   En celulares y en pantallas anchas pero bajas se oculta para dejarle lugar al título */
.hero-top {
  display: none;
  justify-content: center;
  padding-block-start: 20px;
}

.hero-pill {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 672px;
  height: 36px;
  padding-inline: 6px 12px;
  border: 1px solid var(--line);
  background-color: color-mix(in srgb, var(--ink) 70%, transparent);
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  transition: border-color var(--transition-1);
}

.hero-pill:is(:hover, :focus-visible) {
  border-color: var(--line-strong);
}

.pill-mark {
  padding: 3px 4px 1px;
  border: 1px solid color-mix(in srgb, var(--paper) 70%, transparent);
  font-family: var(--fontFamily-display);
  font-size: 1.3rem;
  font-weight: 600;
  line-height: 1;
}

.pill-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: var(--paper);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.pill-cta {
  display: flex;
  gap: 0.6em;
  color: var(--muted);
  font-size: 1rem;
  transition: color var(--transition-1);
}

.pill-cta .arrow {
  transition: transform var(--transition-1);
}

.hero-pill:is(:hover, :focus-visible) .pill-cta {
  color: var(--paper);
}

.hero-pill:is(:hover, :focus-visible) .pill-cta .arrow {
  transform: translateX(3px);
}

/* Franja de datos: banda a todo el ancho que oscurece sin tapar: el organismo y la
   grilla se siguen viendo detrás, con los puntos nítidos (sin desenfoque) */
.hero-strip {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px 16px;
  padding-block: 14px;
  border-block-end: 1px solid var(--line);
  background-color: color-mix(in srgb, var(--ink) 55%, transparent);
}

@media (min-width: 768px) {
  .hero-top {
    display: flex;
  }

  .hero-strip {
    margin-block-start: 24px;
    border-block-start: 1px solid var(--line);
  }
}

@media (min-width: 1024px) and (max-height: 820px) {
  .hero-top {
    display: none;
  }
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
  /* En pantallas chicas queda detrás del título: se baja para que se lea.
     --org-alpha lo lee el shader; opacity, el respaldo */
  --org-alpha: 0.55;
  opacity: 0.55;
}

.hero-visual-inner {
  width: 100%;
  height: 100%;
}

.hero-fallback {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
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

/* Título: fino en reposo (250, como la referencia); el grosor de cada letra lo cambia
   el cursor y la transición lo suaviza */
.hero-title {
  font-weight: 250;
}

/* Las máscaras de línea de SplitText recortan en vertical (para la animación de entrada)
   pero no a los costados: una letra que engorda no se corta */
.hero-title > :deep(div) {
  overflow-x: visible !important;
  overflow-y: clip !important;
}

/* Línea del medio solo con contorno, como "INTELLIGENCE" en la referencia */
.title-outline {
  color: color-mix(in srgb, var(--ink) 55%, transparent);
  -webkit-text-stroke: 1.5px var(--paper);
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
    max-height: 38vw; /* siempre cuadrada: si no, el encuadre recorta los costados del video */
    transform: translateX(-50%);
    --org-alpha: 1;
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
    /* Arranca a la altura de la banda de datos: asoma detrás de ella, como en la referencia */
    top: calc(-60px - var(--w) * 0.159);
    bottom: auto;
    left: calc(100% - 551px - var(--w) * 0.4915);
    width: var(--w);
    max-width: none;
    max-height: none;
    transform: none;
  }
}
</style>
