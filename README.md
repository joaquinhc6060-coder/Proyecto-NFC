# FindMe · Plataforma Web Inteligente para Mascotas (NFC + React + Tailwind CSS)

FindMe es una plataforma y landing page interactiva moderna para placas inteligentes de mascotas con tecnología NFC pasiva de alta frecuencia (13.56 MHz) y código QR dinámico.

---

## 💻 Guía rápida para ejecutar el proyecto en tu PC local

Si acabas de clonar el repositorio o hiciste `git pull origin main`:

### 1. Requisitos previos
- **Node.js**: Versión 18 o superior instalada ([nodejs.org](https://nodejs.org)).

### 2. Instalar dependencias
Abre tu terminal en la carpeta del proyecto y ejecuta:

```bash
npm install
```

### 3. Variables de entorno (Opcional para desarrollo)
El proyecto incluye un modo **Demo interactivo** que funciona al 100% sin necesidad de configurar backend. 
Si deseas conectar tu propia base de datos Supabase:
1. Copia `.env.example` y renómbralo a `.env`:
   ```bash
   cp .env.example .env
   ```
2. Completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con tus credenciales de Supabase.

### 4. Iniciar el servidor local de desarrollo
Para iniciar la web local con recarga en vivo (HMR):

En Linux / macOS / Bash:
```bash
npm run dev
```

En Windows (PowerShell / CMD):
```bash
npm.cmd run dev
```

Abre tu navegador en: **`http://localhost:5173`**

### 5. Compilar para producción (Build)
Para verificar que el bundle optimizado compila correctamente:

```bash
npm.cmd run build
```

---

## 🌟 Nuevas características y arquitectura integrada

1. **Showcase 3D Interactivo (Ecosistema FindMe)**:
   - Galería interactiva con 5 vistas de dispositivos en perspectiva 3D inspirada en interfaces de hardware moderno (Panel del Dueño, Ficha de Rescate NFC, Punto de Encuentro/Ubicación compartida por rescatista, Ficha Médica/Alergias y Alertas Push).
   - Selector por pestañas y click directo en cada teléfono para traerlo al frente.

2. **Mi NFC (Panel de Dueño & Ficha de Mascota en Tiempo Real)**:
   - Login y Registro con Supabase Auth.
   - Botón directo de **1-Click "Modo Demo / Vista Previa"** (pre-cargado con la perrita Luna, Golden Retriever).
   - Interruptor de estado en tiempo real (**"Mascota Segura"** vs **"Mascota Extraviada"**).
   - Edición en vivo de datos de contacto, veterinario, alergias y notas médicas.
   - Botón de envío de ubicación GPS del rescatista hacia el dueño vía WhatsApp.

3. **Arquitectura sin GPS Satelital Pasivo**:
   - Sin cuotas mensuales ni baterías que cargar. La ubicación es generada y compartida por el navegador del rescatista que escanea la placa NFC.

4. **Base de Datos Supabase (PostgreSQL + RLS)**:
   - Esquema DDL idempotente listo en `supabase/schema.sql`.

---

## 📁 Estructura del proyecto

```text
├── index.html                   # Entry point HTML con tipografía Plus Jakarta Sans
├── package.json                 # Scripts y dependencias (React 18, Vite, Tailwind v3, Supabase JS)
├── tailwind.config.js           # Tokens de diseño oficiales FindMe
├── vite.config.js               # Configuración de Vite y React
├── supabase/
│   └── schema.sql               # Esquema de base de datos Supabase con RLS
├── public/
│   └── images/
│       └── luna-perfil.jpg      # Foto de perfil optimizada de la mascota Luna
├── docs/
│   └── performance_baseline.md  # Auditoría técnica y métricas de rendimiento
└── src/
    ├── main.jsx                 # Montaje React
    ├── App.jsx                  # Orquestador principal de vistas
    ├── index.css                # Directivas Tailwind, fuentes y utilidades de perspectiva 3D
    ├── lib/
    │   └── supabaseClient.js    # Cliente Supabase singleton con sanitización y fallback
    └── components/
        ├── Navbar.jsx           # Barra fija con blur y acceso directo a secciones
        ├── Hero.jsx             # Hero section moderna con badges dinámicos y CTA
        ├── ProductShowcase.jsx  # Showcase 3D interactivo multi-dispositivo
        ├── MiNfc.jsx            # Portal Mi NFC (Dueño, Auth y Ficha Médica en vivo)
        ├── HowItWorks.jsx       # Proceso de escaneo NFC y contacto inmediato
        ├── Benefits.jsx         # Bento Grid de beneficios técnicos y de usabilidad
        ├── DemoScanner.jsx      # Maqueta interactiva de smartphone con simulación NFC
        ├── Privacy.jsx          # Panel con toggles interactivos de privacidad
        ├── FAQ.jsx              # Acordeón de preguntas frecuentes animado
        ├── ContactForm.jsx      # Formulario reactivo de preventa
        └── Footer.jsx           # Pie de página con enlaces y derechos
```

---

## 🎨 Paleta de colores oficial

- **Ink (`#12141a` / `#0c0d12`)**: Fondos oscuros de alta gama y tipografía contrastada.
- **Teal Brand (`#16d1b0`)**: Acento tecnológico principal, ondas de señal NFC y estados activos.
- **Orange Brand (`#ff5a2e`)**: Botones de acción, llamadas a la acción de emergencia y rescate.
- **Cream (`#fbf6ee`)**: Fondos cálidos y superficies suaves.


