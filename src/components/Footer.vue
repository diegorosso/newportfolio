<template>
  <footer class="footer">
    <!-- Líneas al estilo "Unknown Pleasures" con el nombre -->
    <FooterRidges />

    <div class="footer-bar wrap">
      <p class="label">© {{ year }} Diego Rosso</p>
      <ul class="footer-links">
        <li>
          <a
            href="https://www.linkedin.com/in/diegorosso1988/"
            target="_blank"
            rel="noopener noreferrer"
            class="label footer-link"
            >LinkedIn</a
          >
        </li>
        <li>
          <a
            href="https://github.com/diegorosso"
            target="_blank"
            rel="noopener noreferrer"
            class="label footer-link"
            >GitHub</a
          >
        </li>
      </ul>
      <a href="#home" class="label footer-link back-top">
        Volver arriba <span class="arrow" aria-hidden="true">↑</span>
      </a>
    </div>
  </footer>
</template>

<script setup>
import FooterRidges from "./FooterRidges.vue";

const year = new Date().getFullYear();
</script>

<style scoped>
.footer {
  border-block-start: 1px solid var(--line);
}

.footer-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px 24px;
  padding-block: 22px;
}

.footer-links {
  display: flex;
  gap: 24px;
}

.footer-link {
  color: var(--muted);
  transition: color var(--transition-1);
}

.footer-link:is(:hover, :focus-visible) {
  color: var(--paper);
}

.back-top {
  display: flex;
  gap: 0.6em;
}

.back-top .arrow {
  transition: transform var(--transition-1);
}

.back-top:is(:hover, :focus-visible) .arrow {
  transform: translateY(-3px);
}
</style>
