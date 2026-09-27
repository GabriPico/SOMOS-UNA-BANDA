# Panel según la nueva referencia · 2026-09-27

La última imagen del usuario es la referencia principal. Se ha creado una base
nueva a partir de esa composición mediante la herramienta integrada imagegen,
retirando el HUD y el teléfono estáticos, vaciando los datos del corcho y dando
espacio al teclado del portátil. Una última edición hace irregular el rayado de
EQUIPO. No se han adaptado los dos fondos anteriores; se conservan sin uso.

## Asset activo

- public/assets/materials/club-panel-reference.png
- PNG, 1619×971 px, 2 097 763 bytes.
- Contiene únicamente la habitación y los siete nombres físicos pedidos.
- No contiene fecha, partido, escudos, equipos, puntos, selección ni teléfono.
- Imagen y datos comparten el plano proporcional de la escena.
- La iluminación cálida sigue la referencia. El reloj real sigue independiente.

## Archivos de esta entrega

Creados:

- public/assets/materials/club-panel-reference.png
- docs/CLUB_PANEL_REFERENCE.md (este registro y los prompts exactos)

Modificados sobre la implementación existente:

- src/components/AppShell.tsx: variante is-club-panel e icono de calendario;
  las acciones, fecha y rival existentes permanecen.
- src/components/InteractiveClubScene.tsx: se retiran títulos HTML duplicados;
  permanecen los datos reales del partido, emblemas y clasificación.
- src/components/SceneHotspot.tsx: nombre accesible «Ir al Vestuario».
- src/screens/ClubPanelScreen.tsx: comparte proporción y límites funcionales
  del encuadre mediante variables CSS.
- src/screens/ClubPanelScreen.css: HUD navy translúcido, origen limitado por
  los objetos, hover sutil, datos sobre papel y encaje de ventanas pequeñas.
  Caveat se reutiliza para los datos; Kalam se conserva como asset anterior.
- src/presentation/clubSceneHotspots.ts: registro de los siete objetos en la
  nueva ilustración, normalizado a porcentajes y máscaras de material.
- docs/CLUB_PANEL_HUB.md
- docs/VISUAL_SYSTEM.md
- docs/VISUAL_ASSETS.md
- docs/DECISIONS.md

No se modifican los cambios ajenos ya presentes en el árbol. No se añaden
dependencias, rutas ni lógica de dominio. No hay funcionalidad nueva inactiva.
No se hace commit ni push.

## Encuadre, grabado e interacción

El único fondo se prolonga detrás del HUD real semitransparente. Se conserva
su proporción y se limita el origen con los extremos de todos los hotspots;
VESTUARIO queda bajo la cabecera y el portátil completo dentro del área visible.
En los cuatro tamaños pedidos, la escena llena el ancho sin bandas ni blur y
solo recorta techo, borde de escritorio y otros detalles periféricos.

En móvil estrecho se permite desplazamiento horizontal dentro de la habitación,
con tamaños legibles, sin desbordamiento de página. En ventanas de paisaje muy
bajas se permite desplazamiento vertical local. La cabecera y el teléfono global
siguen accesibles. No se introduce navegación adicional.

EQUIPO se representa como seis letras manuales de alturas y anchos desiguales,
con surcos finos interrumpidos y madera clara expuesta dentro de las incisiones.
Está en el raster del tablón; no hay tipografía superpuesta, biseles ni relieve
hacia fuera. El hover ilumina la misma textura junto con las camisetas.

Los siete botones nativos conservan Tab, Enter, Espacio y aria-label. Un
clip-path limita el hit test a cada objeto; la imagen registrada dentro de SVG
aumenta ligeramente su luminosidad. Entrenamientos usa contornos separados y
una máscara de conos, papel, celo, petos, ropa, balones y soportes, sin rectángulo
envolvente. Los datos del corcho proceden de getClubPanelPresentation.

## Verificación

Vite ejecutado en http://127.0.0.1:5173. Chrome aislado con perfil temporal:
1920×1080, 1600×900, 1440×900 y 1366×768; cobertura, siete objetos completos
y siete hovers/clics por tamaño, papeles sin desbordamiento, foco, Tab,
Enter/Espacio. Teléfono global probado desde varias pantallas con contador real;
tutorial real de Staff y Mensajes. También 390×844 y 780×390, con navegación
local y teléfono. Cero errores de consola. Capturas en .panel-check.local,
excluido por la regla *.local existente.

Build, lint, diff check y 129 tests correctos. Permanece el aviso anterior
del bundle de más de 500 kB. No se cambia la simulación ni el avance temporal.

## Prompts exactos · herramienta integrada imagegen

### 1. Extracción de la habitación de la nueva referencia

La última imagen adjunta del usuario se incluyó como única imagen de referencia.

```text
Use case: precise-object-edit.
Target: the user's newly attached FC POBLENOU club Panel screenshot. It is the PRIMARY visual reference. Make the clean production room background from THIS image, not from any older room.
Preserve its exact amateur hand-painted videogame style, warm sunlight, modest weathered cream plaster and navy lower walls, left window and radiator, four hanging blue-white striped shirts on the wooden rack, tactical board, central equipment rack with cones/bibs/balls, open navy door and complete VESTUARIO sign, two right cork notice boards, benches, foreground staff laptop with yellow post-it, desk and office objects.
Remove the entire top HUD/navigation strip (crest, club title, dates, fixture button and CONTINUAR) and the lower-right Messages widget. Reframe the room itself into one seamless landscape background at approximately 1.86:1 aspect ratio. Do not draw any interface, panels, cursor or hover outlines. The door currently has a selected blue outline in the screenshot: REMOVE it; all objects must be unselected.
Keep all seven functional objects COMPLETELY visible and safely inside x=5%..95%, y=6%..94% of the final canvas, including complete VESTUARIO sign, both notice board corners, entire laptop display and keyboard. If required add a little plain ceiling/wall and foreground desk/floor to give them space; no left/right blur, mirrored edges, duplicate background, letterboxing or borders. Preserve the reference's object size and composition as faithfully as possible.
Keep these exact STATIC physical section names only, in the reference's original surface handwriting/style: EQUIPO scratched into the wooden rack; Tácticas handwritten on whiteboard; Entrenamientos handwritten on slightly crooked cream paper taped to shelf; VESTUARIO on complete aged sign over door; Próximo partido handwritten at top of upper pinned corkboard paper; Clasificación handwritten at top of lower pinned paper; Staff handwritten on yellow laptop post-it. EQUIPO must remain very thin, uneven, shallow pale raw-wood scratches/incisions, like names scratched with a nail into an old desk. NOT raised or beveled letters, NOT marker or clean digital overlay. All letters stay inside their physical surface.
Erase ALL DYNAMIC GAME DATA from the two corkboard papers: remove both crests, versus, club names, date/time, competition, standings team names, rankings, points and table headings, leaving only their physical static titles plus blank space and subtle paper ruled lines. The app will supply all of those real dynamic data. Do not reproduce any particular date or match in the art.
No invented extra writing, numbers, logos, watermarks or UI. No people. One consistent room illustration; do not redesign its furniture or camera. Maintain clean open space on the lower-right floor for the real global phone overlay.
```

### 2. Encuadre inferior del portátil

Se editó la primera salida para completar el portátil dentro de la composición.
El tamaño real devuelto fue 1620×971.

```text
Use case: precise-object-edit. OUTPAINT ONLY the bottom of this room illustration. Preserve all existing scene objects, handwriting, camera, proportions and positions. Keep width 1711. Extend the canvas DOWNWARD by approximately 90 pixels from 919 to about 1009 pixels (landscape around 1.70:1). Complete the laptop's lower display edge and keyboard, showing them fully, then continue the same foreground wooden desk and its natural objects into the extra lower space. All of the staff laptop including keyboard must fit above 94% of the final canvas. Do not crop the original image or shift the wall objects. The added bottom is only ordinary wooden desk continuation, no new meaningful navigation objects, writing or UI. Existing static titles EQUIPO (shallow thin wood scratches), Tácticas, Entrenamientos, VESTUARIO, Próximo partido, Clasificación, Staff stay unchanged. Both noticeboard papers stay empty below their existing titles. No header, message widget, data, numbers, crests, hover glow, letters beyond the existing titles, duplicated edges, blur or borders. Output one seamless finished painted room.
```

### 3. Incisiones manuales de EQUIPO

Se editó el asset local de 1620×971 inspeccionado previamente. La herramienta
devolvió 1619×971; se conserva la salida original sin manipulación posterior.

```text
Use case: precise-object-edit.
This is the FINAL production background for an interactive 2D amateur football club videogame. Change ONLY the six letters EQUIPO on the wooden rack above the shirts. Preserve ALL other pixels, objects, static surface titles, blank ruled notice papers, camera, lighting, proportions, object positions, canvas dimensions (1620 wide x 971 high), staff laptop and keyboard. Do not crop, extend, rescale or recompose the image. No UI.
The current EQUIPO letters are much too even and typographic. Replace those six letters with clearly HAND-SCRATCHED INCISIONS in the varnished old wood, exactly the uppercase word E Q U I P O in the same space. Like a player scratched his name with a nail or pocket knife into an old school desk. Very rough, amateur, manually cut, unsteady crooked strokes, irregular letter heights and widths, several interrupted overlapping fine cuts where the tool slipped, jagged fibers and scratch endings. Pale raw wood exposed deep INSIDE very narrow scratched grooves, with a tiny dark edge and subtle recessed depth. Wood grain breaks the strokes and remains continuous. Uneven loop shapes Q, P, O, roughly scratched NOT a perfect font, irregular verticals E,I. Readable but visibly handmade. Shallow physical scratches BELOW the plank surface, absolutely no raised letter, embossed edge, extruded bevel, painted marker, chalk, polished lettering or neon. Do not add other words. All of EQUIPO fits INSIDE the existing wooden plank, not protruding beyond it. Preserve the room's detailed warm painted illustration style. Output ONE clean room image of the same size with all other areas preserved.
```
