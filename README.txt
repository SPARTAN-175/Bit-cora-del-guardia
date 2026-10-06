BITÁCORA DE GUARDIA — v0.2.0

PWA totalmente offline.
Archivos en la raíz:
- index.html
- styles.css
- app.js
- manifest.json
- sw.js
- icon-192.png
- icon-512.png

Los registros se guardan únicamente en localStorage del dispositivo. Las fotos se comprimen antes de guardarse para reducir espacio.
No se envían automáticamente a ningún servidor.

Para instalar:
1. Sube todos los archivos a GitHub Pages o cualquier hosting HTTPS.
2. Abre la URL en el teléfono.
3. Usa "Instalar" o "Agregar a pantalla de inicio".

Compartir:
Cada registro tiene su propio botón "Compartir". Si el navegador permite Web Share,
aparecerá el selector de apps y puedes elegir WhatsApp. Si no, el texto se copia
al portapapeles para pegarlo manualmente.

IMPORTANTE:
Esta versión es un prototipo personal. Los datos de pacientes pueden ser sensibles;
mantén el teléfono protegido y no compartas información innecesaria.


v0.2.0: Se agregó módulo de traslados en ambulancia, hasta 2 acompañantes, hasta 2 integrantes del personal de salud, kilometraje, combustible y fotografías. Las fotos pueden incluirse en navigator.share cuando Android/navegador permite compartir archivos; de lo contrario se comparte el texto y se conserva la foto en el registro.
