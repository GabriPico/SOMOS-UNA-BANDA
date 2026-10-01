# Panel según la nueva referencia · 2026-09-27

La versión activa recompone la misma habitación de las referencias del usuario
en una ilustración 2D/2.5D de proporción 2:1. Se genera mediante imagegen integrado
para cubrir el espacio real bajo la barra, con los siete objetos completos dentro
de la composición. Las versiones anteriores se conservan como histórico.

## Asset activo

- public/assets/materials/club-panel-illustrated-wide.png
- PNG, 1774×887 px (2:1), 2 361 314 bytes. Las bases anteriores se conservan.
- Contiene la misma habitación, EQUIPO rayado y VESTUARIO. Los otros cuatro
  títulos se dibujan con trazos SVG registrados sobre sus superficies.
- No contiene fecha, partido, escudos, equipos, puntos, selección ni teléfono.
- Imagen y datos comparten el plano proporcional de la escena.
- La iluminación cálida sigue la referencia. El reloj real sigue independiente.

### Acceso a Competición y archivador de Staff · 2026-09-27

Edición localizada con imagegen integrado sobre `club-panel-handwriting-base.png`.
Se elimina el corcho inferior de clasificación, restaurando la pared azul, y se
sustituye su banco por una mesa pequeña con un portátil antiguo, taza y lápices.
El portátil grande de Staff se sustituye por un archivador con fichas y un post-it
vacío en la mesa de primer plano. Se conserva el resto de objetos y composición;
el archivo devuelto mide un píxel más de ancho que el original.

El ordenador es el único de la escena. La pantalla blanca recibe la interfaz viva
de `ClubCompetitionMonitor`: CLASIFICACIÓN en rojo y cuatro filas derivadas de la
misma tabla actual que la web. No contiene una clasificación horneada en el raster.
La palabra Staff usa los mismos gestos de tinta previos, trasladados al post-it
del archivador. Se elimina el antiguo título manuscrito de Clasificación; los
otros tres títulos manuscritos y los dos grabados originales se conservan.

Hotspots registrados: ordenador `[1329,483,109,81]`, archivador `[204,699,293,185]`.
Se mantiene el feedback de material de SceneHotspot y se actualizan las
indicaciones del tutorial. El ordenador abre Competición / Clasificación y el
archivador abre Staff. QA revisa ambos accesos, los demás objetos y el teléfono
en 1920×1080, 1366×768, 1024×768, 390×844 y 780×390.

### Corrección exclusiva de encuadre y proporciones · 2026-09-27

El Panel ocupa exactamente `100dvh`. Su grid reserva una fila `auto` para la
altura real de la barra y `minmax(0, 1fr)` para la escena. El padding DEV ya
forma parte de esa altura: no se descuenta otra vez. Se retiran el margen
negativo bajo el HUD, las alturas mínimas de habitación y los dos breakpoints
que habilitaban scroll. No se modifica el diseño ni las acciones del HUD.

`club-panel-screen` es un contenedor de tamaño. La imagen y todos los overlays
comparten una escala uniforme calculada con `cqw/cqh` sobre el espacio útil.
Se utiliza la escala de cobertura mientras caben los límites de todos los
hotspots con margen; si la relación de aspecto lo requiere, esa escala se
limita al espacio necesario para conservar los objetos completos. `clamp`
posiciona la imagen, sacrificando únicamente extremos decorativos. En los dos
formatos desktop solicitados cubre toda la superficie sin bandas vacías y sin
reducir el tamaño general de los objetos.

El archivador original se traslada 55 px hacia arriba y 15 px a la izquierda,
sin cambiar su tamaño: `[189,644,293,185]`. Su Post-it SVG conserva los gestos
de tinta y se traslada por el mismo vector. El portátil original aumenta un
30% manteniendo el apoyo sobre la mesa: `[1311,459,142,105]`. Se recalibran
únicamente esos dos hotspots, conservando IDs, destinos y feedback. El monitor
mantiene los datos reales; CLASIFICACIÓN crece y domina sobre tres filas.

La herramienta integrada imagegen restaura solo el escritorio bajo la antigua
posición de Staff. El empaquetado local coloca el mismo archivador y redimensiona
el mismo portátil; no se acepta una regeneración completa de la habitación.
Comparación de buffers: 93 277 píxeles diferentes dentro de las zonas autorizadas,
cero fuera. Se conserva `club-panel-competition.png` como base anterior.

Archivos de esta iteración: `screens/ClubPanelScreen.css`,
`presentation/clubSceneHotspots.ts`, `presentation/clubHandwriting.ts`,
`components/ClubCompetitionMonitor.tsx`, el nuevo asset y documentación.
No cambian App, navegación, simulación, Mensajes ni el resto de objetos.

QA sobre la app real con Chrome headless a viewport 1366×768 y 1920×1080,
tanto con la reserva DEV como sin ella. Se comprueban todos los límites,
hit tests de cada objeto, siete accesos/retornos y apertura/minimización de
Mensajes. Sin scroll, sin bandas vacías y sin intersección portátil/Mensajes.
Staff deja 53 px y 88 px de margen inferior respectivamente sin la barra DEV.
Capturas inspeccionadas: `.competition-qa.local/framing-final-1366.png` y
`framing-final-1920.png`. Scripts, fixture y evidencias excluidos de producción.
Build, lint, diff check y 133 tests correctos; persiste el aviso previo de bundle.

Prompt de restauración aceptada, herramienta integrada imagegen:

```text
Use case: precise-object-edit. Edit the supplied existing 1620x971 room. REMOVE ONLY the cardboard file box in the lower left foreground, including every protruding folder and its blank yellow post-it, currently at x204..497,y699..884. Restore uninterrupted wooden desktop and any tiny floor area behind the removed box, matching the existing desk perspective, grain, sunlight and warm painted illustration. This is an empty desk restoration for production compositing, NOT a room redesign. Preserve the neighboring penpot at x102..184, books to left, chair to right, clipboard and every other object exactly. No box remaining, no post-it, no folders, no new object. Leave laptop on right desk and EVERYTHING else unchanged. Same 1620x971 canvas, exact camera, no crop, no zoom. All pixels outside the removed box and its small shadow area must be unchanged.
```

### Regeneración ilustrada para la proporción real · 2026-09-27

Antes de generar se miden los componentes reales a viewport exacto, sin incluir
la reserva DEV en la referencia de producción:

| Viewport | Barra | Área útil bajo la barra | Proporción útil |
| --- | ---: | --- | ---: |
| 1920×1080 | 90,594 px | 1920×989,406 px | 1,94056:1 |
| 1366×768 | 82,797 px | 1366×685,203 px | 1,99357:1 |

No existe una única proporción idéntica para ambos tamaños porque la barra
cambia de altura. Se genera la misma habitación en 2:1, cercana a ambas, con
espacio decorativo a los extremos y los siete objetos dentro de x=14%..93%,
y=11%..88%. La salida nativa de imagegen es 1774×887, exactamente 2:1: se copia
directamente como asset, sin estirarla, recortarla ni añadir relleno.

La escena mantiene ventana, camisetas, pizarra, estantería, puerta, tablón,
portátil único y Staff en el mismo orden. Se extiende el espacio de habitación
y se cambia el acabado a texturas e iluminación pintadas, formas simplificadas
y bordes definidos. Staff y su base dejan margen inferior; el portátil y el
tablón quedan separados del extremo derecho. No hay UI global horneada.

El papel de Entrenamientos mide aproximadamente 126×38 px y solo aloja una
línea de escritura. Se recalibran los cuatro títulos SVG; TÁCTICAS es mayúscula,
centrada con 25/24 px de margen en el marco y tilde propia sobre la A. Se añaden
gestos de mayúsculas al mismo alfabeto manual. Los dibujos tácticos e imanes
siguen en el raster; los datos de partido y clasificación siguen siendo vivos.

El CSS conserva el grid de altura real de HUD, pero elimina el límite de escala
que podía reducir la imagen y dejar bandas. `max(100cqw, 100cqh * ratio)` equivale
a cover uniforme sobre el área disponible; se centra la escena y sus overlays.
A 1920 se recortan unos 29 px decorativos por lado; a 1366, unos 2 px por lado.
No existe modo contain, relleno gris ni recorte de objetos interactivos.

Registro nativo de los siete hotspots (normalizado a porcentajes por el módulo):

| Objeto | x, y, ancho, alto |
| --- | --- |
| Equipo | 248, 223, 367, 242 |
| Tácticas | 626, 235, 185, 274 |
| Entrenamientos | 826, 136, 230, 516 |
| Vestuario | 1072, 103, 299, 546 |
| Próximo partido | 1394, 166, 251, 176 |
| Competición | 1422, 420, 138, 100 |
| Staff | 275, 597, 299, 179 |

Se redibujan los contornos de camisetas y material para sus nuevas posiciones.
`ClubHandwrittenHeadings` consume las dimensiones exportadas del mismo registro,
evitando otro viewBox de escena independiente. Se mantiene SceneHotspot, IDs,
destinos, controles nativos, mensajes, tutorial y acciones del juego.

Archivos de esta iteración: nuevo asset, `clubSceneHotspots.ts`,
`ClubPanelScreen.css`, `ClubPanelScreen.tsx` (solo variables de encuadre),
`ClubHandwrittenHeadings.tsx`, `clubHandwriting.ts`, `ClubCompetitionMonitor.tsx`
y documentación. Sin dependencias, lógica de dominio ni funciones inactivas.

QA real en 1920×1080 y 1366×768: cobertura completa, cero scroll, siete hit tests,
siete accesos/retornos, apertura/minimización de Mensajes y ausencia de solapamiento
con el portátil. Staff deja 124 y 86 px de margen respectivamente. También se
comprueba la reserva DEV y el feedback registrado sobre camisetas y material.
Capturas inspeccionadas en `.competition-qa.local/wide-panel-1920.png`,
`wide-final-1366.png`, `wide-focus-squad.png` y `wide-focus-training.png`.
Build, lint, diff check y 133 tests correctos; persiste el aviso previo de bundle.

Prompt de regeneración, herramienta integrada imagegen (referencia local:
`club-panel-composition.png`):

```text
Use case: style-transfer plus precise composition extension.
Asset type: production 2D/2.5D game-room background, scenery ONLY.
Edit target/reference: the supplied current FC Poblenou amateur football room. Recompose THIS SAME ROOM into a TRUE 2:1 wide canvas, ideally 2048x1024 pixels. This aspect is essential: actual game viewport under its header is 1.94:1 to 1.99:1. The image itself must be 2:1, not the old 1.67:1. Extend painted wall/window/floor/desk space horizontally; never stretch objects, add side borders, letterboxing or blur. Keep one coherent perspective and room depth.
Art finish: clearly hand-painted 2D / 2.5D videogame adventure/management background. Simplified believable forms, painterly textures and warm painted golden-hour sunlight, slightly defined edges, controlled material detail and cast shadows. MUCH LESS photorealistic or photographic than the input. No photographic microtexture, no hyperrealism, no 3D-render plastic. Not childish cartoon, anime, flat art, extreme cel shading, pixel art or exaggerated comic.
Preserve exactly the room's object order and concepts, not redesign from scratch: far-left worn window/radiator; left wooden EQUIPO rack with four blue/white striped shirts, bench, sports bag and folded clothing; separate freestanding tactical whiteboard just right; central metal equipment rack with cones, hanging bright bibs, balls, folded clothing and modest boxes; open blue VESTUARIO doorway with illuminated locker-room benches/clothes inside; upper-right framed cork next-match paper; small right desk with ONE humble old inexpensive laptop, mug and pencil cup; foreground left wooden staff desk with the SAME cardboard file box, protruding folders and yellow post-it, pen cup/books/clipboard and chair. Preserve incidental modest balls/bottles/papers/wear/bin. No new large objects.
Safe composition: all seven whole interactive objects inside x=7%..93%, y=7%..89%. Door sign fully visible, shirts fully visible, next-match board away from top/right edge, laptop not hugging the right edge. Staff box fully visible including folders/base and front post-it, its lower corner no lower than y=86%; plenty of desk and margin BELOW it. A little edge window and foreground decoration may be expendable; meaningful objects must not be. Keep the room/objects comfortably large, don't simply shrink the entire old scene into an empty panorama.
Requested localized changes: tactical board's upper writing zone must be BLANK with balanced left/right space for a centered handwritten TÁCTICAS overlay; keep the pitch and magnets underneath. Replace the rack's huge blank sheet with a MUCH SMALLER horizontal A4-ish slip taped to the upper shelf, only tall enough for ONE line of handwriting, no 70% unused paper. Make that SMALL slip blank for the game's ENTRENAMIENTOS overlay. Keep the cones, bibs and equipment unobscured below/around it.
Laptop: ONLY ONE, current size or very slightly larger, modest old amateur-club equipment. Big enough screen for clear CLASIFICACIÓN overlay. Screen blank off-white for real live game data; not a premium/gaming computer. Yellow Staff post-it blank for the existing handmade overlay. Next-match paper blank with only faint ruling for real game crests/names/date; no baked false results/data.
Allowed painted physical text ONLY: EQUIPO, rough handmade worn writing/incisions on its wood; VESTUARIO on the existing aged door sign. All other word areas intentionally blank: the game overlays TÁCTICAS, ENTRENAMIENTOS, Próximo partido, Staff and CLASIFICACIÓN on those physical surfaces. No invented writing, slogans, graffiti or environmental text.
NO global game header, FC Poblenou heading, header crest/date/Continue/button, phone/Mensajes widget, cursor, glow/hovers, UI panels, desktop borders, federation wall sign, second computer or people. The complete 2:1 art must run edge-to-edge and top-to-bottom and depict only this illustrated room.
```

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

## Caligrafía localizada · 2026-09-27

Se corrigen exclusivamente las inscripciones. Los cinco títulos anteriores
estaban horneados en el raster; se limpia su tinta con imagegen integrado y se
aceptan únicamente cinco recortes pequeños con borde suavizado. El resto de la
imagen procede del original. Una comparación de buffers confirma 16 366 píxeles
cambiados dentro de esos recortes y cero fuera; EQUIPO y VESTUARIO son idénticos.

Los títulos nuevos utilizan gestos SVG dibujados expresamente, sin fuentes:
letras abiertas, alternativas para letras repetidas, alturas, separaciones,
líneas base e inclinaciones desiguales y pequeños solapamientos de tinta que
varían la presión dentro de un trazo. Su arte es fijo y reproducible.

- Tácticas: rotulador azul más grueso, cerca del margen izquierdo de la pizarra.
- Entrenamientos: trazo más fino y comprimido, inclinado sobre su hoja con celo.
- Próximo partido: rotulador sobre papel, empezando después de la chincheta.
- Clasificación: escritura algo más ligera y otra inclinación y proporción.
- Staff: tinta oscura más estrecha y torcidamente escrita sobre el post-it.
- EQUIPO: se mantiene el rayado de la madera, sin añadir tinta ni geometría.
- VESTUARIO: se conserva íntegramente.

Los datos del partido reutilizan Kalam local con líneas suavemente inclinadas
y distintos márgenes; las filas de clasificación conservan Caveat y pequeñas
desviaciones de escritura sin alterar columnas, datos ni cálculos. No cambia la
composición, el encuadre, el responsive, los hotspots, el HUD ni Mensajes.

Archivos modificados o creados: `src/components/ClubHandwrittenHeadings.tsx`,
`src/presentation/clubHandwriting.ts`, `src/components/InteractiveClubScene.tsx`,
`src/presentation/clubSceneHotspots.ts` (solo referencia de imagen),
`src/screens/ClubPanelScreen.css`,
`public/assets/materials/club-panel-handwriting-base.png`, este documento y
`docs/DECISIONS.md`. Los auxiliares de limpieza y comprobación de píxeles se
guardan en `.panel-check.local`, ya excluido por Git.

Verificación: app en Vite, inspección visual en 1280×720, 1366×768 y 390×844,
incluido desplazamiento horizontal hasta los papeles; siete botones, cinco
títulos, papeles sin desbordamiento y navegación Panel/Tácticas conservados.
Build y lint correctos, 129 tests pasan y diff check correcto. Permanece el aviso
previo de tamaño del bundle. Sin dependencias, cambios de dominio, aleatoriedad
nueva ni funcionalidad preparada pero inactiva. Sin commit ni push.

### Prompt exacto de limpieza · imagegen integrado

El target fue el archivo original inspeccionado `club-panel-reference.png`.
La salida completa generada no se utiliza como escena: únicamente sus cinco
regiones de tinta restaurada se componen sobre los píxeles originales.

```text
Use case: precise-object-edit. This is an EXISTING game room, do NOT redesign it. Remove ONLY the ink of these FIVE titles: Tácticas at the top of the small whiteboard (x542-637,y296-327), Entrenamientos on the taped sheet (x743-895,y248-275), Próximo partido at the very top of the upper right paper (x1313-1456,y212-236), Clasificación at the very top of lower right paper (x1312-1434,y407-433), and Staff on the laptop yellow post-it (x385-429,y731-754). Carefully heal just their ink with the same underlying ivory whiteboard/paper or mustard-yellow post-it material, preserving its shading and texture. Leave all those surfaces blank there, no new text, marks or symbols. Preserve absolutely all furniture, pins, tape, lighting, texture, color, camera, exact 1619x971 canvas, outlines, ruled lines below the headings, and the tactical pitch drawing. Leave EQUIPO scratches and VESTUARIO sign exactly as they are. Do NOT move any object, resize, crop, extend, redraw or improve the room. Output the same room with ONLY these five ink inscriptions removed. This is a small localized cleanup to allow the application to draw the handwritten labels itself.
```
