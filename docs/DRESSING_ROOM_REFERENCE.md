# Vestuario: continuidad desde el Panel · 2026-09-27

El interior visible por la puerta azul del Panel es el canon. El nuevo fondo
representa esa habitación después de cruzar el umbral: paredes crema y azul
desgastado, percheros de madera, ganchos metálicos, cinco chaquetas navy, bancos
cortos de madera, toalla, botas, bolsa y botella. Una ventana alta pequeña de
seis paños y el tubo de techo mantienen la luz cálida. Sin personas ni texto.

## Assets activos

- `public/assets/materials/club-dressing-room-illustrated.png`: día, 1774×887.
- `public/assets/materials/club-dressing-room-illustrated-night.png`: noche,
  1774×887; misma composición, luz artificial cálida y exterior oscuro.
- Registro: `src/data/clubEnvironments.ts`. El fallback usa el nuevo fondo diurno.
  Las pantallas que comparten la localización locker-room reciben la misma pareja.
- Referencia: `public/assets/materials/club-panel-illustrated-wide.png`, intacta.
  Los fondos anteriores se conservan como histórico y dejan de estar activos.

Son copias directas de las salidas de la herramienta integrada **imagegen**,
sin estirado, bandas, desenfoques añadidos ni edición de píxeles posterior.
El primer resultado se corrigió únicamente para reducir la ventana a seis paños.
La variante nocturna procede de esa versión final.

## Integración

Se reutiliza `ClubEnvironment`, con `object-fit: cover` centrado. El raster 2:1
coincide casi exactamente con el espacio útil de los dos escritorios pedidos;
los recortes son periféricos y la ventana, las prendas y los bancos caben.

Las tarjetas existentes se limitan a una zona izquierda de 900–1040 px en
escritorios de al menos 1281×650. Se mantienen las tres columnas, las dos filas
y todos sus componentes, acciones y scrolls interiores. El margen superior
del resumen baja a 12 px. Debajo de ese tamaño se conserva el flujo responsive
anterior. No se modifica el hotspot, el Panel, la navegación, la partida ni la
lógica de jugadores. No había transición de entrada que necesitara ajuste.

La variante nocturna es una decisión de integración necesaria: el registro
ya distingue día y noche mediante el reloj de partida, y mantener el fondo
nocturno anterior devolvería al jugador a otra habitación.

La prueba de ficha detectó que la cabecera fija ocultaba el botón Cerrar del
modal existente. El contenido del vestuario sube a z-index 6 solo mientras
contiene ese modal. Así la ficha y su cierre quedan por encima de la cabecera,
sin modificar PlayerDetail ni sus acciones.

## Verificación

QA reproducible con los escenarios reales Club día (07:00) y Club noche
(19:30), semilla 84731, navegador headless aislado. Scripts y capturas en
`.locker-room-qa.local`, excluidos de Git y del bundle de producción.

Ocho estados combinan 1920×1080 y 1366×768, día/noche, con/sin reserva DEV.
En todos se comprueba ancho y alto completos sin scroll de página, encuadre
de ventana/chaquetas/bancos, seis secciones, expansión de las seis incidencias,
apertura y cierre de ficha, acceso a los seis jugadores mediante scroll local,
apertura/minimización de Mensajes, Ver plantilla y retorno al Panel. Cero
errores de navegador. `npm test`: 133 tests correctos; build y lint correctos.
Permanece el aviso anterior de Vite por bundle superior a 500 kB.

Archivos de esta tarea: la pareja de PNG, `src/data/clubEnvironments.ts`,
`src/screens/DressingRoomScreen.css`, este registro, `docs/VISUAL_ASSETS.md`
y `docs/DECISIONS.md`. Sin dependencias ni funciones nuevas inactivas.

## Prompts exactos · imagegen integrado

### Generación con el Panel como única referencia

```text
Use case: stylized-concept.
Asset type: production scenery-only 2D/2.5D background for an amateur football management game's dressing-room status screen, wide 2:1 canvas ideally 2048x1024.
Input image: REFERENCE ONLY, the club Panel. The small locker room visible through the open blue doorway on the right is the SOLE architectural and material canon. Do not depict the main office. Imagine walking through THAT doorway and taking one step inside, facing the same rear wall and adjacent left wall in an expanded horizontal view. Make the interior recognizable as the exact same room.
Architecture: modest small amateur changing room, aged warm cream plaster above a chipped dark blue painted lower wall at roughly half wall height. No wall tiles. The same small high horizontal wooden six-pane window is on the rear wall slightly right of center; one small ceiling fluorescent tube glows warm ivory above and towards the left. Modest short warm brown wooden benches on slender dark metal legs along back and left walls, separated naturally at the corner. Brown wooden wall hook planks with simple metal hooks, NOT black rails. Match the navy zip jackets already seen on the right rear wall through the door: a cluster of three hanging jackets below the small rear window, a couple of jackets on the left-wall rack, a pale towel folded over the left bench; many hooks remain empty. Boots tucked under both benches. Same simple cream-beige square worn floor and golden window light crossing it. Small navy sports bag under a bench and a plain unlabelled water bottle, nothing else prominent.
Camera/composition: wide horizontal interior, believable straight verticals and natural perspective, viewed from just inside the entrance looking deeper into the room, NOT facing back towards another doorway. Empty quieter cream wall across upper LEFT 45% and empty foreground floor for compact real HTML interface; keep the recognizable window, jackets, rear bench grouped in central/right 55%. The room fills the canvas edge to edge, no vignette, margins or frames. Bench/window/clothes fully inside x=7%-93%, y=10%-82%, leave peripheral safe areas for small cover cropping. Room modestly sized, not a gigantic hall. A slight irregularity, no rigid symmetry.
Style: same hand-painted 2D/2.5D videogame illustration as the reference. Simplified solid geometry, visibly painted plaster/wood, warm illustrated golden-hour light and soft shadows, handcrafted materials, modest wear, restrained detail. Not photograph, hyperrealism, glossy 3D render, anime, comic, pixel art or childish cartoon.
NO people, no UI, no title, cards, signs, words, numbers, logos, slogans, wall writing or watermark anywhere. No green chalkboard, industrial hook rails, full beige tiling, large windows, long institutional benches or old dressing-room layout. Output only the NEW interior background. Do not alter or copy the reference office or its sign.
```

### Corrección localizada de la ventana

```text
Use case: precise-object-edit. Edit ONLY the high window in this dressing-room illustration. It is currently too wide and has ten panes. Replace it with the SAME small horizontal wooden SIX-PANE window (three columns by two rows) seen through the club Panel's doorway. Reduce its width to approximately 300 pixels on this 1774 pixel wide canvas, height approximately 135 pixels, centered at the same current window center x1260/y137. Restore matching cream plaster around it. Keep warm golden light, soft shadows, and all other objects, camera, proportions, palette and hand-painted 2D/2.5D finish unchanged. Keep exactly the same benches, navy jackets, wooden hook planks, cream/navy painted walls, boots, bag and floor. Maintain this exact 2:1 canvas. No text, logos, people or UI. Output scenery only.
```

### Variante nocturna del resultado final

```text
Use case: lighting-weather. Edit target: this FINAL same dressing room background. Create its NIGHT lighting variant only. Lock the exact 1774x887 2:1 canvas, camera, perspective, small wooden SIX-PANE window, walls, chip patterns, all furniture, hooks, jackets, towel, boots, bag and bottle; do not move, add, remove, resize or redesign anything. Outside the small window is dark blue evening with indistinct tree silhouettes. REMOVE every golden sunlight patch and sunbeam/cast window-grid shadow on the left wall and floor. The sole ceiling fluorescent remains ON and gives the room simple warm amber/ivory artificial illumination with soft shadows; dark navy lower walls, cream upper walls and wood still clearly readable, never cold blue fluorescent lighting or nearly black. Same hand-painted 2D/2.5D videogame finish. No text, logos, UI, people, signs, lettering or extra objects. Only change time of day and lighting. Output scenery only.
```
