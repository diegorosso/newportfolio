import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);

// El preloader tapa la pantalla ~1.5 s: lo que está en el hero espera a que se retire.
const HERO_DELAY = 1.2;

const headerOffset = () =>
  -(document.querySelector(".header-bar")?.offsetHeight ?? 0);

const heroDelay = (el) => (el.closest("#home") ? HERO_DELAY : 0);

/**
 * Los links internos (#about, #project...) se desplazan con Lenis
 * y dejan lugar para el header fijo.
 */
function handleAnchors(lenis) {
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const hash = link.getAttribute("href");
    const target = hash === "#" || hash === "#home" ? 0 : document.querySelector(hash);
    if (target === null) return;

    event.preventDefault();
    if (lenis) {
      lenis.scrollTo(target, { offset: target === 0 ? 0 : headerOffset(), duration: 1.4 });
    } else if (target === 0) {
      window.scrollTo({ top: 0 });
    } else {
      target.scrollIntoView();
    }
    history.replaceState(null, "", hash);
  });
}

function splitTitles() {
  document.querySelectorAll("[data-split]").forEach((el) => {
    SplitText.create(el, {
      type: "lines,chars",
      mask: "lines",
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.chars, {
          yPercent: 110,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.016,
          delay: heroDelay(el),
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        }),
    });
  });
}

function revealBlocks() {
  gsap.utils.toArray("[data-reveal]").forEach((el) => {
    gsap.from(el, {
      y: 32,
      autoAlpha: 0,
      duration: 1,
      ease: "expo.out",
      delay: heroDelay(el) ? HERO_DELAY + 0.3 : 0,
      scrollTrigger: { trigger: el, start: "top 92%", once: true },
    });
  });
}

function heroDetails() {
  gsap.from(".hero-wordmark svg", {
    yPercent: 100,
    duration: 1.4,
    ease: "expo.out",
    delay: HERO_DELAY,
  });

  document.querySelectorAll("[data-parallax]").forEach((el) => {
    gsap.to(el, {
      yPercent: 16,
      ease: "none",
      scrollTrigger: {
        trigger: el.closest("section"),
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  });
}

/**
 * Si cambia el alto de la página (por ejemplo, al cambiar de pestaña en "Sobre mí"),
 * se recalculan los puntos de disparo de ScrollTrigger.
 */
function refreshOnResize() {
  let frame;
  new ResizeObserver(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => ScrollTrigger.refresh());
  }).observe(document.body);
}

export async function initMotion() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    handleAnchors(null);
    return;
  }

  const lenis = new Lenis({ lerp: 0.1 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  handleAnchors(lenis);

  await document.fonts.ready;

  splitTitles();
  revealBlocks();
  heroDetails();
  refreshOnResize();
}
