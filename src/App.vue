<script setup>
import { onMounted } from 'vue'
import Header from "./components/Header.vue";
import Preload from "./components/Preload.vue"
import Hero from "./components/Hero.vue"
import Service from "./components/Service.vue"
import About from "./components/About.vue"
import Project from "./components/Project.vue";
import Contact from "./components/Contact.vue";
import Footer from "./components/Footer.vue";
import CustomCursor from "./components/CustomCursor.vue";
import { initMotion } from "./motion.js";

onMounted(() => {
  initMotion();
});
</script>

<template>
  <CustomCursor />

  <Header />
  <Preload />
  <main>
    <Hero />
    <Service />
    <About />
    <Project />
    <Contact />
  </main>
  <Footer />
</template>



