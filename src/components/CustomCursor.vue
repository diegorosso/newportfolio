<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import gsap from "gsap";

/*
 * Cursor propio, solo con mouse (no en pantallas táctiles ni con "reducir movimiento"):
 * - un punto cuadrado que sigue al puntero casi sin demora;
 * - un aro que lo sigue con inercia, crece sobre links y botones, y se llena con un texto
 *   sobre los elementos con data-cursor="Texto" (por ejemplo, las tarjetas de proyectos);
 * - los botones (.btn o [data-magnetic]) se acercan un poco al puntero y vuelven con rebote.
 */
const ring = ref(null);
const dot = ref(null);
const state = ref(""); // "" | "hover" | "label"
const label = ref("");

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label';
const MAGNETIC = "[data-magnetic], .btn";

let cleanup = () => {};

onMounted(() => {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!finePointer || reduceMotion) return;

  const root = document.documentElement;
  const ringEl = ring.value;
  const dotEl = dot.value;
  root.classList.add("has-cursor");

  const ringX = gsap.quickTo(ringEl, "x", { duration: 0.45, ease: "power3.out" });
  const ringY = gsap.quickTo(ringEl, "y", { duration: 0.45, ease: "power3.out" });
  const dotX = gsap.quickTo(dotEl, "x", { duration: 0.08 });
  const dotY = gsap.quickTo(dotEl, "y", { duration: 0.08 });

  let started = false; // hasta el primer movimiento no se sabe dónde está el puntero
  let inside = true;
  let magnet = null;

  const fade = (to) => gsap.to([ringEl, dotEl], { autoAlpha: to, duration: 0.2, overwrite: "auto" });

  const releaseMagnet = () => {
    if (magnet) gsap.to(magnet, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
  };

  const onMove = (event) => {
    if (event.pointerType && event.pointerType !== "mouse") return;
    const { clientX: x, clientY: y } = event;

    if (!started) {
      started = true;
      gsap.set([ringEl, dotEl], { x, y });
      fade(1);
    } else if (!inside) {
      inside = true;
      fade(1);
    }

    ringX(x);
    ringY(y);
    dotX(x);
    dotY(y);

    if (magnet) {
      const box = magnet.getBoundingClientRect();
      gsap.to(magnet, {
        x: (x - (box.left + box.width / 2)) * 0.28,
        y: (y - (box.top + box.height / 2)) * 0.38,
        duration: 0.5,
        ease: "power3.out",
      });
    }
  };

  // Delegado en el documento: funciona también con lo que se agrega después de montar
  const onOver = (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const labelled = target.closest("[data-cursor]");
    const interactive = target.closest(INTERACTIVE);
    label.value = labelled ? labelled.dataset.cursor : "";
    state.value = labelled ? "label" : interactive ? "hover" : "";

    const next = target.closest(MAGNETIC);
    if (next !== magnet) {
      releaseMagnet();
      magnet = next;
    }
  };

  const onDown = () => gsap.to(ringEl, { scale: 0.8, duration: 0.15 });
  const onUp = () => gsap.to(ringEl, { scale: 1, duration: 0.3 });
  const onLeave = () => {
    inside = false;
    fade(0);
    releaseMagnet();
    magnet = null;
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerover", onOver);
  window.addEventListener("pointerdown", onDown);
  window.addEventListener("pointerup", onUp);
  root.addEventListener("pointerleave", onLeave);

  cleanup = () => {
    root.classList.remove("has-cursor");
    window.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerover", onOver);
    window.removeEventListener("pointerdown", onDown);
    window.removeEventListener("pointerup", onUp);
    root.removeEventListener("pointerleave", onLeave);
    gsap.killTweensOf([ringEl, dotEl]);
  };
});

onBeforeUnmount(() => cleanup());
</script>

<template>
  <div ref="ring" class="cursor-ring" :data-state="state" aria-hidden="true">
    <div class="cursor-ring-inner">
      <span class="cursor-label">{{ label }}</span>
    </div>
  </div>
  <div ref="dot" class="cursor-dot" aria-hidden="true"></div>
</template>

<style>
/* Con el cursor propio activo se oculta el del sistema (salvo en campos de texto) */
html.has-cursor,
html.has-cursor * {
  cursor: none !important;
}

html.has-cursor input,
html.has-cursor textarea {
  cursor: text !important;
}

.cursor-ring,
.cursor-dot {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  visibility: hidden; /* GSAP lo muestra con el primer movimiento del mouse */
  opacity: 0;
}

/* El aro usa los colores del tema; el punto invierte lo que tiene debajo */
.cursor-ring {
  z-index: 9998;
}

.cursor-dot {
  z-index: 9999;
  width: 6px;
  height: 6px;
  margin: -3px 0 0 -3px;
  background-color: #f2f2ee; /* fijo: con "difference" se ve sobre cualquier fondo, en los dos temas */
  mix-blend-mode: difference;
}

.cursor-ring-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  margin: -17px 0 0 -17px;
  border: 1px solid color-mix(in srgb, var(--paper) 50%, transparent);
  border-radius: 999px;
  transition:
    width 0.45s cubic-bezier(0.16, 1, 0.3, 1),
    height 0.45s cubic-bezier(0.16, 1, 0.3, 1),
    margin 0.45s cubic-bezier(0.16, 1, 0.3, 1),
    background-color 0.3s,
    border-color 0.3s;
}

.cursor-ring[data-state="hover"] .cursor-ring-inner {
  width: 56px;
  height: 56px;
  margin: -28px 0 0 -28px;
  border-color: var(--paper);
}

.cursor-ring[data-state="label"] .cursor-ring-inner {
  width: 96px;
  height: 96px;
  margin: -48px 0 0 -48px;
  background-color: var(--paper);
  border-color: var(--paper);
}

.cursor-label {
  font-family: var(--fontFamily-mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--ink);
  opacity: 0;
  transform: scale(0.6);
  transition:
    opacity 0.25s,
    transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.cursor-ring[data-state="label"] .cursor-label {
  opacity: 1;
  transform: scale(1);
}
</style>
