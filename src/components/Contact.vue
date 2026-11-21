<template>
  <section class="section contact" aria-label="Contacto" id="contact">
    <div class="wrap contact-grid">
      <!-- Izquierda: mail grande, texto, datos y redes -->
      <div class="contact-main">
        <SectionHead :index="3" :total="3" label="Contacto" title="Trabajemos juntos" />

        <a
          href="mailto:diegorosso1988@gmail.com"
          class="contact-mail"
          data-cursor="Escribir"
          data-reveal
        >
          <span class="contact-mail-text">diegorosso1988@gmail.com</span>
          <span class="arrow" aria-hidden="true">↗</span>
        </a>

        <div class="contact-intro" data-reveal>
          <h3 class="contact-sub">Hablemos de tu proyecto</h3>
          <p class="muted">
            Estoy disponible para trabajo remoto, híbrido o freelance, y abierto a
            nuevos proyectos y colaboraciones. Escribime y lo charlamos.
          </p>
        </div>

        <ul class="contact-list" data-reveal>
          <li v-for="item in contactItems" :key="item.key" class="contact-row">
            <span class="label label-dim row-key">{{ item.key }}</span>
            <svg class="row-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path v-for="(d, i) in icons[item.icon]" :key="i" :d="d" />
            </svg>
            <a
              v-if="item.href"
              :href="item.href"
              target="_blank"
              rel="noopener noreferrer"
              class="row-value"
            >
              {{ item.text }}
              <span class="row-arrow" aria-hidden="true">↗</span>
            </a>
            <address v-else class="row-value">{{ item.text }}</address>
          </li>
        </ul>

        <div class="contact-socials" data-reveal>
          <a
            v-for="social in socials"
            :key="social.label"
            :href="social.href"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn--ghost"
          >
            <svg class="row-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path v-for="(d, i) in icons[social.icon]" :key="i" :d="d" />
            </svg>
            {{ social.label }}
          </a>
        </div>
      </div>

      <!-- Derecha: formulario tipo terminal, como en la referencia -->
      <form class="contact-form" data-reveal novalidate @submit.prevent="send">
        <p class="label form-head" aria-hidden="true">
          <span>&gt; nuevo_mensaje <span class="caret">_</span></span>
          <span class="label-dim">✳</span>
        </p>

        <!-- Campo trampa: los humanos no lo ven; los bots lo llenan y el envío se descarta -->
        <input
          v-model="form.website"
          type="text"
          name="website"
          tabindex="-1"
          autocomplete="off"
          aria-hidden="true"
          class="field-trap"
        />

        <label class="field">
          <span class="label"><span class="label-dim">01 ·</span> Nombre</span>
          <input
            v-model.trim="form.name"
            type="text"
            name="name"
            autocomplete="name"
            placeholder="Tu nombre"
            required
            class="field-input"
          />
        </label>

        <label class="field">
          <span class="label"><span class="label-dim">02 ·</span> Email</span>
          <input
            v-model.trim="form.email"
            type="email"
            name="email"
            autocomplete="email"
            placeholder="tu@email.com"
            required
            class="field-input"
          />
        </label>

        <label class="field">
          <span class="label"><span class="label-dim">03 ·</span> Mensaje</span>
          <textarea
            v-model="form.message"
            name="message"
            rows="6"
            :maxlength="MAX_MESSAGE"
            placeholder="Contame tu idea…"
            required
            class="field-input"
          ></textarea>
        </label>

        <div class="form-foot">
          <button type="submit" class="btn" :disabled="status === 'sending'">
            {{ status === "sending" ? "Enviando…" : "Enviar mensaje" }}
            <span class="arrow" aria-hidden="true">→</span>
          </button>
          <span class="label label-dim">{{ form.message.length }} / {{ MAX_MESSAGE }}</span>
        </div>

        <p class="form-status label" :class="status" role="status" aria-live="polite">
          <template v-if="status === 'sent'">
            Mensaje enviado. Te respondo a la brevedad.
          </template>
          <template v-else-if="status === 'error'">
            {{ errorText }}
            <a :href="mailtoHref" class="status-link">Escribime directo →</a>
          </template>
        </p>
      </form>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import SectionHead from "./SectionHead.vue";

const EMAIL = "diegorosso1988@gmail.com";
const MAX_MESSAGE = 1000;

const form = reactive({ name: "", email: "", message: "", website: "" });
const status = ref("idle"); // idle | sending | sent | error
const errorText = ref("");

const messages = {
  name: "Falta tu nombre.",
  email: "Revisá el email: no parece válido.",
  message: "Escribí un mensaje (hasta 1000 caracteres).",
  rate: "Ya enviaste un mensaje hace un momento. Probá de nuevo en unos segundos.",
};

/** Plan B si el envío falla: abrir el correo de quien escribe con el mensaje armado */
const mailtoHref = computed(() => {
  const subject = `Contacto desde el portfolio — ${form.name}`;
  const body = `${form.message}

${form.name}
${form.email}`;
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

async function send() {
  if (status.value === "sending") return;
  status.value = "sending";
  errorText.value = "";

  try {
    const response = await fetch("/send.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form }),
    });
    const result = await response.json().catch(() => ({}));

    if (response.ok && result.ok) {
      status.value = "sent";
      form.name = form.email = form.message = "";
      return;
    }
    errorText.value = messages[result.error] ?? "No se pudo enviar el mensaje.";
  } catch {
    errorText.value = "No se pudo enviar el mensaje.";
  }
  status.value = "error";
}

const contactItems = [
  { key: "Email", icon: "mail", text: EMAIL, href: `mailto:${EMAIL}` },
  { key: "WhatsApp", icon: "phone", text: "11 3145 3388", href: "https://wa.me/541131453388" },
  { key: "Base", icon: "pin", text: "San Isidro, Buenos Aires, AR" },
];

const socials = [
  { label: "GitHub", icon: "github", href: "https://github.com/diegorosso" },
  { label: "LinkedIn", icon: "linkedin", href: "https://www.linkedin.com/in/diegorosso1988/" },
];

// Íconos de línea fina (trazos de 24×24, al estilo de los de la referencia)
const icons = {
  mail: ["M3 6h18v12H3z", "M3 7l9 6 9-6"],
  phone: [
    "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z",
  ],
  pin: ["M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z", "M12 7a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"],
  github: [
    "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.1-1.3-.4-2.5-1.1-3.5.3-1.1.3-2.3 0-3.5 0 0-1 0-3 1.5a10.3 10.3 0 0 0-6 0C8 2 7 2 7 2c-.3 1.2-.3 2.4 0 3.5A5.4 5.4 0 0 0 5.9 9c0 3.5 3 5.5 6 5.5-.4.5-.8 1.1-.9 1.7-.2.6-.2 1.2-.1 1.8v4",
    "M9 18c-4.5 2-5-2-7-2",
  ],
  linkedin: [
    "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z",
    "M2 9h4v12H2z",
    "M4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z",
  ],
};
</script>

<style scoped>
.contact-grid {
  display: grid;
  gap: 56px;
}

.contact-main {
  display: grid;
  align-content: start;
}

/* Mail grande, fino y en minúscula, con una línea debajo */
.contact-mail {
  display: inline-flex;
  align-items: baseline;
  justify-self: start;
  gap: 0.35em;
  max-width: 100%;
  padding-block-end: 14px;
  margin-block: -24px 48px;
  border-block-end: 1px solid var(--line-strong);
  font-family: var(--fontFamily-display);
  font-weight: var(--weight-light);
  font-size: clamp(3.2rem, 1.2rem + 3.6vw, 7.2rem);
  line-height: 1;
  transition: border-color var(--transition-1);
}

.contact-mail-text {
  min-width: 0;
  overflow-wrap: anywhere;
}

.contact-mail .arrow {
  font-family: var(--fontFamily-sans);
  font-size: 0.6em;
  transition: transform var(--transition-1);
}

.contact-mail:is(:hover, :focus-visible) {
  border-color: var(--paper);
}

.contact-mail:is(:hover, :focus-visible) .arrow {
  transform: translate(3px, -3px);
}

.contact-intro {
  display: grid;
  gap: 14px;
  max-width: 48ch;
  margin-block-end: 32px;
}

.contact-sub {
  font-family: var(--fontFamily-display);
  font-weight: var(--weight-regular);
  font-size: clamp(2.8rem, 2rem + 1.4vw, 4rem);
  line-height: 1;
}

/* Filas de datos: etiqueta, ícono, valor y flecha */
.contact-list {
  border-block-start: 1px solid var(--line);
  max-width: 740px;
}

.contact-row {
  display: grid;
  grid-template-columns: 96px 20px 1fr;
  align-items: center;
  gap: 14px;
  padding-block: 16px;
  border-block-end: 1px solid var(--line);
}

.row-icon {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  color: var(--muted);
}

.row-value {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-family: var(--fontFamily-mono);
  font-size: 1.3rem;
  overflow-wrap: anywhere;
}

.row-arrow {
  color: var(--muted);
  transition: color var(--transition-1), transform var(--transition-1);
}

a.row-value:is(:hover, :focus-visible) .row-arrow {
  color: var(--paper);
  transform: translate(2px, -2px);
}

.contact-socials {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-block-start: 24px;
}

.contact-socials .btn {
  gap: 8px;
}

.contact-socials .row-icon {
  color: inherit;
}

/* Formulario tipo terminal, en un panel con cruces en dos esquinas */
.contact-form {
  position: relative;
  display: grid;
  gap: 28px;
  align-content: start;
  padding: 28px;
  border: 1px solid var(--line);
  background-color: color-mix(in srgb, var(--ink) 92%, transparent);
}

.contact-form::before,
.contact-form::after {
  content: "+";
  position: absolute;
  font-family: var(--fontFamily-mono);
  font-size: 1.2rem;
  line-height: 1;
  color: var(--faint);
}

.contact-form::before {
  top: -7px;
  left: -4px;
}

.contact-form::after {
  bottom: -7px;
  right: -4px;
}

.form-head {
  display: flex;
  justify-content: space-between;
}

.form-head span {
  display: inline;
}

.caret {
  animation: blink 1s steps(1) infinite;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

.field {
  display: grid;
  gap: 10px;
}

.field .label span {
  display: inline;
}

.field-input {
  padding-block: 8px 14px;
  border-block-end: 1px solid var(--line);
  color: var(--paper);
  font-size: var(--fs-body);
  outline: none;
  transition: border-color var(--transition-1);
}

/* El autocompletado de Chrome pinta los campos de celeste; se mantiene el fondo y el color del sitio */
.field-input:-webkit-autofill,
.field-input:-webkit-autofill:hover,
.field-input:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--paper);
  caret-color: var(--paper);
  box-shadow: 0 0 0 1000px var(--ink) inset;
  transition: background-color 9999s ease-out;
}

/* Campo trampa anti-spam: fuera de la pantalla, no es para personas */
.field-trap {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.form-status {
  min-height: 1.5em;
  color: var(--muted);
}

.form-status.sent {
  color: var(--paper);
}

.form-status.sent::before {
  content: "✓ ";
}

.form-status.error {
  color: var(--paper);
}

.status-link {
  display: inline;
  margin-inline-start: 0.6em;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.btn:disabled {
  opacity: 0.55;
  cursor: progress;
}

.field-input::placeholder {
  color: var(--faint);
}

.field-input:focus {
  border-color: var(--paper);
}

textarea.field-input {
  resize: none;
  min-height: 150px;
}

/* En celulares la etiqueta ocupa menos, así el mail entra en una línea */
@media (max-width: 479px) {
  .contact-row {
    grid-template-columns: 64px 16px 1fr;
    gap: 10px;
  }

  .row-value {
    font-size: 1.15rem;
  }
}

.form-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

@media (min-width: 992px) {
  .contact-grid {
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: end;
  }

  .contact-form {
    padding: 36px;
  }
}
</style>
