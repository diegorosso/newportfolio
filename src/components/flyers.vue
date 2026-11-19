<template>
  <div class="designs">
    <p class="label muted designs-caption">
      Una muestra representativa de algunos diseños.
    </p>
    <ul class="designs-grid">
      <li v-for="(image, index) in images" :key="image" class="design">
        <img
          :src="image"
          :alt="`Diseño ${index + 1} de ${images.length}`"
          loading="lazy"
        />
        <span class="label design-index">
          {{ String(index + 1).padStart(2, "0") }} / {{ String(images.length).padStart(2, "0") }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script>
import ima1 from "../assets/images/1.webp";
import ima2 from "../assets/images/2.webp";
import ima3 from "../assets/images/3.webp";
import ima4 from "../assets/images/4.webp";
import ima5 from "../assets/images/5.webp";

export default {
  data() {
    return {
      images: [ima1, ima2, ima3, ima4, ima5],
    };
  },
};
</script>

<style scoped>
.designs-caption {
  margin-block-end: 20px;
}

.designs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.design {
  position: relative;
  overflow: hidden;
  background-color: var(--surface);
  border: 1px solid var(--line);
}

.design img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(1);
  transition: filter 0.5s ease, transform 0.8s var(--ease-out);
}

.design:hover img {
  filter: none;
  transform: scale(1.03);
}

.design-index {
  position: absolute;
  inset: 10px auto auto 10px;
  padding: 2px 6px;
  background-color: var(--ink);
  color: var(--paper);
}

@media (min-width: 992px) {
  .designs-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>
