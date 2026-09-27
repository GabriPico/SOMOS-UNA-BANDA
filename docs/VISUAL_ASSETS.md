# Recursos ambientales del club

## Localizaciones sincronizadas · 26/09/2026

Registro activo: `src/data/clubEnvironments.ts`; render común: `ClubEnvironment`.
Se conservan las imágenes anteriores y se añaden `club-office-night.png`,
`squad-night.png`, `training-day.png`, `locker-room-night.png`, `staff-day.png` y
`staff-night.png` en `public/assets/materials/`. Las cinco parejas y sus respaldos
existen. Los nombres históricos de los assets se mantienen para no duplicarlos.

El nuevo staff es una oficina/almacén modesto. Las variantes se generaron con
imagegen integrado, conservando cámara y composición y cambiando iluminación y
exterior, sin texto ambiental legible. Prompts y uso en
[GLOBAL_UI_REDESIGN.md](GLOBAL_UI_REDESIGN.md).


## Campo de Entrenamientos ilustrado · 2026-09-24

- Recurso activo: `public/assets/materials/club-training-night-illustrated.png`,
  1672×941 px, 2.17 MB, copia íntegra de la salida de **imagegen integrado**.
- Edición de la imagen aportada por el usuario, con su composición original:
  campo municipal nocturno, focos, bar iluminado, gradas azules, redes, banquillo,
  balones, conos, petos y botellas. Ilustración 2D pintada, sin texto ni logos.
- Consumido únicamente por `TrainingScreen.css`, detrás del contenido y fuera
  de header/sidebar. Se conservan el original del usuario y los demás escenarios.
- [Prompt final y procedencia](TRAINING_BACKGROUND_PROMPT.md).

## Ventana, fotografía antigua y trofeo · 2026-09-16

- Archivo de producto: `public/assets/materials/club-office-context.png`.
- Generado con la herramienta integrada **imagegen**, sin CLI ni API externa.
- Original conservado: PNG de 2172×724 px, 2.13 MB; no se han editado los retratos
  de jugadores. Se sirve como asset local independiente del bundle JavaScript.
- Escena ficticia de ambiente, sin datos del historial del club ni personajes
  identificados. Desde la revisión del 17 de septiembre se reutiliza como fondo
  de toda la pared del contenido de Equipo y del perfil. Una transición de yeso
  une su borde superior con la pared; se elimina el recorte `ClubRoomContext`.
  Los documentos cubren parte del ambiente según la resolución. No participa
  en el modelo de partida y no se ha regenerado ni editado el PNG.
- La foto y el trofeo se eligieron para aportar historia y uso cotidiano con pocos
  objetos. El menú lateral queda libre de decoración.

### Prompt final

```text
Use case: photorealistic-natural. Asset type: subtle environmental background detail for the management game of a fictional humble amateur football club in Barcelona, 4a Catalana. Create ONE very wide horizontal photographic vignette, approximately 3:1 aspect ratio, frontal eye-level view of the upper part of a small municipal football club office / changing room. Warm beige plaster wall, lightly aged but maintained and used each week. On the left, a modest high three-pane window in old off-white painted metal, with a partial glimpse of faded grass, chain-link fence and a little white goal outside. On the right, a small inexpensive dark wooden frame containing a faded black and white 1980s amateur team group photo (adult men in plain dark and white striped shirts, faces small and indistinct), resting on a narrow worn wooden wall shelf beside ONE small tarnished brass football trophy with a dark plinth. Only these few objects. Documentary realism, natural diffuse daylight from the window, slight ordinary imperfections, muted warm cream, dusty navy, olive green and brown, soft natural contact shadows. Composition: the window and shelf grouping form a coherent quiet horizontal strip, all objects fully inside the image with a little blank plaster margin around the edges so it can be softly blended into the UI wall. No foreground furniture, no big scenery, no contemporary objects, no labels, no text, no dates, no emblems, no logos, no slogans, no watermark. Do not render a UI or mockup. It should feel like an authentic photograph of ordinary working football facilities, never a vector illustration, theme pub, museum or abandoned building.
```

## Oficina de Mensajes · 2026-09-17

- Archivo de producto: `public/assets/materials/club-messages-office.png`.
- Generado con la herramienta integrada **imagegen**, sin CLI ni API externa.
- PNG original de 1536×1024 px, 2.39 MB; copiado al proyecto sin modificar
  la imagen existente de Equipo ni los retratos.
- Fondo exclusivo de Mensajes: oficina modesta con mesa, portátil viejo,
  taza, llaves, azulejo azul, ventana al campo y equipación. La repisa y la
  fotografía son ficticias, sin significado histórico o deportivo en la partida.
- El móvil, mensajes, nombres, fechas y controles se representan en HTML/CSS
  por encima de esta fotografía. No están incrustados en la imagen.
- Referencias: descripción del encargo y materiales ya aprobados en el proyecto.
  Los adjuntos de texto no incluían la imagen mencionada en el encargo.

### Prompt final

```text
Use case: photorealistic-natural. Asset type: local environmental background for the Messages screen of a humble amateur football manager game in Barcelona, 4a Catalana. Create ONE wide landscape photograph, about 3:2 aspect ratio, of a small improvised club office next to the changing room, matching warm beige plaster, muted navy paint, dusty blue square ceramic wall tiles, worn medium brown wood and ordinary metal. View slightly down onto a large worn desk across the lower third, back wall across upper two thirds. IMPORTANT composition for functional UI overlay: the leftmost 30 percent and center 35 to 75 percent must remain visually quiet, largely plain wall and empty wooden desk, because a conversation list will cover left and a large live smartphone will cover center. Do NOT render any smartphone, screen UI, mockup, text or lettering. On the far right of the desk, between 78 and 98 percent of image width, place an old small open charcoal laptop angled toward center, unbranded thick bezel, dim blank gray screen and clearly visible worn keyboard; a plain cream mug and small ring with two keys beside it. High on the right wall a small metal coat hook with one dark navy training jacket, and a modest shelf with a single small tarnished trophy and a tiny old black-and-white team photo with indistinct faces. A modest high window upper left shows a sliver of grass and a chain-link fence outside. Keep objects few and credible, empty desk visible in foreground and center. Soft natural warm daylight, documentary realism with material detail, calm matte surfaces and gentle contact shadows, maintained and lived-in municipal facilities, not luxury or derelict. No people in room, no logos, no slogans, no inspirational writing, no wall phrases, no labels, no watermark, no decorative typography. No neon, no glossy high-tech colors, no abstract background. The entire photograph should remain sharp enough to recognize ordinary objects, subdued enough behind a readable UI.
```

## Mano con smartphone para Mensajes · 2026-09-22

- Archivo de producto: `public/assets/materials/club-phone-hand.png`.
- Generado con la herramienta integrada **imagegen**, usando la imagen del
  usuario como referencia de pose y materiales. Sin CLI ni API externa.
- PNG de 1024×1536 px, 1.64 MB, con canal alfa real comprobado. Copia íntegra del
  recurso generado, sin editar los assets previos.
- Mano totalmente cubierta por guante y manga oscuros. Teléfono frontal vacío,
  sin mensajes, lemas ni datos de la partida. La UI real se coloca por encima.
- Rectángulo de montaje observado: origen (365, 116), tamaño 494×1024.
  Pantalla interior: desplazamiento (26, 23), tamaño 440×975. CSS mantiene
  estas proporciones para que el marco y la mano acompañen a la interfaz.

### Prompt final

```text
Use case: compositing. Asset type: transparent photographic foreground for a football management game's existing interactive Messages UI. The attached screenshot is a STYLE AND POSE REFERENCE ONLY, not the image to reproduce. Generate ONE portrait PNG, 1024x1536, with a genuinely transparent alpha background. Subject: a single hand wearing an ordinary matte dark navy knitted glove and a navy sweatshirt sleeve, holding a modern slim vertical black smartphone, as in the reference. Absolutely NO exposed skin anywhere. Sleeve enters from lower left; palm is behind the phone; one gloved thumb follows the outside of the phone's LEFT edge from lower half to middle; naturally curved fingertips wrap around the RIGHT outside edge at mid and lower height. Hand is secondary, naturally proportioned, not gigantic. The phone is upright, perfectly frontal and axis aligned, no rotation, no skew, no perspective distortion, because real HTML will overlay its blank screen. Smartphone outer rectangle MUST occupy x=390 to 925 and y=95 to 1265 in the 1024x1536 canvas (width535,height1170, narrow modern phone ratio about 1:2.19). Slim rounded dark graphite frame, no side visible, no rear visible. Blank uniform warm ivory screen inside a thin black bezel, rounded screen corners, tiny central dark earpiece/notch at top. Keep the ENTIRE phone and ALL fingers fully in the canvas. Fingertips stay outside the front display; no glove, reflection or object crosses over the ivory screen. Show glove knit texture and modest sleeve folds, soft warm daylight from upper left, photorealistic ordinary material, subtle highlights on frame, no studio gloss. No room, no furniture, no floor, no table, no added backdrop, no opaque black or checkerboard background, alpha transparency only outside the hand/phone. No writing, no screen contents, no UI, no logos, no slogans, no watermarks. The exact front-facing rectangular device and invisible skin are critical.
```

## Fondo de Estado del vestuario · 2026-09-22

- Archivo de producto: `public/assets/materials/club-dressing-room.png`.
- Generado con la herramienta integrada **imagegen**, sin CLI ni API externa.
- PNG original de 1672×941 px, 1.96 MB, copiado íntegro al proyecto.
- La fotografía adjunta del usuario se usa como inspiración arquitectónica:
  azulejos claros, ventanas altas, bancos de madera y pizarra de fútbol. Se añaden
  una bota suelta, dos cantimploras viejas y cinta deportiva, como se solicitó.
- Escena vacía, sin personajes, textos ni datos de partida. El fondo solo se
  aplica al contenido de Estado del vestuario, con todos los documentos en HTML.
- No sustituye ni modifica los recursos de Equipo, Tácticas o Mensajes.

### Prompt final

```text
Use case: photorealistic-natural. Create ONE landscape photographic background image for the existing Estado del vestuario screen of a humble amateur football management game in Barcelona, 4a Catalana. Inspired by the user's attached reference of an ordinary municipal football changing room: small beige square tiled walls, high off-white metal windows, a small green tactics chalkboard with a football pitch on the back wall, long simple slatted varnished wooden benches on white metal legs, wall hooks and plain pale tiled floor. Use the reference as inspiration for the architecture and lived-in modest realism, not an edit. Match the game's existing warm ivory plaster and paper, muted navy painted accents, dusty olive green, worn brown wood, matte metal palette. Wide interior view from a corner at seated eye height, sensible architectural perspective, no people. High windows along top, old fluorescent ceiling lights, back wall and side walls, wooden bench runs along the right and back walls. Place just a few natural signs of use in the foreground and near the far right bench: one scuffed black football boot left loose on the floor, two old unbranded reusable water bottles, one small roll and a loose strip of white athletic tape discarded on the floor. Keep the central and left upper 70 percent visually calm because real HTML paper documents will overlay that area. Leave the lower 20 percent as visible floor and bench legs with these subtle objects. Soft daylight with warm neutral white balance, believable maintained municipal facilities, documentary photograph, natural imperfections and restrained color, gentle shadows. Wide landscape approximately 16:9 at high resolution. No people, no rendered UI, no labels, no readable writing, no words, no lettering, no slogans, no brand logos, no watermark, no luxurious gym lockers, no derelict ruin. Only the environmental background asset; all readable information will be actual interactive HTML.
```

## Mano en sombra para Mensajes · 2026-09-22

- Archivo activo: `public/assets/materials/club-phone-hand-shadow.png`.
- Edición con la herramienta integrada **imagegen** de `club-phone-hand.png`,
  conservado como versión anterior. Sin CLI ni API externa.
- PNG de 1024×1536 px, 1.44 MB, copiado íntegro con alfa real comprobado.
  La mano tiene pulgar, palma, dedos y pliegues naturales sin textura de guante.
  La muñeca enlaza con la manga oscura; la mano permanece en gris y sombra.
- El resultado conserva la anchura del teléfono, pero acorta ligeramente su
  altura respecto al recurso anterior. Montaje observado: origen (365, 114),
  marco 494×994; pantalla interior (26, 25), 440×944. CSS registra ambos ejes
  sobre el tamaño exterior anterior de 494:1024 para conservar la composición.
- `grayscale(1) brightness(.68)` se aplica solo a la fotografía en Mensajes.
  El chat HTML permanece iluminado y legible, sin filtros ni rotaciones.
  No se modifica el fondo del despacho ni ningún recurso compartido.

### Prompt final

```text
Use case: precise-object-edit.
Asset type: transparent photographic foreground for an existing interactive football management game's Messages screen.
Edit target: the provided local 1024x1536 PNG of a gloved hand holding a phone. Change ONLY the gloved hand into a natural BARE HUMAN HAND almost entirely in deep neutral shadow. Keep the dark sweatshirt sleeve at the wrist.
CRITICAL INVARIANTS: Preserve EXACT canvas 1024x1536, EXACT phone position, size, upright axis alignment, graphite bezel, blank ivory screen and notch. The phone outer bounds are x=365 y=116 width=494 height=1024. The blank display bounds are x=391 y=139 width=440 height=975. Phone left and right edges must remain perfectly vertical and top horizontal. Do not tilt, rotate, skew, widen or move the phone. Real HTML will cover its display, so precise registration is essential.
Hand anatomy: a recognizable human thumb naturally holding the LEFT outer edge, palm visible below/left of phone, several naturally curved bare fingertips partially wrapping around the RIGHT outer edge. Fingers naturally tapered, slightly asymmetrical with subtle joints and a very faint nail shape, no fabric whatsoever on hand or fingers. Preserve a restrained size similar to original, not oversized. No fingers over the ivory screen.
Lighting and color: hand is backlit, dark charcoal grayscale, very low-key light with subtle soft tonal variations separating thumb, palm and finger joints. Absolutely NO visible skin COLOR: no beige, pink, brown, warm tones. Do not make a painted black hand or a black glove; readable human anatomy is suggested by silhouette, subtle soft shadows and faint natural crease/nail forms, WITHOUT revealing illuminated skin. No knit, seams, fabric, rubber, leather, plastic or glove texture on hand or wrist. Sleeve may have dark navy/charcoal cloth with restrained folds and cuff. Transition dark sleeve -> small shadowed wrist -> natural hand silhouette -> phone. Screen is brightest, then bezel, then discreet hand. No bright outline or rim glow.
Background: genuinely transparent alpha outside phone, hand and sleeve. Remove any background halo/haze; keep soft photographic alpha edges, no hard cutout contour, no background, no room, no fake transparency checkerboard. Keep wrist/sleeve exiting lower-left canvas.
Photographic realism, soft natural contact shadows, ordinary human grip. Preserve the phone and all non-hand details exactly. No text, logos, UI, watermark or extra objects.
```

## Mensajes: despacho y primer plano ilustrados · 2026-09-23

- Recursos activos:
  - `public/assets/materials/club-messages-office-illustrated.png`: 1536×1024 px,
    1.95 MB, horizontal 3:2, opaco, misma resolución que el fondo original.
  - `public/assets/materials/club-phone-hand-illustrated.png`: 1024×1536 px,
    1.32 MB, con alfa real conservado y pantalla neutra para superponer el chat.
- Editados con **imagegen integrado**, sin CLI ni API externa. Copias íntegras
  de las salidas, sin cambiar las imágenes originales ni los recursos de otras vistas.
- Base de cada edición: respectivamente `club-messages-office.png` y
  `club-phone-hand-shadow.png`. Segunda entrada, solo como referencia de estilo:
  `ChatGPT Image Sep 23, 2026, 11_26_05 PM.png`, aportada por el usuario.
- Acabado semirrealista pintado: madera cálida, paredes y tejidos simplificados,
  detalles contenidos y sombras suaves. Se mantiene la composición original;
  no se incorporan la pizarra, lámpara, planta ni otros objetos de la referencia.
- Se conservan las dos capas para mantener el montaje responsive y el chat HTML
  existente. No se incrusta un segundo móvil en el fondo. El primer plano mantiene
  el registro anterior, vertical y con el filtro local de gris/brillo ya existente.
- Verificados visualmente los recursos, sus dimensiones y el alfa; no hay textos
  legibles, mensajes, logos, botones ni HUD dentro de las imágenes.

### Prompt final: despacho

```text
Use case: style-transfer. EDIT the FIRST attached image; the SECOND attached image is solely an ART STYLE reference.
Target: the current game's actual 1536x1024 horizontal office background, image 1. Preserve its EXACT 1536x1024 resolution and 3:2 landscape aspect ratio.
Restyle image 1 as a semi-realistic digitally painted football management videogame environment. Match image 2's illustrative/game-concept-art language: simplified material shapes, softly painted wood grain, restrained hand-painted edges, softened plaster and tile textures, controlled ambient lighting, gently modeled shadows, warm wooden surfaces with cooler muted blue/navy accents, readable forms and modest lived-in imperfections. A visible change away from photography is essential. It should look like the same artist painted both environments. No photorealism, no hyperreal surface detail, no photographic noise, no infantile cartoon, no anime, no heavy cel shading, no cinematic lighting or extreme contrast, no futuristic polish.
COMPOSITION LOCK: image 1 is the sole source of scene geometry, content, perspective, camera position, cropping, scale and spatial arrangement. Keep exactly the same desk occupying the lower third, same wooden chair left of center, same laptop/mug/keys arrangement at the lower right, same stationery trays and pencil holder at the far left, same cream plaster wall with navy stripe and blue square tiles, same top-left window with chainlink fence and pitch, same upper-right shelf/trophy/framed team photo, same hanging jacket, same far-right opening and bench and cropped metal cabinet. Maintain each object's approximate exact footprint. The wall and desk's quiet negative space for existing HTML UI must remain equally spacious. Retain the original daylight direction from the left; borrow the reference's painted treatment, not its time of day or dramatic lighting.
Do NOT copy image 2's composition, whiteboard, lamp, plant, ball, binders, phone, hand, curtains, nighttime setting or any other added objects. The game's existing phone and hand are a SEPARATE foreground asset, so leave them absent from this background plate to prevent a duplicate phone. They will be overlaid in code at their original position.
NO readable text anywhere; remove any tiny lettering or logos on the old laptop. No labels, wall writing, numbers, lettering on keys, text on papers, logos, slogans, UI, messages, menus, HUD, buttons, browser chrome or monitor frames. Papers may have only indistinct blank/abstract markings. The laptop screen remains neutral blank gray. Do not add major elements. Preserve original scene, transform only its artistic treatment. Output ONE final full-frame horizontal edited background, no borders, no collage, no mockup.
```

### Prompt final: móvil y mano

```text
Use case: style-transfer.
Image 1 is the EDIT TARGET: a 1024x1536 transparent foreground asset showing a shadowed bare human hand and dark sleeve holding an upright blank smartphone. Image 2 is ONLY AN ART STYLE REFERENCE from a football management videogame.
Repaint image 1 in image 2's semi-realistic digital illustration / videogame concept-art language: slightly simplified shapes, hand-painted softly modeled surfaces, controlled ambient shadows, subdued charcoal/navy, restrained edge accents, no photographic skin pores or tiny cloth fibers. Match the same painted rendering of wood/walls/light/materials in that reference when applied to this foreground subject. It must look illustrated, not a photograph or a photo with a filter. No anime, no infantile cartoon, no heavy cel-shading, no glossy hyperrealism.
LOCK image 1's exact geometry and 1024x1536 canvas. Do not shift, resize, rotate, tilt, skew or crop the phone, hand or sleeve. Preserve outer phone rectangle x=365,y=114,width=494,height=994 (ends at x=859,y=1108); preserve blank display x=391,y=139,width=440,height=944. Perfectly vertical parallel side edges, horizontal top and bottom, same rounded corners, same thin graphite bezel and central notch. The display MUST stay empty neutral ivory, with NO text, UI or messages. Its coordinates must remain exact because existing live HTML sits on top of it.
Keep the same natural thumb along the LEFT side, palm behind/below the device, curved fingertips around the RIGHT outer edge, and dark sleeve entering from the lower left. Keep existing bare human hand anatomy in DEEP NEUTRAL SHADOW, recognizable subtle joints, no visible skin color, no beige/pink/brown highlights, no fabric on fingers, NO glove. Only the sleeve has cloth texture. Soften and simplify cloth and anatomical detail to painted shapes while preserving a plausible human grip. Keep hand secondary to the phone. Avoid pure flat black, use subtle charcoal shadow gradients.
Background MUST retain genuine transparent alpha outside the original hand/sleeve/phone silhouette. No black rectangle, no checkerboard baked in, no room, no objects or composition copied from reference image 2. No background halo. Maintain clean soft alpha edges. Do not include any part of the reference's table, chair, lamp, whiteboard, window, plant, ball, jacket, computer, or UI. No logos, lettering, numbers, slogans, watermarks, HUD, menus or decorative text. Output ONE portrait transparent foreground PNG ONLY, same silhouette placement as input 1, suitable to overlay on the separately painted original office background.
```

## Mensajes: silueta de mano discreta · 2026-09-24

- Recurso activo: `public/assets/materials/club-phone-hand-subtle.png`, PNG de
  1024×1536 px, 1.22 MB, con alfa real comprobado. Edición con imagegen integrado
  de `club-phone-hand-illustrated.png`, conservado como versión anterior.
- Palma mayoritariamente oculta por el móvil; solo asoman un pulgar, dos puntas
  de dedos y la unión en sombra con la manga. Se elimina el contorno luminoso
  dominante y se atenúan los detalles anatómicos. Sin tonos de piel ni guante.
- La pantalla vacía generada ocupa aproximadamente y=140, alto=909; CSS la
  registra sobre el rectángulo del chat anterior (y=25, alto=944 en marco de 994).
  Se conservan la anchura de montaje, la geometría HTML y el filtro local de gris
  y brillo. No se procesa ni sustituye el fondo del despacho.
- Copia íntegra de la salida generada, sin CLI ni dependencias. No hay textos,
  logos, mensajes, controles o nuevos objetos incrustados en el recurso.

### Prompt final

```text
Use case: precise-object-edit.
Edit the attached transparent 1024x1536 illustrated phone/hand asset. USER CORRECTION: the hand currently reads as a large complete black hand in front of the scene. It should be only a discreet suggestion of a hand BEHIND the phone, largely concealed by the phone and by soft shadow. Do not merely recolor the same large fully visible hand to black.

LOCK THE PHONE PIXEL GEOMETRY AND APPEARANCE: keep the phone exactly in place, same width, height, perfectly vertical orientation, same frame, reflection, blank ivory screen, notch and rounded corners. Outer bounds x=365,y=114,width=494,height=994; screen x=391,y=139,width=440,height=944. The phone must not move, grow, shrink, tilt or warp. Keep exact 1024x1536 canvas, genuine alpha background. Existing live HTML is registered to those coordinates.

Change ONLY the visible hand/wrist:
- Tuck almost the entire palm BEHIND the opaque phone. Reduce the exposed hand area by around 65–75%. Remove the big broad black palm silhouette currently visible left of and underneath the device.
- Suggest a natural grip with just a narrow, soft-edged curve of thumb closely hugging the left outside bezel around its lower middle; 2 or 3 tiny partial fingertip contours peeking from BEHIND the right lower edge. Fingers must not jut out in a row as large rounded lobes.
- The phone should visually occlude most of the hand. The wrist must connect plausibly to the existing dark sleeve but sink into shadow under the phone. Keep the sleeve dark and illustrated, in the same lower-left area, with restrained existing cloth folds.
- Deep, low-contrast neutral charcoal shadow; no visible skin color. Only the smallest tonal difference hints at anatomy. Suppress the palm lines, nails, creases, knuckles and all brightly modeled surfaces. NO continuous gold/orange/white rim lighting around the hand. Remove the bright outline along the thumb and wrist. The hand must be MUCH less conspicuous than before.
- Do not create a solid uniform black cutout or a glove. No fabric on fingers, no rubber/leather finish, no exposed lit skin. Hand boundaries softly dissolve near wrist/palm; tiny contours near phone are enough to imply a human grip. No smoky glow or dark opaque rectangular background.
- The sleeve can still be recognized; the hand itself should be perceived only after the illuminated phone, quietly supported from behind. Keep the full screen uncovered and empty.

Retain the same semi-realistic hand-painted videogame illustration style, no photorealism, no anime, no exaggerated cel shading. All pixels outside the revised phone/hand/sleeve silhouette must be genuinely transparent alpha. Preserve the phone exactly. No added props, text, logos, messages, interface, watermarks or background. Output ONE transparent portrait PNG, 1024x1536.
```

## Panel: nueva referencia principal activa · 2026-09-27

- Recurso activo: public/assets/materials/club-panel-reference.png, PNG de
  1619×971 px y 2 097 763 bytes. Generado mediante imagegen integrado a partir
  de la última imagen del usuario; composición cálida y modesta equivalente.
- Se retiran HUD y teléfono de la referencia; se vacían los datos del corcho.
  Los siete títulos físicos pedidos quedan en sus superficies. EQUIPO se afina
  como letras manuales desiguales, con arañazos e incisiones interrumpidas,
  sin tipografía ni bisel superpuestos. Se completa el teclado del portátil.
- Ningún dato de juego, escudo ni estado de hover está horneado. La interfaz
  reutiliza partido, fecha y clasificación reales. HUD y teléfono son componentes.
- Los fondos club-panel-room.png y club-panel-room-wide.png quedan conservados
  e inactivos. El encuadre usa límites funcionales, sin blur ni bandas laterales.
- Inventario, decisiones y tres prompts exactos en CLUB_PANEL_REFERENCE.md.

## Panel: composición ancha anterior · 2026-09-27

- Recurso anterior: public/assets/materials/club-panel-room-wide.png, PNG de
  1774×887 px, 2:1 y 2 184 620 bytes, generado mediante imagegen integrado.
- Sustituye el fondo del Panel manteniendo el mismo concepto y las siete rutas.
  La composición reserva márgenes ambientales alrededor de los elementos
  funcionales, de modo que el ajuste a pantalla llena no corta los hotspots.
  No utiliza bandas, blur ni transparencias laterales.
- EQUIPO es una marca física rayada en la madera por petición expresa del
  usuario, sin texto SVG ni relieve superpuesto. Es la única inscripción del
  bitmap. El resto de superficies permanece vacío para la interfaz y los datos
  actuales de la partida. Sin UI ni estados de hover horneados.
- Se conserva club-panel-room.png como recurso anterior, sin uso en el Panel.
  Prompts exactos y archivos modificados en CLUB_PANEL_WIDE_ASSET.md.

## Panel: habitación interactiva anterior · 2026-09-26

- Recurso nuevo: public/assets/materials/club-panel-room.png, PNG de 1733×907 px,
  2.03 MB. Generado mediante imagegen integrado a partir de la referencia del
  usuario y copiado íntegro al proyecto. No se sustituye ningún fondo anterior.
- Ilustración de club amateur con superficies vacías para los rótulos HTML/SVG:
  perchero, pizarra, hoja con celo, cartel de puerta, dos papeles con chinchetas y
  post-it en portátil genérico. Sin UI, cursor, escritura legible ni hover fijo.
- La escena usa las dos fuentes libres locales public/assets/fonts/Caveat.ttf
  y Kalam-Regular.ttf, descargadas del repositorio oficial google/fonts. Cada
  familia conserva su licencia OFL en el mismo directorio. No son dependencias
  npm ni requieren peticiones externas al ejecutar el juego.
- El fondo mantiene la iluminación cálida de la referencia. Toda la información
  dinámica procede de la interfaz, incluido el emblema superpuesto al banderín.
  Registro y comportamiento en docs/CLUB_PANEL_HUB.md.

### Prompt final (herramienta integrada)

```text
Use case: precise-object-edit. Asset: landscape background illustration for a 2D amateur Catalan football club game. Edit the user reference image into the CLEAN ROOM BACKGROUND ONLY, preserving its exact room composition, camera angle, proportions, detailed painted videogame illustration style, warm light, worn modest white plaster / blue lower walls, shelf of hanging royal blue shirts on the left, tactical board middle-left, steel training rack center, open blue door center-right, two corkboards right, old generic laptop bottom-left and cluttered wooden desk foreground. REMOVE the entire top UI header and lower right message widget, so the output depicts only the room wall-to-wall, no UI anywhere. Remove cursor. REMOVE ALL BLUE HOVER GLOW from shirts and wood; all objects are neutral normal state. Remove ALL legible writing, logos, crests and numbers from ALL objects, especially EQUIPO wood, tactical board title, shelf paper, door sign, laptop post-it, shirt numbers, banners and next match / standings papers. Keep the physical blank surfaces for HTML overlay: wood above shirts, tactical-board upper title blank (keep pitch drawing and magnets), blank crooked paper taped to training shelf, blank aged rectangular sign above open door, blank yellow crooked sticky note on laptop, two large blank papers pinned on right corkboards. Keep tactical pitch drawing and magnets without lettering. Background photo frame may have tiny indistinguishable people but no text. Two corkboard papers must have no crests or table contents or headings; the app will render LIVE CONTENT over these papers. No text, no lettering, no numbers, no watermark, no buttons, no UI, no glowing selection. DO NOT MOVE OBJECTS. Precisely preserve relationship of room objects from reference, excluding top UI strip. Landscape aspect ratio approximately 1.94:1 (reference room below header). High resolution.
```
