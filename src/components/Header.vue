<template>
  <header class="header" :class="{ open: isNavActive }">
    <div class="header-bar wrap">
      <a href="#home" class="brand label" @click="closeNav">
        Diego<span class="label-dim">.</span>Rosso
      </a>

      <nav class="nav-desktop" aria-label="Principal">
        <ul class="nav-list">
          <li v-for="(link, index) in links" :key="link.href">
            <a :href="link.href" class="nav-link label">
              <span class="label-dim">{{ pad(index + 1) }}</span>
              {{ link.label }}
            </a>
          </li>
        </ul>
      </nav>

      <div class="header-actions">
        <Mode />
        <a href="/diegoCv.pdf" download class="btn btn--ghost cv-btn">
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
        <li v-for="(link, index) in links" :key="link.href">
          <a :href="link.href" class="mobile-link" @click="closeNav">
            <span class="label label-dim">{{ pad(index + 1) }}</span>
            <span class="display">{{ link.label }}</span>
          </a>
        </li>
      </ul>
      <a href="/diegoCv.pdf" download class="btn" @click="closeNav">
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
      links: [
        { label: "Sobre mí", href: "#about" },
        { label: "Proyectos", href: "#project" },
        { label: "Contacto", href: "#contact" },
      ],
    };
  },
  methods: {
    pad(n) {
      return String(n).padStart(2, "0");
    },
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

.header-bar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: var(--header-h);
  border-block-end: 1px solid var(--line);
  background-color: color-mix(in srgb, var(--ink) 82%, transparent);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

.brand {
  display: flex;
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

.header-actions {
  display: flex;
  align-items: center;
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
  .nav-desktop {
    display: block;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .menu-btn,
  .mobile-menu {
    display: none;
  }
}
</style>
