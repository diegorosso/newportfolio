<template>
  <section class="section contact" aria-label="Contacto" id="contact">
    <div class="wrap">
      <SectionHead :index="3" :total="3" label="Contacto" title="Trabajemos juntos" />

      <a
        href="mailto:diegorosso1988@gmail.com"
        class="contact-mail lead"
        data-cursor="Escribir"
        data-reveal
      >
        diegorosso1988@gmail.com <span class="arrow" aria-hidden="true">↗</span>
      </a>

      <div class="contact-grid">
        <form action="./index.html" method="post" class="contact-form" data-reveal>
          <label v-for="field in fields" :key="field.name" class="field">
            <span class="label label-dim">{{ field.label }}</span>
            <textarea
              v-if="field.tag === 'textarea'"
              :name="field.name"
              :required="field.required"
              rows="5"
              class="field-input"
            ></textarea>
            <input
              v-else
              :type="field.type"
              :name="field.name"
              :required="field.required"
              :autocomplete="field.autocomplete"
              class="field-input"
            />
          </label>

          <button type="submit" class="btn">
            Enviar mensaje <span class="arrow" aria-hidden="true">→</span>
          </button>
        </form>

        <div class="contact-side" data-reveal>
          <dl class="contact-list">
            <div v-for="item in contactItems" :key="item.key" class="contact-row">
              <dt class="label label-dim">{{ item.key }}</dt>
              <dd class="label">
                <a
                  v-if="item.href"
                  :href="item.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  >{{ item.text }}</a
                >
                <address v-else>{{ item.text }}</address>
              </dd>
            </div>
          </dl>

          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3282.078080279516!2d-58.51591742423494!3d-34.49965777298403!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb0539b37e3f1%3A0xf25a4f75cb37aa80!2sSan%20Isidro%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses!2sar!4v1712076540000!5m2!1ses!2sar"
            title="Mapa de San Isidro, Buenos Aires"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            class="map"
          ></iframe>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import SectionHead from "./SectionHead.vue";

const fields = [
  { tag: "input", type: "text", name: "name", label: "Nombre", autocomplete: "name", required: true },
  { tag: "input", type: "email", name: "email_address", label: "Email", autocomplete: "email", required: true },
  { tag: "input", type: "tel", name: "phone", label: "Teléfono", autocomplete: "tel", required: false },
  { tag: "textarea", name: "message", label: "Mensaje", required: true },
];

const contactItems = [
  { key: "Email", text: "diegorosso1988@gmail.com", href: "mailto:diegorosso1988@gmail.com" },
  { key: "WhatsApp", text: "11 3145 3388", href: "https://wa.me/541131453388" },
  { key: "Base", text: "San Isidro, Buenos Aires, AR" },
  { key: "LinkedIn", text: "in/diegorosso1988", href: "https://www.linkedin.com/in/diegorosso1988/" },
  { key: "GitHub", text: "diegorosso", href: "https://github.com/diegorosso" },
];
</script>

<style scoped>
.contact-mail {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.3em;
  margin-block-end: 56px;
  overflow-wrap: anywhere;
  background-image: linear-gradient(var(--paper), var(--paper));
  background-repeat: no-repeat;
  background-position: left bottom;
  background-size: 0 1px;
  transition: background-size 0.5s var(--ease-out);
}

.contact-mail:is(:hover, :focus-visible) {
  background-size: 100% 1px;
}

.contact-grid {
  display: grid;
  gap: 56px;
}

.contact-form {
  display: grid;
  gap: 22px;
  align-content: start;
}

.field {
  display: grid;
  gap: 6px;
}

.field-input {
  padding-block: 10px;
  border-block-end: 1px solid var(--line-strong);
  color: var(--paper);
  font-size: var(--fs-body);
  outline: none;
  transition: border-color var(--transition-1);
}

.field-input:focus {
  border-color: var(--paper);
}

textarea.field-input {
  resize: vertical;
  min-height: 120px;
}

.contact-form .btn {
  justify-self: start;
  margin-block-start: 12px;
}

.contact-side {
  display: grid;
  gap: 32px;
  align-content: start;
}

.contact-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-block: 12px;
  border-block-start: 1px solid var(--line);
}

.contact-row:last-child {
  border-block-end: 1px solid var(--line);
}

.contact-row dd {
  text-align: right;
  overflow-wrap: anywhere;
}

.contact-row a:is(:hover, :focus-visible) {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.map {
  width: 100%;
  aspect-ratio: 4 / 3;
  border: 1px solid var(--line);
  filter: grayscale(1) invert(0.92) contrast(0.9);
}

body.light-theme .map {
  filter: grayscale(1);
}

@media (min-width: 992px) {
  .contact-grid {
    grid-template-columns: 1fr 1fr;
    gap: 80px;
  }
}
</style>
