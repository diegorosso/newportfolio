<template>
  <section class="service" id="service" aria-label="Servicios">
    <h2 class="sr-only">Servicios</h2>

    <div class="marquee" aria-hidden="true">
      <div class="marquee-track">
        <template v-for="copy in 2" :key="copy">
          <span
            v-for="(word, index) in words"
            :key="`${copy}-${index}`"
            class="marquee-item"
          >
            <span class="display" :class="{ outline: index % 2 === 1 }">{{ word }}</span>
            <span class="star">✳</span>
          </span>
        </template>
      </div>
    </div>

    <ul class="sr-only">
      <li v-for="word in words" :key="word">{{ word }}</li>
    </ul>

    <p class="service-caption label muted wrap">
      Del diseño al código, con IA donde suma.
    </p>
  </section>
</template>

<script>
export default {
  name: "ServiceSection",
  data() {
    return {
      words: [
        "Desarrollo web",
        "Producto",
        "IA aplicada",
        "Diseño gráfico",
        "Arte digital",
        "Apps móviles",
      ],
    };
  },
};
</script>

<style scoped>
.service {
  padding-block: 40px 32px;
  border-block: 1px solid var(--line);
  overflow: hidden;
  scroll-margin-top: var(--header-h);
}

.marquee {
  display: flex;
  overflow: hidden;
}

.marquee-track {
  display: flex;
  flex-shrink: 0;
  animation: marquee 40s linear infinite;
}

.marquee:hover .marquee-track {
  animation-play-state: paused;
}

.marquee-item {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.marquee-item .display {
  font-size: clamp(7.2rem, 4rem + 9vw, 20.8rem);
  line-height: 1.08; /* deja lugar para tildes y la Ñ */
  white-space: nowrap;
  padding-inline: 0.12em;
}

.outline {
  color: transparent;
  -webkit-text-stroke: 1px var(--faint);
}

.star {
  font-family: var(--fontFamily-mono);
  font-size: clamp(2.4rem, 1.6rem + 2vw, 4rem);
  color: var(--faint);
  padding-inline: 0.4em;
}

@keyframes marquee {
  to {
    transform: translateX(-50%);
  }
}

.service-caption {
  margin-block-start: 20px;
  text-align: center;
}
</style>
