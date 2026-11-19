<template>
  <section class="section about" aria-label="Sobre mí" id="about">
    <div class="wrap">
      <SectionHead
        :index="1"
        :total="3"
        label="Sobre mí"
        title="Creatividad en código y diseño"
      />

      <div class="about-grid">
        <div class="about-text">
          <p class="lead" data-reveal>
            Explorando la intersección entre el desarrollo web y el diseño
            multimedia para crear proyectos innovadores y funcionales.
          </p>
          <p class="muted" data-reveal>
            Desarrollador web con experiencia en interfaces de usuario y diseño.
            Trabajo con Vue, JavaScript, Node.js y Firebase; diseño en Figma y
            Photoshop; y uso IA (Claude, Groq) para prototipar y construir
            productos reales.
          </p>
        </div>

        <aside class="profile" data-reveal>
          <p class="label label-dim profile-title">Perfil</p>
          <dl class="profile-list">
            <div v-for="row in profile" :key="row.key" class="profile-row">
              <dt class="label label-dim">{{ row.key }}</dt>
              <dd class="label">
                <a
                  v-if="row.href"
                  :href="row.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="profile-link"
                  >{{ row.value }}</a
                >
                <template v-else>{{ row.value }}</template>
              </dd>
            </div>
          </dl>
          <div class="profile-actions">
            <a href="/diegoCv.pdf" download class="btn">
              Descargar CV <span class="arrow" aria-hidden="true">↓</span>
            </a>
            <a
              href="https://github.com/diegorosso"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn--ghost"
            >
              GitHub <span class="arrow" aria-hidden="true">↗</span>
            </a>
          </div>
        </aside>
      </div>

      <div class="about-tabs">
        <div class="tab-list" role="tablist" aria-label="Más sobre mí">
          <button
            v-for="(tab, index) in tabs"
            :key="tab.id"
            :id="`tab-${tab.id}`"
            type="button"
            role="tab"
            class="tab-btn label"
            :class="{ active: activeTab === tab.id }"
            :aria-selected="activeTab === tab.id"
            :aria-controls="`panel-${tab.id}`"
            :tabindex="activeTab === tab.id ? 0 : -1"
            @click="activeTab = tab.id"
            @keydown.right.prevent="moveTab(1)"
            @keydown.left.prevent="moveTab(-1)"
          >
            <span class="label-dim">{{ String(index + 1).padStart(2, "0") }}</span>
            {{ tab.label }}
          </button>
        </div>

        <div
          v-for="tab in tabs"
          v-show="activeTab === tab.id"
          :key="tab.id"
          :id="`panel-${tab.id}`"
          role="tabpanel"
          :aria-labelledby="`tab-${tab.id}`"
          class="tab-panel"
        >
          <Skills v-if="tab.id === 'skills'" />
          <Experience v-else-if="tab.id === 'experience'" />
          <Flyers v-else />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, nextTick } from "vue";
import SectionHead from "./SectionHead.vue";
import Skills from "./Skills.vue";
import Experience from "./Experience.vue";
import Flyers from "./flyers.vue";

const tabs = [
  { id: "skills", label: "Tecnologías" },
  { id: "experience", label: "Experiencia" },
  { id: "designs", label: "Diseños" },
];

const activeTab = ref("skills");

const moveTab = async (step) => {
  const index = tabs.findIndex((tab) => tab.id === activeTab.value);
  const next = tabs[(index + step + tabs.length) % tabs.length];
  activeTab.value = next.id;
  await nextTick();
  document.getElementById(`tab-${next.id}`)?.focus();
};

const profile = [
  { key: "Nombre", value: "Diego Rosso" },
  { key: "Base", value: "San Isidro, AR" },
  { key: "Rol", value: "Desarrollador web" },
  { key: "Teléfono", value: "11 3145 3388", href: "https://wa.me/541131453388" },
  {
    key: "Email",
    value: "diegorosso1988@gmail.com",
    href: "mailto:diegorosso1988@gmail.com",
  },
  {
    key: "LinkedIn",
    value: "in/diegorosso1988",
    href: "https://www.linkedin.com/in/diegorosso1988/",
  },
];
</script>

<style scoped>
.about-grid {
  display: grid;
  gap: 48px;
}

.about-text {
  display: grid;
  gap: 24px;
  align-content: start;
  max-width: 62ch;
}

.profile {
  display: grid;
  gap: 18px;
  align-content: start;
  padding: 20px;
  border: 1px solid var(--line);
}

.profile-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-block: 10px;
  border-block-start: 1px solid var(--line);
}

.profile-row dd {
  text-align: right;
  overflow-wrap: anywhere;
}

.profile-link {
  display: inline;
  background-image: linear-gradient(var(--paper), var(--paper));
  background-repeat: no-repeat;
  background-position: left bottom;
  background-size: 0 1px;
  transition: background-size var(--transition-1);
}

.profile-link:is(:hover, :focus-visible) {
  background-size: 100% 1px;
}

.profile-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* Pestañas */
.about-tabs {
  margin-block-start: 96px;
}

.tab-list {
  display: flex;
  border-block-end: 1px solid var(--line);
  overflow-x: auto;
}

.tab-btn {
  position: relative;
  display: flex;
  gap: 0.6em;
  flex-shrink: 0;
  padding: 14px 18px 14px 0;
  margin-inline-end: 18px;
  color: var(--muted);
  transition: color var(--transition-1);
}

.tab-btn::after {
  content: "";
  position: absolute;
  inset: auto 0 -1px 0;
  height: 1px;
  background-color: var(--paper);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s var(--ease-out);
}

.tab-btn:is(:hover, :focus-visible) {
  color: var(--paper);
}

.tab-btn.active {
  color: var(--paper);
}

.tab-btn.active::after {
  transform: scaleX(1);
}

.tab-panel {
  padding-block-start: 32px;
  animation: fade 0.5s var(--ease-out);
}

@keyframes fade {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

@media (min-width: 992px) {
  .about-grid {
    grid-template-columns: 1.4fr 1fr;
    gap: 80px;
  }

  .about-tabs {
    margin-block-start: 140px;
  }
}

@media (min-width: 1400px) {
  .about-grid {
    grid-template-columns: 1.6fr 1fr;
  }
}
</style>
