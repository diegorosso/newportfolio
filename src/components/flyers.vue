<template>
  <section class="portfolio">
    <h3 class="title">
      Una muestra representativa de algunos diseños.
    </h3>

    <div
      class="gallery"
      @mouseenter="stopAutoSlide"
      @mouseleave="startAutoSlide"
      @focusin="stopAutoSlide"
      @focusout="startAutoSlide"
    >
      <img
        :src="images[currentIndex]"
        :alt="`Diseño ${currentIndex + 1} de ${images.length}`"
        class="gallery-item"
      />

      <button class="nav-btn prev" aria-label="Diseño anterior" @click="prevImage">
        <img :src="back" alt="" class="arrow-icon" />
      </button>

      <button class="nav-btn next" aria-label="Diseño siguiente" @click="nextImage">
        <img :src="forward" alt="" class="arrow-icon" />
      </button>

      <div class="dots">
        <button
          v-for="(image, index) in images"
          :key="index"
          type="button"
          class="dot"
          :class="{ active: index === currentIndex }"
          :aria-label="`Ir al diseño ${index + 1}`"
          @click="goToImage(index)"
        ></button>
      </div>
    </div>
  </section>
</template>

<script>
import ima1 from "../assets/images/1.webp";
import ima2 from "../assets/images/2.webp";
import ima3 from "../assets/images/3.webp";
import ima4 from "../assets/images/4.webp";
import ima5 from "../assets/images/5.webp";
import back from "../assets/images/back.svg";
import forward from "../assets/images/forward.svg";


export default {
  data() {
    return {
      images: [ima1, ima2, ima3, ima4, ima5],
      currentIndex: 0,
      interval: null,
      back,
      forward,
    };
  },
  methods: {
    nextImage() {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    },
    prevImage() {
      this.currentIndex =
        (this.currentIndex - 1 + this.images.length) % this.images.length;
    },
    goToImage(index) {
      this.currentIndex = index;
    },
    startAutoSlide() {
      clearInterval(this.interval);
      if (this.prefersReducedMotion) return;
      this.interval = setInterval(this.nextImage, 3000);
    },
    stopAutoSlide() {
      clearInterval(this.interval);
    },
  },
  mounted() {
    this.prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    this.startAutoSlide();
  },
  beforeUnmount() {
    this.stopAutoSlide();
  },
};
</script>

<style scoped>
.portfolio {
  text-align: center;
  padding: 2rem;
}

.title {
  font-size: 3rem;
  margin-bottom: 3rem;
}

.gallery {
  position: relative;
  width: 80%;
  max-width: 600px;
  margin: auto;
}

.gallery-item {
  width: 100%;
  height: auto;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 10px;
  transition: transform 0.5s ease, filter 0.3s;
  cursor: pointer;
  position: relative;
}

.gallery-item:hover {
  filter: brightness(1.2);
  transform: scale(1.05);
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.6);
  border: none;
  padding: 10px;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.prev {
  left: 10px;
}

.next {
  right: 10px;
}

.arrow-icon {
  width: 24px;
  height: 24px;
  filter: invert(1); /* Opcional, útil si la imagen es negra y el fondo es oscuro */
}

.dots {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.dot {
  width: 12px;
  height: 12px;
  padding: 0;
  background-color: #ccc;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.3s;
}

.dot.active {
  background-color: #333;
}

.dot:focus-visible,
.nav-btn:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}
</style>
