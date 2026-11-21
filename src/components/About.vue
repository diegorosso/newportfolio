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
          <p class="lead about-lead" data-reveal>
            Diseño y desarrollo sitios y productos digitales, del primer boceto hasta
            que están online. Cada vez más los conecto con IA: chatbots que atienden
            consultas, automatizaciones que mueven mensajes entre WhatsApp y email y
            tableros que se actualizan solos.
          </p>
          <p class="about-body" data-reveal>
            Mi trabajo combina desarrollo web, diseño de interfaces, inteligencia
            artificial aplicada y automatización de procesos. En el día a día
            desarrollo con Vue, JavaScript y Node.js, guardo datos en Firebase y
            MongoDB, y uso WordPress cuando el proyecto pide un gestor de
            contenidos. Para el diseño trabajo en Figma, Photoshop y After Effects.
          </p>
          <p class="about-body" data-reveal>
            Me interesan especialmente los asistentes con IA, la automatización con
            n8n, Make y Zapier, y los productos que conectan canales como WhatsApp y
            email. De ahí salieron proyectos propios como Cauce, Sukata y Pulso,
            además de sitios para marcas como Avifauna, FPB Solar y Village Polo Club.
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
            <a href="/diegoCv.pdf" target="_blank" rel="noopener noreferrer" class="btn">
              Ver CV <span class="arrow" aria-hidden="true">→</span>
            </a>
            <a href="/diegoCv.pdf" download class="btn btn--ghost">
              Descargar CV
              <span class="btn-meta">PDF <span class="arrow" aria-hidden="true">↓</span></span>
            </a>
          </div>
        </aside>
      </div>

      <Skills />

      <Experience />
    </div>
  </section>
</template>

<script setup>
import SectionHead from "./SectionHead.vue";
import Skills from "./Skills.vue";
import Experience from "./Experience.vue";

// Como la ficha de la referencia: datos de contexto, no de contacto
// (teléfono y redes siguen en Contacto y en el pie)
const profile = [
  { key: "Base", value: "San Isidro, AR" },
  { key: "Rol", value: "Desarrollador web y diseñador" },
  { key: "Foco", value: "Web · IA · Automatización" },
  {
    key: "Email",
    value: "diegorosso1988@gmail.com",
    href: "mailto:diegorosso1988@gmail.com",
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
}

/* Texto principal grande, como en la referencia: tres o cuatro líneas a lo ancho */
.about-lead {
  font-size: clamp(2.6rem, 1.4rem + 1.9vw, 4.6rem);
  line-height: 1.08;
  margin-block-end: 12px;
}

/* Mismo ancho que el texto principal, como en la referencia */
.about-body {
  color: var(--muted);
  line-height: 1.65;
}

/* Ficha de perfil con cruces en dos esquinas, como en la referencia */
.profile {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px;
  border: 1px solid var(--line);
}

.profile::before,
.profile::after {
  content: "+";
  position: absolute;
  font-family: var(--fontFamily-mono);
  font-size: 1.2rem;
  line-height: 1;
  color: var(--faint);
}

.profile::before {
  top: -7px;
  left: -4px;
}

.profile::after {
  bottom: -7px;
  right: -4px;
}

.profile-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-block: 11px;
  border-block-end: 1px solid var(--line);
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

/* Dos botones del mismo ancho, con el texto a la izquierda y el ícono a la derecha */
.profile-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-block-start: auto; /* los botones quedan pegados al fondo de la ficha */
  padding-block-start: 6px;
}

.profile-actions .btn {
  justify-content: space-between;
  max-width: none;
}

.btn-meta {
  display: flex;
  gap: 0.8em;
  color: var(--faint);
}

/* En pantallas chicas los dos botones no entran lado a lado */
@media (max-width: 479px) {
  .profile-actions {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 992px) {
  .about-grid {
    grid-template-columns: 1.4fr 1fr;
    gap: 80px;
  }

}

@media (min-width: 1400px) {
  /* Proporción de la referencia: texto ancho a la izquierda, ficha angosta a la derecha */
  .about-grid {
    grid-template-columns: minmax(0, 1.8fr) minmax(360px, 1fr);
    gap: 120px;
  }
}
</style>
