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


v0.3.0: La pantalla principal muestra únicamente los registros del día seleccionado. Los días anteriores permanecen guardados en el historial y pueden consultarse con el filtro de fecha. Se agregó evidencia fotográfica a paciente, internamiento, vehículo, incidencia y nota libre. Se deshabilitó la selección de texto de la interfaz y el menú contextual, excepto dentro de campos de formulario.


v0.3.1: Se agregó identidad configurable del guardia. El nombre del guardia se guarda localmente y se captura como una instantánea en cada nuevo registro, junto con el área. Cambiar de área no cambia el guardia. Si un día hay distintos guardias usando el mismo dispositivo, los registros conservan quién estaba configurado al momento de crearlos.
