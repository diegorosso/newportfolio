/**
 * Letras que engordan cerca del cursor, como en la referencia: cada letra pasa de un
 * grosor fino a uno grueso según su distancia al puntero, con una caída suave
 * (smoothstep) dentro de un radio. Medido en christendijoux.com: 250 → 800, radio ~280 px.
 *
 * `getLetters` se llama en cada actualización: así sigue funcionando aunque las letras
 * se vuelvan a generar (por ejemplo, cuando SplitText re-divide el título al cambiar el ancho).
 * Devuelve una función para desactivar el efecto.
 */
export function followWeight(getLetters, { min = 250, max = 800, radius = 280 } = {}) {
  let frame = 0;
  let pointer = null;

  const update = () => {
    frame = 0;
    const letters = getLetters().filter(Boolean);
    // Primero se lee todo y después se escribe: mezclar lecturas y escrituras de a una letra
    // obliga al navegador a recalcular el layout en cada vuelta y la animación se traba
    const weights = letters.map((el) => {
      if (!pointer) return min;
      const r = el.getBoundingClientRect();
      const distance = Math.hypot(
        pointer.x - (r.left + r.width / 2),
        pointer.y - (r.top + r.height / 2)
      );
      const t = Math.min(1, distance / radius);
      return Math.round(min + (max - min) * (1 - t * t * (3 - 2 * t)));
    });
    letters.forEach((el, i) => {
      // Solo se toca el estilo si el grosor cambió
      if (el._weight !== weights[i]) {
        el._weight = weights[i];
        el.style.fontWeight = weights[i];
      }
    });
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  const onMove = (event) => {
    pointer = { x: event.clientX, y: event.clientY };
    schedule();
  };

  const onLeave = () => {
    pointer = null;
    schedule();
  };

  // Al scrollear las letras se mueven bajo el cursor quieto: también hay que recalcular
  const onScroll = () => {
    if (pointer) schedule();
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);
  update();

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("scroll", onScroll);
    document.documentElement.removeEventListener("pointerleave", onLeave);
  };
}
