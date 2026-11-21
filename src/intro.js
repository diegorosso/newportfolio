// Coordina la pantalla de carga con lo que entra después: las animaciones del hero
// y los puntos de la trama WebGL esperan a que la pantalla se empiece a retirar.

const SEEN_KEY = "dr-intro-seen";

function decideShowIntro() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  // `?intro` en la URL la muestra siempre, para poder revisarla
  if (new URLSearchParams(window.location.search).has("intro")) return true;
  try {
    return sessionStorage.getItem(SEEN_KEY) !== "1";
  } catch {
    return true;
  }
}

/** La pantalla de carga se muestra una vez por sesión (cerrar la pestaña la resetea). */
export const showIntro = decideShowIntro();

export function markIntroSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* sin almacenamiento: se vuelve a mostrar en la próxima carga */
  }
}

let resolveIntro;
/** Se resuelve cuando la pantalla de carga empieza a retirarse, o enseguida si no se muestra. */
export const introDone = new Promise((resolve) => {
  resolveIntro = resolve;
});
export const finishIntro = () => resolveIntro();

let resolveDither;
/** La trama WebGL del hero avisa cuando compiló (true) o si no pudo (false). */
export const ditherReady = new Promise((resolve) => {
  resolveDither = resolve;
});
export const markDitherReady = (ok) => resolveDither(ok);
