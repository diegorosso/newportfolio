<template>
  <div class="skills" aria-labelledby="skills-title">
    <header class="skills-head">
      <h3 id="skills-title" class="display skills-title" data-split>Tecnologías</h3>
      <p class="label label-dim">Stack · {{ total }}</p>
    </header>

    <div class="skills-grid">
      <article v-for="(group, index) in groups" :key="group.title" class="skills-cell" data-reveal>
        <header class="cell-head">
          <h4 class="label">{{ group.title }}</h4>
          <span class="label label-dim">{{ String(index + 1).padStart(2, "0") }}</span>
        </header>
        <ul class="chips">
          <li v-for="item in group.items" :key="item" class="chip">{{ item }}</li>
        </ul>
      </article>
    </div>

    <p class="label label-dim areas-label">Áreas de trabajo</p>
    <ul class="areas">
      <li v-for="area in areas" :key="area" class="area">
        {{ area }}<span class="area-slash" aria-hidden="true">/</span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "SkillsBlock",
  data() {
    return {
      groups: [
        {
          title: "Desarrollo",
          items: [
            "HTML", "CSS", "JavaScript", "Vue.js", "Vite", "Vuetify", "Angular", "Sass",
            "Bootstrap", "GSAP", "Lenis", "WordPress", "Responsive", "SEO",
          ],
        },
        {
          title: "Backend y publicación",
          items: [
            "Node.js", "Firebase", "MongoDB", "Netlify Functions", "REST API",
            "Git", "GitHub", "GitHub Actions", "Netlify", "Hostinger",
          ],
        },
        {
          title: "IA",
          items: ["Claude", "Claude Code", "Groq", "Llama 3.1", "Chatbots", "Prompt engineering"],
        },
        {
          title: "Automatización",
          items: ["n8n", "Make", "Zapier", "WhatsApp", "Email", "Webhooks"],
        },
        {
          title: "3D y tiempo real",
          items: [
            "Unreal Engine", "Niagara", "Blueprints", "TouchDesigner", "WebGL", "GLSL",
            "Processing", "Shaders",
          ],
        },
        {
          title: "Diseño y motion",
          items: [
            "Figma", "Photoshop", "After Effects", "Canva", "Diseño gráfico",
            "Diseño de interfaces", "Motion graphics",
          ],
        },
      ],
      areas: [
        "Desarrollo web",
        "Diseño de interfaces",
        "IA aplicada y chatbots",
        "Automatización de procesos",
        "Productos digitales",
        "Diseño gráfico y motion",
      ],
    };
  },
  computed: {
    total() {
      return new Set(this.groups.flatMap((group) => group.items)).size;
    },
  },
};
</script>

<style scoped>
.skills {
  margin-block-start: 96px;
}

.skills-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px 24px;
  margin-block-end: 40px;
}

.skills-title {
  font-size: var(--fs-h2);
}

/* Celdas separadas por líneas finas, con cruces en las esquinas como en la referencia */
.skills-grid {
  position: relative;
  display: grid;
  gap: 1px;
  background-color: var(--line);
  border: 1px solid var(--line);
}

.skills-grid::before,
.skills-grid::after {
  content: "+";
  position: absolute;
  font-family: var(--fontFamily-mono);
  font-size: 1.2rem;
  line-height: 1;
  color: var(--faint);
}

.skills-grid::before {
  top: -7px;
  left: -4px;
}

.skills-grid::after {
  bottom: -7px;
  right: -4px;
}

.skills-cell {
  display: grid;
  align-content: start;
  gap: 22px;
  padding: 24px;
  background-color: var(--ink);
}

.cell-head {
  display: flex;
  justify-content: space-between;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* Etiquetas con borde, como en la referencia (más grandes que el chip base) */
.skills .chip {
  padding: 5px 10px;
  font-size: 1.1rem;
  color: var(--paper);
  transition: border-color var(--transition-1), background-color var(--transition-1);
}

.skills .chip:hover {
  border-color: var(--paper);
  background-color: var(--surface);
}

.areas-label {
  margin-block: 40px 14px;
}

.areas {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 0;
}

.area {
  font-family: var(--fontFamily-display);
  font-weight: var(--weight-light);
  font-size: clamp(2.4rem, 1.4rem + 1.6vw, 3.6rem);
  line-height: 1.2;
  color: color-mix(in srgb, var(--paper) 85%, transparent);
}

.area-slash {
  display: inline-block;
  padding-inline: 0.55em;
  color: var(--faint);
}

@media (min-width: 768px) {
  .skills-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .skills-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
