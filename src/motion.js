import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { introDone, showIntro } from "./intro.js";

gsap.registerPlugin(ScrollTrigger, SplitText);

let introFinished = false;
introDone.then(() => {
  introFinished = true;
});

const inHero = (el) => Boolean(el.closest("#home"));

/**
 * Lo que está en el hero espera a que se retire la pantalla de carga:
 * la animación queda en su estado inicial y arranca cuando termina la carga.
 */
function playAfterIntro(tween) {
  if (!introFinished) {
    tween.pause();
    introDone.then(() => tween.play());
  }
  return tween;
}

const headerOffset = () =>
  -(document.querySelector(".header-bar")?.offsetHeight ?? 0);

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
    const hero = inHero(el);
    SplitText.create(el, {
      type: "lines,chars",
      mask: "lines",
      // El título del hero no se re-divide: sus líneas ya están fijas por los <br>, y sus
      // letras cambian de grosor con el cursor (al ensancharse, autoSplit las regeneraría
      // y les borraría el grosor)
      autoSplit: !hero,
      onSplit: (self) => {
        const tween = gsap.from(self.chars, {
          yPercent: 110,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.016,
          delay: hero ? 0.15 : 0,
          scrollTrigger: hero ? undefined : { trigger: el, start: "top 88%", once: true },
        });
        return hero ? playAfterIntro(tween) : tween;
      },
    });
  });
}

/**
 * Texto que se enciende palabra por palabra con el scroll, como el párrafo principal de
 * Sobre mí en la referencia: arranca apagado (38 %) y cada palabra pasa a 100 % mientras el
 * texto sube de la parte baja de la pantalla hacia el medio. Medido en christendijoux.com.
 */
function scrubWords() {
  document.querySelectorAll("[data-words]").forEach((el) => {
    SplitText.create(el, {
      type: "words",
      autoSplit: true,
      onSplit: (self) =>
        gsap.fromTo(
          self.words,
          { opacity: 0.38 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.12,
            scrollTrigger: { trigger: el, start: "top 82%", end: "top 40%", scrub: true },
          }
        ),
    });
  });
}

function revealBlocks() {
  gsap.utils.toArray("[data-reveal]").forEach((el) => {
    const hero = inHero(el);
    const tween = gsap.from(el, {
      y: 32,
      autoAlpha: 0,
      duration: 1,
      ease: "expo.out",
      delay: hero ? 0.45 : 0,
      scrollTrigger: hero ? undefined : { trigger: el, start: "top 92%", once: true },
    });
    if (hero) playAfterIntro(tween);
  });
}

function heroDetails() {
  playAfterIntro(
    gsap.from(".hero-wordmark svg", {
      yPercent: 100,
      duration: 1.4,
      ease: "expo.out",
      delay: 0.25,
    })
  );

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

  // Mientras está la pantalla de carga no se puede scrollear
  if (showIntro) {
    lenis.stop();
    introDone.then(() => lenis.start());
  }

  await document.fonts.ready;

  splitTitles();
  scrubWords();
  revealBlocks();
  heroDetails();
  refreshOnResize();
}
