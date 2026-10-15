# NexoPet · Landing Page (React + Tailwind CSS)

Adaptación de la landing page estática original de **NexoPet** a una arquitectura moderna basada en componentes con **React 18**, **Tailwind CSS v3** y **Vite**.

## 🚀 Cómo iniciar el proyecto en desarrollo

Debido a que en Windows PowerShell la ejecución de scripts `.ps1` puede estar restringida por defecto, ejecuta siempre utilizando `npm.cmd`:

```bash
# Iniciar el servidor de desarrollo
npm.cmd run dev
```

El servidor iniciará localmente (típicamente en `http://localhost:5173`).

Para generar la compilación de producción optimizada:

```bash
npm.cmd run build
```

---

## 📁 Estructura del proyecto

```text
├── index.html                   # Entry point HTML optimizado con Vite
├── Index.original.html          # Respaldo seguro del archivo HTML original
├── package.json                 # Scripts y dependencias (React, Vite, Tailwind)
├── tailwind.config.js           # Paleta de colores oficial, animaciones y medidas
├── postcss.config.js            # Integración de Tailwind y Autoprefixer
├── vite.config.js               # Configuración de compilador y plugin React
└── src/
    ├── main.jsx                 # Montaje en el DOM
    ├── App.jsx                  # Orquestador principal de secciones
    ├── index.css                # Directivas Tailwind y estilos globales
    └── components/
        ├── Navbar.jsx           # Navegación fija con blur y menú móvil interactivo
        ├── Hero.jsx             # Hero section con fondo dinámico, CTA y tag flotante
        ├── HowItWorks.jsx       # 'Si se pierde' + Pasos explicativos numerados
        ├── Benefits.jsx         # Tarjetas de beneficios con iconografía
        ├── DemoScanner.jsx      # Maqueta interactiva de smartphone con simulación NFC
        ├── Privacy.jsx          # Panel con toggles interactivos de privacidad
        ├── FAQ.jsx              # Acordeón de preguntas frecuentes con animación
        ├── ContactForm.jsx      # Formulario reactivo de registro previo con validación
        └── Footer.jsx           # Pie de página con año dinámico y derechos
```

---

## 🎨 Paleta de colores configurada en Tailwind

- **Ink (`#12141a`)**: Color de fondo oscuro principal y tipografía en fondos claros.
- **Ink Secondary (`#1c1f27`)**: Tarjetas sobre fondo oscuro.
- **Cream (`#fbf6ee`)**: Fondo general cálido.
- **Cream Secondary (`#f2e9db`)**: Fondos de iconos y tarjetas claras.
- **Orange Brand (`#ff5a2e`)**: Color de acento primario y botones de acción.
- **Orange Hover (`#d93f14`)**: Estado hover de botones primarios.
- **Teal Brand (`#16d1b0`)**: Acentos secundarios, ondas NFC y estados activos.
- **Muted / Light (`#5d6370` / `#b4b9c4`)**: Textos secundarios legibles.

