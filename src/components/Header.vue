<template>
  <header class="header" :class="{ open: isNavActive }">
    <div class="header-bar wrap">
      <a href="#home" class="brand label" @click="closeNav">
        Diego<span class="label-dim">.</span>Rosso
      </a>

      <!-- Como en la referencia: dos links, el logo al centro y dos links -->
      <nav class="nav-desktop" aria-label="Principal">
        <ul class="nav-list">
          <li v-for="link in leftLinks" :key="link.href">
            <a :href="link.href" class="nav-link label" :download="link.download || null">
              <span class="label-dim">{{ link.number }}</span>
              {{ link.label }}
            </a>
          </li>
        </ul>
        <a href="#home" class="logo-mark" aria-label="Inicio">DR</a>
        <ul class="nav-list">
          <li v-for="link in rightLinks" :key="link.href">
            <a :href="link.href" class="nav-link label" :download="link.download || null">
              <span class="label-dim">{{ link.number }}</span>
              {{ link.label }}
              <span v-if="link.download" aria-hidden="true">↓</span>
            </a>
          </li>
        </ul>
      </nav>

      <div class="header-actions">
        <Mode />
        <a href="/diegoRosso.pdf" download="diegoRosso.pdf" class="btn btn--ghost cv-btn">
          CV <span class="arrow" aria-hidden="true">↓</span>
        </a>
        <button
          class="menu-btn label"
          :aria-expanded="isNavActive"
          aria-controls="mobile-menu"
          @click="toggleNav"
        >
          {{ isNavActive ? "Cerrar" : "Menú" }}
        </button>
      </div>
    </div>

    <div id="mobile-menu" class="mobile-menu wrap" :class="{ active: isNavActive }">
      <ul>
        <li v-for="link in sectionLinks" :key="link.href">
          <a :href="link.href" class="mobile-link" @click="closeNav">
            <span class="label label-dim">{{ link.number }}</span>
            <span class="display">{{ link.label }}</span>
          </a>
        </li>
      </ul>
      <a href="/diegoRosso.pdf" download="diegoRosso.pdf" class="btn" @click="closeNav">
        Descargar CV <span class="arrow" aria-hidden="true">↓</span>
      </a>
    </div>
  </header>
</template>

<script>
import Mode from "./Mode.vue";

export default {
  name: "HeaderComponent",
  components: { Mode },
  data() {
    return {
      isNavActive: false,
      leftLinks: [
        { number: "01", label: "Sobre mí", href: "#about" },
        { number: "02", label: "Proyectos", href: "#project" },
      ],
      rightLinks: [
        { number: "03", label: "Contacto", href: "#contact" },
        { number: "04", label: "CV", href: "/diegoRosso.pdf", download: "diegoRosso.pdf" },
      ],
    };
  },
  computed: {
    /** En el menú del celular van solo las secciones; el CV tiene su propio botón */
    sectionLinks() {
      return [...this.leftLinks, ...this.rightLinks].filter((link) => !link.download);
    },
  },
  methods: {
    toggleNav() {
      this.isNavActive = !this.isNavActive;
      document.body.classList.toggle("nav-active", this.isNavActive);
    },
    closeNav() {
      this.isNavActive = false;
      document.body.classList.remove("nav-active");
    },
    onKey(event) {
      if (event.key === "Escape" && this.isNavActive) this.closeNav();
    },
  },
  mounted() {
    window.addEventListener("keydown", this.onKey);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.onKey);
  },
};
</script>

<style scoped>
.header {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 40;
}

/* Translúcido y desenfocado: el campo del hero se ve tenue por detrás */
.header-bar {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 16px;
  height: var(--header-h);
  border-block-end: 1px solid var(--line);
  background-color: color-mix(in srgb, var(--ink) 85%, transparent);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

.brand {
  display: flex;
  justify-self: start;
  color: var(--paper);
}

.nav-desktop {
  display: none;
}

.nav-list {
  display: flex;
  gap: 36px;
}

.nav-link {
  position: relative;
  display: flex;
  gap: 0.6em;
  color: var(--muted);
  transition: color var(--transition-1);
}

.nav-link::after {
  content: "";
  position: absolute;
  inset: auto 0 -6px 0;
  height: 1px;
  background-color: var(--paper);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition-1);
}

.nav-link:is(:hover, :focus-visible) {
  color: var(--paper);
}

.nav-link:is(:hover, :focus-visible)::after {
  transform: scaleX(1);
}

/* Logo: iniciales en la display, dentro de un recuadro fino */
.logo-mark {
  padding: 4px 6px 2px;
  border: 1px solid color-mix(in srgb, var(--paper) 70%, transparent);
  color: var(--paper);
  font-family: var(--fontFamily-display);
  font-size: 1.8rem;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  transition: background-color var(--transition-1), color var(--transition-1);
}

.logo-mark:is(:hover, :focus-visible) {
  background-color: var(--paper);
  color: var(--ink);
}

.header-actions {
  display: flex;
  align-items: center;
  justify-self: end;
  gap: 10px;
}

.cv-btn {
  display: none;
  height: 32px;
  padding-inline: 12px;
}

.menu-btn {
  height: 32px;
  padding-inline: 12px;
  border: 1px solid var(--line-strong);
  color: var(--paper);
}

.mobile-menu {
  position: fixed;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-block: calc(var(--header-h) + 32px) 32px;
  background-color: var(--ink);
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.35s var(--ease-out), visibility 0.35s;
}

.mobile-menu.active {
  visibility: visible;
  opacity: 1;
}

.mobile-link {
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding-block: 14px;
  border-block-end: 1px solid var(--line);
}

.mobile-link .display {
  font-size: clamp(5.6rem, 16vw, 9.6rem);
}

@media (min-width: 640px) {
  .cv-btn {
    display: inline-flex;
  }
}

@media (min-width: 992px) {
  .header-bar {
    grid-template-columns: 1fr auto 1fr;
  }

  .nav-desktop {
    display: flex;
    align-items: center;
    gap: 40px;
  }

  /* En desktop el CV está en el menú (04) */
  .cv-btn,
  .menu-btn,
  .mobile-menu {
    display: none;
  }
}
</style>
