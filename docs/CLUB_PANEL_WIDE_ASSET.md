# Nuevo fondo del Panel · 2026-09-27

Generado con imagegen integrado, sin CLI/API externa. Se crea una escena nueva
y se realiza un ajuste del grabado y del papel del material. El fondo anterior
se conserva sin uso; no se altera la navegación.

- Asset activo: public/assets/materials/club-panel-room-wide.png.
- PNG de 1774×887 px, proporción 2:1, 2 184 620 bytes.
- Código modificado: src/components/InteractiveClubScene.tsx,
  src/presentation/clubSceneHotspots.ts y src/screens/ClubPanelScreen.css.
- Eliminado: src/components/CarvedTeamLabel.tsx.
- Registro actualizado: CLUB_PANEL_HUB.md, VISUAL_ASSETS.md, VISUAL_SYSTEM.md,
  DECISIONS.md y este documento.
- EQUIPO está rayado en el bitmap. El hover ilumina la copia del mismo material,
  sin letras SVG, biseles salientes ni rótulos neón.
- Full width: composición nueva con margen ambiental, plano 2:1 compartido entre
  imagen y controles. Ajuste a ancho y alto que solo recorta bordes decorativos.
  Sin capas laterales, blur ni transparencias. Todos los hotspots completos
  comprobados en las cuatro resoluciones solicitadas.

## Verificación

Verificación final: aplicación ejecutada en Vite y Chrome aislado, cuatro
resoluciones, siete hovers y clics por resolución, foco y Enter/Espacio, teléfono
y tutorial real. Cajas completas de todos los objetos y rótulos dentro del área
visible; datos contenidos en los papeles. Sin desbordamiento de página ni errores
de consola. Build, lint, diff check y 129 tests pasan. Permanece el aviso existente
del bundle. No hay funcionalidad nueva pendiente de activar. Sin commit ni push.

## Prompt de generación

```text
Use case: stylized-concept.
Asset: final background art for a 2D point-and-click amateur football management videogame, no UI.
Create an entirely NEW wide landscape illustration, EXACTLY 2:1 composition, preferably 2048x1024. A modest Catalan amateur football club's equipment office and open dressing room. Warm late afternoon interior, scuffed cream plaster above navy blue walls, worn wooden furniture, useful believable clutter. Detailed hand-painted 2D videogame background with coherent perspective and clear silhouettes, not a photograph and not a glossy 3D render.
Composition is essential: every functional object must be completely visible inside the safe rectangle x=6%..94%, y=8%..92%. Outer 6% left/right and upper 8% are only neutral walls/floor, not important objects. No object frames touch the image edges.
Left x=7..28%: old wooden horizontal jersey rack with four blue-and-white striped amateur football shirts on hangers, all jerseys fully shown. The wooden horizontal plank has the exact word EQUIPO physically scratched by hand into the wood. This is the ONLY readable text anywhere in the image. EQUIPO: CAPITAL E Q U I P O, uneven thin scratch strokes from repeated passes with a nail or pocketknife, irregular heights and spacing, pale exposed wood fibers, faint incision shadows, interrupted by wood grain, like names scratched into an old school desk. Small enough to sit fully inside the plank, no letter overhang. NOT polished carving, NOT raised letters, NOT bold beveled block letters, NOT painted ink, NOT neon, NOT a clean computer font. The scratches are shallow physical damage to the surface and share the material lighting.
x=30..43%, y=28..66%: slightly tilted full freestanding tactical whiteboard with faint football pitch lines, a few red and blue magnets, blank generous upper header area. No text.
x=45..58%, y=21..78%: narrow battered steel equipment shelf fully visible, orange stacked cones, lime and orange bibs hanging near the top, folded dark-blue clothing, a few footballs low down. One blank cream paper taped with two obvious pieces of masking tape to the upper shelf at y=22..31%. Paper must be wide enough for an interface handwritten label. Clearly separated shelf/material silhouettes for organic clickable highlighting.
x=61..76%, y=18..83%: full navy blue open doorway into a small lit dressing room with benches and hanging blue clothes. Above the doorway at y=9..16% a COMPLETE simple aged cream sign with NO WRITING, set comfortably below ceiling, completely inside safe area. No text in dressing room.
x=80..93%, y=13..38%: one cork notice board with a large blank off-white pinned paper, complete corners, NO text, NO crest.
x=80..93%, y=42..68%: second separate cork notice board with a large blank off-white pinned paper and subtly ruled rows, complete corners, NO text.
Foreground x=9..31%, y=72..91%: an old laptop on a wooden staff desk, back of display facing viewer, fully visible laptop and a single blank yellow sticky note on its back, generous note face for interface text. Keep chairs away from tactical board and equipment shelf. Desk edge and mundane unlabelled notebook can continue across bottom of frame. Lower-right x=86..100%, y=88..100% unobtrusive desk/floor area reserved for an OVERLAID phone widget; do not draw any widget or phone UI.
No people. No letters, numbers, logos, slogans, labels, writing or watermarks anywhere OTHER than the physical shallow scratched EQUIPO on the wooden rack. Paper documents blank; whiteboard only pitch drawings. No header/navigation/widgets. No light outlines, no selection glow.
Do not recreate the previous room's cramped crop: this is a newly framed wide room with all seven navigation objects composed safely, cleanly and completely.
```

## Prompt del ajuste final

```text
Use case: precise-object-edit. This is the newly generated wide 2:1 room background for a 2D amateur football club videogame. Keep EXACTLY the same entire room composition, camera, image dimensions, placement of jerseys, whiteboard, door and complete blank sign, notice boards, desk and laptop. Change ONLY these two material details:
1) On the wooden plank above the jerseys, replace the current too-regular EQUIPO inscription with the exact same word EQUIPO physically SCRATCHED WITH A NAIL into worn wood. Shallow, thin irregular pale raw-wood scars, repeated broken passes, occasional splinter and hesitant overshooting tiny strokes, visibly uneven E Q U I P O capitals and baselines. Like hand scratched names on an old wooden school desk. The word stays entirely INSIDE the plank, same approximate position and size. No painted or chalk writing, no raised embossed letters, no clean font, no thick carved bevels or dark block shapes, no bright white smooth outline. Material incision, subtle natural shadow within the tiny scratches, worn into the grain.
2) Make the blank cream taped paper on the training shelf wider horizontally so it spans almost the full width of that same shelf. Approximate corners in the current 1774x887 canvas: (850,165),(1040,160),(1045,245),(855,250). Keep it a blank landscape paper, naturally slightly uneven, fixed with obvious two pieces of masking tape. Keep the cones and hanging bibs visible around it.
All other surfaces remain blank with no letters, numbers, logos, glow, UI or watermarks. Only EQUIPO is legible anywhere. Maintain full 2:1 landscape, no cropping, no borders.
```
