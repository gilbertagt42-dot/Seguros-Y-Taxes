# Gilberto A. Gomez · Seguros & Taxes

Sitio web estático (HTML + CSS + JavaScript, sin dependencias ni instalación) para promocionar y brindar información personalizada sobre:

- Seguros de vida
- Seguros de salud (Marketplace / Medicare)
- Anualidades
- Impuestos personales (taxes)

---

## 1. Cómo ver el sitio

**En línea:** https://gilbertagt42-dot.github.io/Seguros-Y-Taxes/

**En tu computadora:** abre `index.html` con doble clic. Todo funciona sin servidor.

El sitio se publica con **GitHub Pages** desde la rama `main` (raíz del repositorio). Cada `git push` a `main` republica el sitio en 1–2 minutos.

---

## 1.1 Publicar cambios

```powershell
cd "C:\Users\gilbe\OneDrive\Documents\Default Project"
git add -A
git commit -m "Describe el cambio"
git push
```

> El repositorio es público, así que **no subas documentos de clientes, declaraciones ni datos personales**. Solo el código del sitio.

---

## 2. Datos de contacto (un solo archivo)

Abre **`assets/js/site-config.js`** y edita:

```js
insurance: { phone, email, whatsapp, hours, license, ... }
taxes:     { phone, email, whatsapp, address, hours, ... }
site:      { city, url }
```

Ese archivo alimenta automáticamente todos los botones de llamada, WhatsApp, correo y horarios del sitio. El texto escrito en el HTML es solo un respaldo por si JavaScript está desactivado.

> Datos actuales: Gilberto A. Gomez · (813) 416-7326 · seguros: gilberto.insurance@yahoo.com · taxes: alextaxespreparer24@yahoo.com

### Cambiar la foto del retrato

En `sobre-mi.html`, dentro de `<div class="portrait">`, reemplaza:

```html
<span class="portrait__initials" aria-hidden="true">GG</span>
```

por:

```html
<img src="assets/img/gilberto.jpg" alt="Gilberto A. Gomez">
```

Guarda la foto en `assets/img/gilberto.jpg` (vertical, 800×1000 px aproximadamente).

---

## 3. Logotipos

El sitio ya usa dos marcas: el escudo para seguros y la marca dorada para taxes.

- `assets/img/logo-seguros.svg` — escudo (seguros y anualidades).
- `assets/img/mark-taxes.svg` — sello dorado (taxes).
- `assets/img/favicon.svg` — icono de la pestaña.

### Usar tus archivos originales

Guarda tus imágenes en la carpeta `assets/img` con estos nombres exactos:

| Archivo | Se usa como |
|---|---|
| `logo-seguros.png` | Logotipo principal en el encabezado y el pie |
| `logo-taxes.png` | Tarjeta de marca de la página de taxes |

El sitio detecta esos archivos automáticamente (atributo `data-logo-png`) y sustituye el marcador. No hace falta tocar el HTML.

> Recomendación: usa PNG con fondo transparente y al menos 400 px de ancho para que se vea nítido en pantallas retina.

---

## 4. Estructura

```
index.html            Inicio
vida.html             Seguro de vida + calculadora de cobertura
salud.html            Salud + lista de documentos (se guarda en el navegador)
anualidades.html      Anualidades + estimador de ingreso
taxes.html            Taxes + generador de lista de documentos imprimible
sobre-mi.html         Biografía y credenciales
contacto.html         Tarjetas de contacto por servicio + formulario
404.html              Página de error

assets/css/styles.css       Todo el diseño (colores, tipografía, componentes)
assets/js/site-config.js    Datos de contacto editables
assets/js/main.js           Navegación, asesor, acordeones, formulario
assets/js/tools.js          Calculadoras y listas de verificación
assets/img/...              Logotipos e iconos

_partials/header.html       Encabezado compartido
_partials/footer.html       Pie compartido
build.ps1                   Reconstruye el encabezado/pie en todas las páginas
```

### Editar el encabezado o el pie

El encabezado y el pie se repiten en todas las páginas para que el sitio funcione sin servidor. Para cambiarlos en un solo lugar:

1. Edita `_partials/header.html` (barra superior, menú, botón de menú móvil) o `_partials/footer.html`.
2. Ejecuta en PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\build.ps1
```

El script localiza el bloque actual en cada página (o los marcadores `<!-- @@HEADER@@ -->` / `<!-- @@FOOTER@@ -->` si todavía existen) y lo reemplaza por la versión actualizada. Puedes ejecutarlo tantas veces como quieras; es idempotente.

> Si editas el encabezado directamente dentro de una página, el siguiente `build.ps1` lo sobrescribirá. Hazlo siempre en `_partials/`.

Los cambios de contenido del cuerpo (textos, secciones, precios) se editan directamente en cada archivo `.html`.

---

## 5. Formulario de contacto

Por defecto, el formulario arma un correo con los datos y abre la aplicación de correo del visitante; además muestra un botón para enviarlo por WhatsApp.

Para recibir los envíos en un panel o por correo sin depender del cliente de correo:

1. Crea una cuenta gratuita en [Formspree](https://formspree.io) (o usa Netlify Forms).
2. En `contacto.html`, cambia:

```html
<form class="tool form" id="contact-form" data-endpoint="">
```

por:

```html
<form class="tool form" id="contact-form" data-endpoint="https://formspree.io/f/TU_CODIGO">
```

El script enviará el formulario por `fetch` y mostrará el mensaje de confirmación automáticamente.

---

## 6. Personalización visual

En `assets/css/styles.css`, bloque `:root`:

- `--blue`, `--blue-2` → color de la línea de seguros.
- `--gold`, `--gold-2`, `--gold-deep` → color de la línea de taxes.
- `--navy` → fondo de secciones oscuras y encabezado del asistente.
- `--font-display` / `--font-body` → tipografías (se cargan desde Google Fonts en cada página).

---

## 7. Antes de publicar: pendientes importantes

1. **Dominio:** el sitio está publicado en `https://gilbertagt42-dot.github.io/Seguros-Y-Taxes/` y esa URL aparece en `canonical`, `og:image`, `sitemap.xml`, `robots.txt` y `site-config.js`. Si conectas un dominio propio, reemplázala en esos archivos (8 HTML + `sitemap.xml` + `robots.txt` + `site-config.js`) y añade un archivo `CNAME` con el dominio.
2. **Testimonios:** los tres de `index.html` son ejemplos de maqueta. Sustitúyelos por testimonios reales con autorización del cliente, o elimina esa sección. No publiques testimonios inventados.
3. **Números de licencia:** agrega tu número de licencia de seguros de Florida y tu PTIN en `site-config.js` y en el pie de página.
4. **Aviso de privacidad:** si vas a recolectar datos por formulario, conviene una página de política de privacidad (requisito en varios estados y en las reglas de Google Ads).
5. **Cumplimiento:** revisa que cualquier material de Medicare cumpla las reglas de CMS (no puede prometer beneficios ni usar lenguaje de "mejor plan"). Si haces campañas de Medicare, se necesita capacitación y aprobación de la aseguradora.
6. **Correos Yahoo:** funcionan, pero un correo con tu dominio (`hola@tudominio.com`) transmite más confianza y mejora la entregabilidad.

---

## 8. Accesibilidad y rendimiento

- Navegación con teclado, enlace "saltar al contenido", `aria-expanded` en menú y acordeones.
- Respeta `prefers-reduced-motion`.
- Sin librerías externas de JavaScript; solo Google Fonts.
- Imágenes SVG (ligeras) y estilos críticos en un solo archivo.
- Formularios con etiquetas asociadas y mensajes de error accesibles.
