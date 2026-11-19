<template>
  <ul class="skills">
    <li v-for="(tech, index) in technologies" :key="tech.name" class="skill">
      <div class="skill-top">
        <span class="label label-dim">{{ String(index + 1).padStart(2, "0") }}</span>
        <img :src="tech.img" alt="" width="28" height="28" loading="lazy" class="skill-icon" />
      </div>
      <h3 class="skill-name">{{ tech.name }}</h3>
      <p class="skill-text muted">{{ tech.description }}</p>
    </li>
  </ul>
</template>

<script>
import htmlImg from "../assets/images/html.png";
import cssImg from "../assets/images/css.png";
import jsImg from "../assets/images/js.png";
import vueImg from "../assets/images/vue.png";
import angImg from "../assets/images/angular.png";
import gitImg from "../assets/images/git.png";
import worImg from "../assets/images/wordPress.png";
import phoImg from "../assets/images/photoshop.png";
import afterImg from "../assets/images/effects.png";
import proImg from "../assets/images/processing.png";
import Canva from "../assets/images/Canva.png";
import Veutify from "../assets/images/veutify.png";
import Node from "../assets/images/Node.js.png";
import MongoDB from "../assets/images/MongoDB.png";
import Firebase from "../assets/images/Firebase.png";
import Figma from "../assets/images/Figma.png";
import Bootstrap from "../assets/images/bootstrap.png";
import Sass from "../assets/images/sass.png";
import ClaudeIcon from "../assets/images/claude-icon.png";
import GroqIcon from "../assets/images/groq-icon.png";

export default {
  data() {
    return {
      technologies: [
        {
          name: "HTML",
          img: htmlImg,
          description:
            "HTML (HyperText Markup Language) es el lenguaje estándar de marcado para la creación de páginas web. Define la estructura del contenido web mediante etiquetas y elementos.",
        },
        {
          name: "CSS",
          img: cssImg,
          description:
            "CSS (Cascading Style Sheets) se utiliza para estilizar documentos HTML, permitiendo el diseño visual y la presentación de las páginas web con colores, fuentes y posicionamiento.",
        },
        {
          name: "JavaScript",
          img: jsImg,
          description:
            "JavaScript es un lenguaje de programación que permite añadir interactividad a los sitios web, como animaciones, validaciones de formularios y manipulación del DOM.",
        },
        {
          name: "Vue.js",
          img: vueImg,
          description:
            "Vue.js es un framework progresivo de JavaScript para la construcción de interfaces de usuario y aplicaciones web de una sola página con un enfoque en la reactividad y la modularidad.",
        },
        {
          name: "Angular",
          img: angImg,
          description:
            "Angular es un framework de desarrollo web basado en TypeScript que permite la creación de aplicaciones web dinámicas y escalables con arquitectura modular.",
        },
        {
          name: "Git",
          img: gitImg,
          description:
            "Git es un sistema de control de versiones distribuido que permite a los desarrolladores rastrear cambios en el código, colaborar en proyectos y gestionar versiones de manera eficiente.",
        },
        {
          name: "WordPress",
          img: worImg,
          description:
            "WordPress es un sistema de gestión de contenidos (CMS) que facilita la creación y administración de sitios web y blogs sin necesidad de conocimientos avanzados de programación.",
        },
        {
          name: "Photoshop",
          img: phoImg,
          description:
            "Adobe Photoshop es un software de edición y manipulación de imágenes, utilizado en diseño gráfico, fotografía digital y creación de contenido visual.",
        },
        {
          name: "After Effects",
          img: afterImg,
          description:
            "Adobe After Effects es una aplicación de postproducción de video que permite la creación de efectos visuales, animaciones y gráficos en movimiento.",
        },
        {
          name: "Processing",
          img: proImg,
          description:
            "Processing es un entorno de programación y un lenguaje diseñado para el arte visual y la educación, facilitando la creación de gráficos y animaciones interactivas.",
        },
        {
          name: "Canva",
          img: Canva,
          description:
            "Canva es una herramienta de diseño gráfico en línea que permite crear presentaciones, infografías y otros contenidos visuales de manera sencilla y accesible.",
        },
        {
          name: "Vuetify",
          img: Veutify,
          description:
            "Vuetify es un framework de componentes de Material Design para Vue.js, que facilita la creación de interfaces de usuario atractivas y responsivas.",
        },
        {
          name: "Node.js",
          img: Node,
          description:
            "Node.js es un entorno de ejecución de JavaScript del lado del servidor, que permite construir aplicaciones escalables y rápidas utilizando JavaScript.",
        },
        {
          name: "MongoDB",
          img: MongoDB,
          description:
            "MongoDB es una base de datos NoSQL orientada a documentos, que permite almacenar y gestionar grandes volúmenes de datos de manera flexible y escalable.",
        },
        {
          name: "Firebase",
          img: Firebase,
          description:
            "Firebase es una plataforma de desarrollo de aplicaciones móviles y web que ofrece servicios como autenticación, base de datos en tiempo real y almacenamiento en la nube.",
        },
        {
          name: "Figma",
          img: Figma,
          description:
            "Figma es una herramienta de diseño colaborativo en línea que permite crear interfaces de usuario, prototipos y diseños gráficos de manera eficiente y en tiempo real.",
        },
        {
          name: "Bootstrap",
          img: Bootstrap,
          description:
            "Bootstrap es un framework front-end que facilita el desarrollo de sitios web responsivos y móviles mediante el uso de HTML, CSS y JavaScript predefinidos.",
        },
        {
          name: "Sass",
          img: Sass,
          description:
            "Sass es un preprocesador CSS que añade características como variables, anidamiento y mixins, facilitando la escritura y mantenimiento de estilos CSS más complejos.",
        },
        {
          name: "Claude (Anthropic)",
          img: ClaudeIcon,
          description:
            "Uso Claude como asistente de desarrollo con IA: prototipado rápido de componentes Vue, generación de interfaces, y aceleración de flujos de trabajo en proyectos como este mismo portfolio.",
        },
        {
          name: "Groq",
          img: GroqIcon,
          description:
            "Plataforma de inferencia de IA de alta velocidad. La integré en producción en el chatbot de Sukata BJJ (modelo Llama 3.1) usando funciones serverless de Netlify para responder consultas de clientes en tiempo real.",
        },
      ],
    };
  },
};
</script>

<style scoped>
/* Celdas separadas por líneas de 1px: el fondo de la grilla hace de línea */
.skills {
  display: grid;
  gap: 1px;
  background-color: var(--line);
  border: 1px solid var(--line);
}

.skill {
  display: grid;
  align-content: start;
  gap: 12px;
  padding: 20px;
  background-color: var(--ink);
  transition: background-color var(--transition-1);
}

.skill:hover {
  background-color: var(--surface);
}

.skill-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skill-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
  filter: grayscale(1);
  opacity: 0.7;
  transition: filter var(--transition-1), opacity var(--transition-1);
}

.skill:hover .skill-icon {
  filter: none;
  opacity: 1;
}

.skill-name {
  font-family: var(--fontFamily-display);
  font-weight: var(--weight-regular);
  font-size: 3.2rem;
  line-height: 1;
  text-transform: uppercase;
}

.skill-text {
  font-size: var(--fs-small);
  line-height: 1.55;
}

@media (min-width: 640px) {
  .skills {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 992px) {
  .skills {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1400px) {
  .skills {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
