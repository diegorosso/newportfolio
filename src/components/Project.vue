<template>
  <section class="section project" aria-label="Proyectos" id="project">
    <div class="wrap project-split">
      <!-- Izquierda (fija en pantallas anchas): título y descripción -->
      <div class="project-intro">
        <SectionHead :index="2" :total="3" label="Trabajo" title="Proyectos seleccionados" />
        <p class="project-lede muted">
          Algunos proyectos con los que trabajé recientemente: productos con IA,
          tableros de datos y sitios web, de punta a punta.
        </p>
        <p v-if="projects.length > 1" class="label project-hint" aria-hidden="true">
          Deslizá <span class="arrow">→</span>
        </p>
      </div>

      <!-- Derecha: tarjetas grandes que se recorren en horizontal -->
      <div class="project-stage">
        <div class="project-bar" aria-hidden="true">
          <span class="label"><span>{{ pad(current + 1) }}</span> <span class="label-dim">/ {{ pad(projects.length) }}</span></span>
          <span class="label label-dim">Trabajo profesional · 2026</span>
        </div>

        <ul ref="rail" class="project-rail" @scroll.passive="onRailScroll">
          <li v-for="(project, index) in projects" :key="project.link" class="project-card" data-reveal>
            <a
              :href="project.link"
              target="_blank"
              rel="noopener noreferrer"
              class="card-link"
              data-cursor="Ver"
            >
              <div class="card-media">
                <video
                  v-if="project.video"
                  ref="videos"
                  :src="project.video"
                  :poster="project.image"
                  width="1280"
                  height="720"
                  muted
                  loop
                  playsinline
                  preload="none"
                  aria-hidden="true"
                ></video>
                <!-- Como en la referencia: en reposo la imagen se ve en trama de puntos
                     y al pasar el mouse queda nítida, a color -->
                <template v-else>
                  <img
                    :src="project.image"
                    width="1600"
                    height="800"
                    loading="lazy"
                    :alt="`Captura de ${project.name}`"
                    class="media-layer media-layer--dots"
                  />
                  <img
                    :src="project.image"
                    width="1600"
                    height="800"
                    loading="lazy"
                    alt=""
                    aria-hidden="true"
                    class="media-layer media-layer--clean"
                  />
                </template>
              </div>

              <div class="card-info">
                <h3 class="h3 card-title">{{ project.name }}</h3>
                <div class="card-side">
                  <p class="card-text muted">{{ project.description }}</p>
                  <ul class="card-tags">
                    <li v-for="tag in project.tags" :key="tag" class="chip">{{ tag }}</li>
                  </ul>
                  <span class="btn card-cta">
                    {{ project.cta || "Ver proyecto" }} <span class="arrow" aria-hidden="true">↗</span>
                  </span>
                </div>
              </div>
              <span class="sr-only">{{ pad(index + 1) }} de {{ pad(projects.length) }}</span>
            </a>
          </li>
        </ul>

        <div v-if="projects.length > 1" class="project-nav">
          <button type="button" class="btn btn--ghost" aria-label="Proyecto anterior" @click="step(-1)">←</button>
          <button type="button" class="btn btn--ghost" aria-label="Proyecto siguiente" @click="step(1)">→</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionHead from "./SectionHead.vue";
import ngen from "../assets/images/ngen.webp";

gsap.registerPlugin(ScrollTrigger);

export default {
  components: { SectionHead },
  data() {
    return {
      current: 0,
      projects: [
        {
          image: ngen,
          name: "NGEN – Sitio para una obra inmersiva en Unreal Engine",
          description:
            "Diseño y desarrollo del sitio de NGEN – Ciclos de un bosque imaginario, una obra audiovisual en cuatro actos: video del bosque hecho en Unreal, versión en español e inglés y un panel para sumarse.",
          tags: ["React", "TypeScript", "Tailwind"],
          link: "https://ngen.ar/",
          cta: "Ver sitio",
        },
      ],
    };
  },
  mounted() {
    // Pantallas anchas, como en la referencia: la sección queda fija mientras se scrollea.
    // Primero el scroll recorre las tarjetas en horizontal; después queda quieta un tramo
    // corto (con un solo proyecto, es solo ese tramo) y la página sigue.
    this.media = gsap.matchMedia();
    this.media.add("(min-width: 1100px) and (prefers-reduced-motion: no-preference)", () => {
      const rail = this.$refs.rail;
      const travel = () => Math.max(0, rail.scrollWidth - rail.clientWidth);
      const hold = () => window.innerHeight * 0.5;
      ScrollTrigger.create({
        trigger: this.$el,
        start: "top top",
        end: () => `+=${travel() + hold()}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          rail.scrollLeft = Math.min(travel(), self.progress * (travel() + hold()));
        },
      });
      return () => {
        rail.scrollLeft = 0;
      };
    });

    // Los videos de las tarjetas corren solo mientras se ven, y nunca con
    // "reducir movimiento": en ese caso queda el póster.
    const videos = this.$refs.videos ?? [];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!videos.length || reduceMotion || !("IntersectionObserver" in window)) return;

    this.videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (isIntersecting) {
            target.muted = true;
            target.play().catch(() => {});
          } else {
            target.pause();
          }
        });
      },
      { threshold: 0.25 }
    );
    videos.forEach((video) => this.videoObserver.observe(video));
  },
  beforeUnmount() {
    this.media?.revert();
    this.videoObserver?.disconnect();
  },
  methods: {
    pad(n) {
      return String(n).padStart(2, "0");
    },
    /** Tarjeta que está más a la izquierda de la fila: alimenta el contador "01 / 15" */
    onRailScroll() {
      const rail = this.$refs.rail;
      const card = rail?.querySelector(".project-card");
      if (!card) return;
      const stride = card.offsetWidth + parseFloat(getComputedStyle(rail).columnGap || 0);
      this.current = Math.min(this.projects.length - 1, Math.max(0, Math.round(rail.scrollLeft / stride)));
    },
    step(direction) {
      const rail = this.$refs.rail;
      const card = rail?.querySelector(".project-card");
      if (!card) return;
      const stride = card.offsetWidth + parseFloat(getComputedStyle(rail).columnGap || 0);
      rail.scrollBy({ left: direction * stride, behavior: "smooth" });
    },
  },
};
</script>

<style scoped>
/* Celulares y tablets: una columna y las tarjetas una debajo de otra */
.project-intro {
  margin-block-end: 8px;
}

.project-lede {
  max-width: 46ch;
  margin-block-start: -24px;
}

.project-hint,
.project-bar,
.project-nav {
  display: none;
}

.project-rail {
  display: grid;
  gap: 56px 24px;
}

.card-link {
  display: grid;
  gap: 18px;
}

/* Apaisada como la de la referencia */
.card-media {
  position: relative;
  aspect-ratio: 2 / 1;
  overflow: hidden;
  border: 1px solid var(--line);
  background-color: var(--surface);
}

.card-media video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.9s var(--ease-out);
}

/* Dos copias superpuestas de la imagen: una en trama de puntos y otra nítida */
.media-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.5s ease, transform 0.9s var(--ease-out);
}

/* En reposo: gris y vista a través de una trama de puntos, como en la referencia */
.media-layer--dots {
  filter: grayscale(1) contrast(1.25) brightness(1.15);
  -webkit-mask-image: radial-gradient(circle, #000 1.1px, transparent 1.5px);
  mask-image: radial-gradient(circle, #000 1.1px, transparent 1.5px);
  -webkit-mask-size: 4px 4px;
  mask-size: 4px 4px;
}

.media-layer--clean {
  opacity: 0;
}

.card-link:is(:hover, :focus-visible) .media-layer--clean {
  opacity: 1;
}

.card-link:is(:hover, :focus-visible) .media-layer--dots {
  opacity: 0;
}

.card-link:is(:hover, :focus-visible) .card-media :is(.media-layer, video) {
  transform: scale(1.03);
}

/* En pantallas táctiles no hay hover: se muestra nítida */
@media (hover: none) {
  .media-layer--clean {
    opacity: 1;
  }

  .media-layer--dots {
    opacity: 0;
  }
}

/* El reset global vuelve bloque a los span: el contador va en una sola línea */
.project-bar .label {
  display: flex;
  gap: 0.5em;
}

.card-info {
  display: grid;
  gap: 16px;
}

.card-side {
  display: grid;
  gap: 16px;
  justify-items: start;
}

.card-title {
  text-wrap: balance;
}

.card-text {
  max-width: 48ch;
  font-size: var(--fs-small);
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

@media (min-width: 768px) {
  .project-rail {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Pantallas anchas: como la referencia. Título fijo a la izquierda y una fila de
   tarjetas grandes a la derecha que se desliza con el mouse, el trackpad o los botones */
@media (min-width: 1100px) {
  /* Como en la referencia: la sección ocupa justo la pantalla y queda fija mientras se
     scrollea (la fija ScrollTrigger); el scroll vertical recorre las tarjetas en horizontal */
  .project {
    height: 100svh;
    padding-block: calc(var(--header-h) + 28px) 36px;
  }

  .project-split {
    display: grid;
    grid-template-columns: minmax(300px, 0.8fr) minmax(0, 2fr);
    gap: 48px;
    height: 100%;
  }

  /* La columna es angosta: el título se achica para que "Seleccionados" no se parta */
  .project-intro :deep(.h2) {
    font-size: clamp(4.4rem, 0.4rem + 4.2vw, 8rem);
  }

  .project-intro {
    display: flex;
    flex-direction: column;
    min-height: 0;
    margin-block-end: 0;
  }

  .project-lede {
    margin-block-start: auto;
  }

  .project-hint {
    display: flex;
    gap: 0.6em;
    margin-block-start: 28px;
    color: var(--muted);
  }

  .project-bar {
    display: flex;
    justify-content: space-between;
    padding-block-end: 16px;
  }

  .project-stage {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    padding-inline-start: 48px;
    border-inline-start: 1px solid var(--line);
  }

  /* El desplazamiento horizontal lo maneja el scroll de la página (ver mounted) */
  .project-rail {
    flex: 1;
    min-height: 0;
    display: flex;
    gap: 32px;
    overflow: hidden;
  }

  .project-card {
    flex: 0 0 92%;
    min-height: 0;
  }

  .project-card:only-child {
    flex-basis: 100%;
  }

  /* La tarjeta llena el alto disponible: la imagen se estira y el texto queda abajo */
  .card-link {
    height: 100%;
    grid-template-rows: minmax(0, 1fr) auto;
  }

  .card-media {
    aspect-ratio: auto;
    min-height: 0;
  }

  .card-info {
    grid-template-columns: 1.1fr 1fr;
    gap: 32px;
    align-items: start;
  }

  .card-title {
    font-size: clamp(3.6rem, 2rem + 2.2vw, 6.4rem);
  }

  .project-nav {
    display: flex;
    gap: 8px;
    margin-block-start: 24px;
  }
}
</style>
