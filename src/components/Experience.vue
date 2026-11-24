<template>
  <div class="experience" aria-labelledby="exp-title">
    <header class="exp-head">
      <h3 id="exp-title" class="display exp-title" data-split>Experiencia profesional</h3>
      <p class="label label-dim">Trayectoria</p>
    </header>

    <ol class="exp-list">
      <li v-for="(job, index) in jobs" :key="job.role + job.company" class="exp-row" data-reveal>
        <p class="label exp-date">
          <span>#{{ index + 1 }}</span>
          <span class="label-dim">· {{ job.dates }}</span>
        </p>

        <div class="exp-role">
          <h4 class="exp-role-title">{{ job.role }}</h4>
          <p class="label label-dim">{{ job.company }}</p>
        </div>

        <div class="exp-body">
          <p class="exp-text">{{ job.text }}</p>
          <ul class="chips">
            <li v-for="tag in job.tags" :key="tag" class="chip">{{ tag }}</li>
          </ul>
        </div>
      </li>
    </ol>
  </div>
</template>

<script>
export default {
  name: "ExperienceBlock",
  data() {
    return {
      // Datos de tu CV (public/diegoRosso.pdf)
      jobs: [
        {
          dates: "Jun. 2026 — Actualidad",
          role: "Desarrollador web y de aplicaciones",
          company: "Subterránea Films",
          text:
            "Desarrollo y mantenimiento de las aplicaciones y los sitios web de la productora: nuevas funcionalidades e interfaces responsive, con IA para acelerar el desarrollo, la revisión y la depuración.",
          tags: ["Aplicaciones y sitios web", "Interfaces responsive", "Desarrollo asistido con IA"],
        },
        {
          dates: "Mar. 2025 — May. 2026",
          role: "QA Tester",
          company: "Syntagma Group · cliente Mercedes-Benz",
          text:
            "Diseño y ejecución de casos de prueba manuales en aplicaciones web, reporte de errores y verificación de las correcciones junto al equipo de desarrollo.",
          tags: ["Testing manual", "Casos de prueba", "Reporte de errores", "Trabajo remoto"],
        },
        {
          dates: "Ene. 2024 — Jul. 2025",
          role: "Desarrollador de aplicaciones",
          company: "Neuromify · España",
          text:
            "Componentes interactivos en Angular para una app de reducción del estrés y la ansiedad, con recursos multimedia y seguimiento personalizado, en trabajo conjunto con diseñadores y especialistas en salud mental.",
          tags: ["Angular", "Componentes interactivos", "Recursos multimedia", "Trabajo remoto"],
        },
        {
          dates: "Ene. 2024 — Jul. 2025",
          role: "Desarrollador web",
          company: "Globalmkt · independiente",
          text:
            "Diseño e implementación de sitios a medida para marcas y clientes, optimizados para todos los dispositivos.",
          tags: ["Vue", "Angular", "WordPress", "Sitios a medida"],
        },
        {
          dates: "Nov. 2022 — Oct. 2023",
          role: "Desarrollador front end Jr.",
          company: "BA Managers · proyecto TuSeguro",
          text:
            "Frontend en Vue.js de una web de cotización de seguros online: componentes reutilizables, integración con APIs de cotización en tiempo real y mejoras de rendimiento y experiencia de uso, en un equipo Scrum.",
          tags: ["Vue.js", "Componentes reutilizables", "APIs en tiempo real", "Scrum"],
        },
      ],
    };
  },
};
</script>

<style scoped>
.experience {
  margin-block-start: 96px;
}

.exp-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px 24px;
  padding-block-end: 32px;
}

.exp-title {
  font-size: var(--fs-h2);
  text-wrap: balance;
}

.exp-list {
  border-block-start: 1px solid var(--line);
}

.exp-row {
  display: grid;
  gap: 14px;
  padding-block: 28px;
  border-block-end: 1px solid var(--line);
}

.exp-date {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6em;
}

.exp-role-title {
  font-family: var(--fontFamily-display);
  font-weight: var(--weight-regular);
  font-size: var(--fs-h3);
  line-height: 1;
  margin-block-end: 8px;
  text-wrap: balance;
}

.exp-body {
  display: grid;
  gap: 18px;
  align-content: start;
}

.exp-text {
  color: var(--muted);
  line-height: 1.65;
}

.exp-row .chip {
  padding: 4px 9px;
  font-size: 1.05rem;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (min-width: 992px) {
  .exp-row {
    grid-template-columns: minmax(150px, 0.7fr) minmax(0, 1.4fr) minmax(0, 2fr);
    gap: 32px;
    padding-block: 36px;
  }
}
</style>
