<template>
  <section class="section project" aria-label="Proyectos" id="project">
    <div class="wrap">
      <SectionHead :index="2" :total="3" label="Trabajo" title="Proyectos seleccionados">
        Algunos proyectos con los que trabajé recientemente: productos con IA,
        tableros de datos y sitios web, de punta a punta.
      </SectionHead>

      <ul class="project-grid">
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
              <img
                v-else
                :src="project.image"
                width="1000"
                height="763"
                loading="lazy"
                :alt="`Captura de ${project.name}`"
              />
            </div>

            <div class="card-meta">
              <span class="label label-dim">
                {{ pad(index + 1) }} / {{ pad(projects.length) }}
              </span>
              <ul class="card-tags">
                <li v-for="tag in project.tags" :key="tag" class="chip">{{ tag }}</li>
              </ul>
            </div>

            <h3 class="h3 card-title">{{ project.name }}</h3>
            <p class="card-text muted">{{ project.description }}</p>

            <span class="label card-cta">
              {{ project.cta || "Visitar sitio" }} <span class="arrow" aria-hidden="true">↗</span>
            </span>
          </a>
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
import SectionHead from "./SectionHead.vue";
import aviImg from "../assets/images/avifauna.webp";
import neuremify from "../assets/images/neuremi.webp";
import fbp from "../assets/images/fpb.webp";
import santa from "../assets/images/santa.webp";
import olimpiadas from "../assets/images/olimpiadas.webp";
import globali from "../assets/images/globali.webp";
import peregrinaciones from "../assets/images/peregrinaciones.webp";
import insan from "../assets/images/insan.webp";
import blocki from "../assets/images/blocki.webp";
import jdtex from "../assets/images/jdtex.webp";
import Village from "../assets/images/Village.png";
import cauce from "../assets/images/cauce.png";
import pulso from "../assets/images/pulso.png";
import sukata from "../assets/images/sukata.png";
import organismoPoster from "../assets/images/organismo.webp";
import organismoVideo from "../assets/videos/organismo-loop.mp4"; // loop liviano para la tarjeta
import organismoFull from "../assets/videos/organismo-1080p.mp4"; // render completo, solo al hacer clic

export default {
  components: { SectionHead },
  data() {
    return {
      projects: [
        {
          image: organismoPoster,
          video: organismoVideo,
          name: "Organismo",
          description:
            "Pieza generativa en Unreal Engine 5: una masa de partículas Niagara que respira, con dithering Bayer 8×8 en post-proceso.",
          tags: ["Unreal Engine", "Niagara", "Shader"],
          link: organismoFull,
          cta: "Ver video",
        },
        {
          image: cauce,
          name: "Cauce",
          description:
            "Panel de automatización de comunicación (WhatsApp + Email en tiempo real).",
          tags: ["Producto", "Automatización", "IA"],
          link: "https://comunication-flow.netlify.app/",
        },
        {
          image: sukata,
          name: "Sukata BJJ",
          description:
            "Web de academia de Jiu Jitsu con chatbot de IA (Groq + Llama 3.1) integrado vía funciones serverless.",
          tags: ["Web", "Producto", "IA"],
          link: "https://sukata.netlify.app/",
        },
        {
          image: pulso,
          name: "Pulso",
          description:
            "Tablero de métricas con datos en vivo de la API pública de GitHub.",
          tags: ["Producto", "Dashboard", "IA"],
          link: "https://pulso-dash.netlify.app/",
        },
        {
          image: aviImg,
          name: "Avifauna",
          description: "El parque ornitológico más grande de España.",
          tags: ["Web"],
          link: "https://avifauna.net",
        },
        {
          image: neuremify,
          name: "Neuromify",
          description: "Aplicación para reducir el estrés y la ansiedad.",
          tags: ["Aplicación"],
          link: "https://www.neuromify.com",
        },
        {
          image: fbp,
          name: "FPB Solar",
          description: "Instalaciones fotovoltaicas y energía solar.",
          tags: ["Web", "Producto"],
          link: "https://www.fpbsolar.com/",
        },
        {
          image: santa,
          name: "Fundación La Santa Faz",
          description: "Fundación artística, cultural y religiosa.",
          tags: ["Web", "WordPress"],
          link: "https://santafaz.org.ar/",
        },
        {
          image: olimpiadas,
          name: "Olimpiadas Rurais",
          description: "Web para la organización de eventos deportivos.",
          tags: ["Web"],
          link: "https://lavender-chimpanzee-223227.hostingersite.com/",
        },
        {
          image: globali,
          name: "Global MKT",
          description: "Web de marketing y publicidad.",
          tags: ["Web"],
          link: "https://globalmkt.com.ar",
        },
        {
          image: peregrinaciones,
          name: "Peregrinaciones Marianas",
          description: "Web de peregrinaciones religiosas.",
          tags: ["Web"],
          link: "https://peregrinacionesmarianas.com.ar/",
        },
        {
          image: insan,
          name: "Distribuidora Insa",
          description: "Web de distribuidora y ferretería.",
          tags: ["Web"],
          link: "https://distribuidorainsa.com.ar/",
        },
        {
          image: blocki,
          name: "Blockinar",
          description: "Web tecnológica.",
          tags: ["Web"],
          link: "https://blockinar.com/",
        },
        {
          image: jdtex,
          name: "Jdtex",
          description: "Fábrica de textiles y confección.",
          tags: ["Web"],
          link: "https://jdtexarg.com.ar/",
        },
        {
          image: Village,
          name: "Village Polo Club",
          description: "Web de ropa deportiva.",
          tags: ["Web", "WordPress"],
          link: "https://villagepoloclub.com.ar/",
        },
      ],
    };
  },
  mounted() {
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
    this.videoObserver?.disconnect();
  },
  methods: {
    pad(n) {
      return String(n).padStart(2, "0");
    },
  },
};
</script>

<style scoped>
.project-grid {
  display: grid;
  gap: 56px 24px;
}

.card-link {
  display: grid;
  gap: 14px;
}

.card-media {
  position: relative;
  aspect-ratio: 1000 / 763;
  overflow: hidden;
  border: 1px solid var(--line);
  background-color: var(--surface);
}

.card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(1) contrast(1.05);
  transition: filter 0.5s ease, transform 0.9s var(--ease-out);
}

.card-link:is(:hover, :focus-visible) .card-media img {
  filter: none;
  transform: scale(1.03);
}

.card-media video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.9s var(--ease-out);
}

.card-link:is(:hover, :focus-visible) .card-media video {
  transform: scale(1.03);
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-block-start: 4px;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.card-title {
  text-wrap: balance;
}

.card-text {
  max-width: 44ch;
  font-size: var(--fs-small);
}

.card-cta {
  display: flex;
  gap: 0.6em;
  color: var(--muted);
  transition: color var(--transition-1);
}

.card-link:is(:hover, :focus-visible) .card-cta {
  color: var(--paper);
}

.card-cta .arrow {
  transition: transform var(--transition-1);
}

.card-link:is(:hover, :focus-visible) .card-cta .arrow {
  transform: translate(2px, -2px);
}

@media (min-width: 768px) {
  .project-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .project-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 72px 32px;
  }
}
</style>
