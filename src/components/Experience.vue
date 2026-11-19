<template>
  <ul class="experience">
    <li v-for="(item, index) in items" :key="item.link" class="exp-card">
      <a :href="item.link" target="_blank" rel="noopener noreferrer" class="exp-link">
        <div class="exp-media">
          <img :src="item.img" :alt="item.name" loading="lazy" />
        </div>
        <div class="exp-meta">
          <span class="label label-dim">{{ String(index + 1).padStart(2, "0") }}</span>
          <h3 class="h3">{{ item.name }}</h3>
          <span class="label exp-cta">
            {{ item.domain }} <span class="arrow" aria-hidden="true">↗</span>
          </span>
        </div>
      </a>
    </li>
  </ul>
</template>

<script>
import tuImg from "../assets/images/tuseguroimagenlogo.png";
import neImg from "../assets/images/neuremi.webp";
import globalImg from "../assets/images/global.webp";
import mercedesImg from "../assets/images/mercedes-qa.png";

export default {
  data() {
    return {
      items: [
        {
          name: "Mercedes-Benz",
          img: mercedesImg,
          link: "https://www.mercedes-benz.com.ar",
          domain: "mercedes-benz.com.ar",
        },
        {
          name: "TuSeguro",
          img: tuImg,
          link: "https://tuseguro.insure",
          domain: "tuseguro.insure",
        },
        {
          name: "Neuromify",
          img: neImg,
          link: "https://www.neuromify.com",
          domain: "neuromify.com",
        },
        {
          name: "Global MKT",
          img: globalImg,
          link: "https://globalmkt.com.ar",
          domain: "globalmkt.com.ar",
        },
      ],
    };
  },
};
</script>

<style scoped>
.experience {
  display: grid;
  gap: 1px;
  background-color: var(--line);
  border: 1px solid var(--line);
}

.exp-card {
  background-color: var(--ink);
}

.exp-link {
  display: grid;
  height: 100%;
}

.exp-media {
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background-color: var(--surface);
}

.exp-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(1) contrast(1.05);
  transition: filter 0.5s ease, transform 0.8s var(--ease-out);
}

.exp-link:is(:hover, :focus-visible) img {
  filter: none;
  transform: scale(1.04);
}

.exp-meta {
  display: grid;
  gap: 10px;
  padding: 20px;
}

.exp-cta {
  display: flex;
  gap: 0.6em;
  color: var(--muted);
}

.exp-link:is(:hover, :focus-visible) .arrow {
  transform: translate(2px, -2px);
}

.arrow {
  transition: transform var(--transition-1);
}

@media (min-width: 640px) {
  .experience {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .experience {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
