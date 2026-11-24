/**
 * Letras que engordan cerca del cursor, como en la referencia: cada letra pasa de un
 * grosor fino a uno grueso según su distancia al puntero, con una caída suave
 * (smoothstep) dentro de un radio. Medido en christendijoux.com: 250 → 800, radio ~280 px.
 *
 * `getLetters` se llama en cada actualización: así sigue funcionando aunque las letras
 * se vuelvan a generar (por ejemplo, cuando SplitText re-divide el título al cambiar el ancho).
 * Devuelve una función para desactivar el efecto.
 *
 * Rendimiento: las letras son enormes y el navegador tarda ~100 ms en dibujar por primera
 * vez cada grosor de una fuente variable. Por eso el grosor avanza en pasos fijos (`step`)
 * en vez de recorrer todos los valores intermedios, y la suavidad se hace acá y no con una
 * transición de CSS.
 */
export function followWeight(getLetters, { min = 250, max = 800, radius = 280, step = 50 } = {}) {
  let frame = 0;
  let pointer = null;

  const update = () => {
    frame = 0;
    const letters = getLetters().filter(Boolean);

    // Primero se lee todo y después se escribe: mezclar lecturas y escrituras de a una letra
    // obliga al navegador a recalcular el layout en cada vuelta y la animación se traba
    const targets = letters.map((el) => {
      if (!pointer) return min;
      const r = el.getBoundingClientRect();
      const distance = Math.hypot(
        pointer.x - (r.left + r.width / 2),
        pointer.y - (r.top + r.height / 2)
      );
      const t = Math.min(1, distance / radius);
      return min + (max - min) * (1 - t * t * (3 - 2 * t));
    });

    let moving = false;
    letters.forEach((el, i) => {
      // Acercamiento suave al objetivo (inercia)
      let current = el._current ?? min;
      current += (targets[i] - current) * 0.22;
      if (Math.abs(targets[i] - current) < step / 4) current = targets[i];
      else moving = true;
      el._current = current;

      // Se escribe solo si cambió el paso, para no recalcular el texto de más
      const quantized = Math.min(max, Math.max(min, Math.round(current / step) * step));
      if (el._weight !== quantized) {
        el._weight = quantized;
        el.style.fontWeight = quantized;
      }
    });

    if (moving) schedule();
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
