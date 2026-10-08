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


v0.3.2: Interfaz compacta y rápida; configuración, historial y compartir están en menú lateral. Placeholder genérico para nombre del guardia. Compartir fotografías usa una sola imagen comprimida (si hay varias, se combinan) para reducir problemas de WhatsApp y memoria.


v0.3.3: Corrección del error de consola causado por referencias a botones eliminados al cambiar a la interfaz con menú lateral. Se eliminaron listeners obsoletos y se restauraron los controles actuales del menú, área, guardia, historial y navegación por día. También se incrementó la caché del Service Worker.


v0.3.4: CORRECCIÓN CRÍTICA DE COMPARTIR. Los Data URL/Base64 de las fotografías ya nunca se incluyen en el texto del reporte. Una fotografía se comparte como archivo de imagen normal; si hay varias, se combinan en un único archivo para reducir problemas de WhatsApp. El texto enviado queda completamente limpio y legible.


v0.4.0: Entrada/salida reemplaza el nombre Incidencia; las tarjetas se abren al tocarlas; las salidas tienen botón para registrar automáticamente la hora de regreso; se agregó historial de navegación con botón Atrás; se agregó exportación/importación de respaldo JSON con configuración, registros y fotografías.


v0.4.1: Se corrigió el guardado de fotografías. Ahora la interfaz ofrece dos acciones explícitas: Tomar foto (cámara) y Galería. Las fotos se comprimen a un tamaño más ligero antes de guardarse localmente y se muestra una vista previa. Al editar un registro, la foto existente se conserva si no se selecciona una nueva. Se agregó manejo de error de almacenamiento.


v0.4.1b: Corrección de creación/edición: los registros nuevos siempre crean un registro independiente y ya no pueden sobrescribir accidentalmente el último. Se agregó botón ✕ Quitar foto; al editar permite conservar la foto existente, reemplazarla o eliminarla.


v0.4.2: Corrección del flujo de guardado: después de guardar un registro nuevo el formulario se cierra y no vuelve a abrirse automáticamente con los datos anteriores. Se limpian explícitamente los estados de edición y registro pendiente. Editar conserva el ID correcto para modificar únicamente el registro seleccionado.

v0.5.0
- Traslados en ambulancia reorganizados: destino/horarios, pacientes y acompañantes primero; datos propios de la ambulancia y personal después.
- Ambulancia: múltiples pacientes y múltiples acompañantes sin mezclar información.
- Pacientes: identificación y foto de identificación.
- Acompañantes: parentesco, opción Otro con texto libre, identificación y foto de identificación.
- Ambulancia: hora de salida y hora de regreso con botón tipo interruptor: tocar registra la hora actual; tocar de nuevo la elimina y permite registrar una nueva.
- Fotos: se añade fecha/hora y coordenadas GPS cuando el dispositivo las proporciona. Si no hay ubicación/conexión, la app sigue funcionando offline.
- Corregido el cierre del formulario al guardar para evitar regresar a estados anteriores del historial que podían mostrar nuevamente el formulario o el menú lateral.


v0.5.1 — Alertas internas mejoradas: mensajes de éxito, información, advertencia y error con iconos; no son notificaciones del sistema y no requieren permisos.
v0.5.2 — Horas de esquina editables: regreso de entradas/salidas, regreso de ambulancia y salida de vehículos; tocar la hora la borra y tocar de nuevo registra la nueva hora. La ambulancia conserva solo la hora de salida dentro del formulario.


v0.5.3: corrected photo counting/sharing to include nested patient/companion ID photos; all photos are combined into a single 2-column image for WhatsApp. Improved GPS capture with longer timeout, fallback positioning, and 60-second cache; GPS remains optional/offline-friendly.
