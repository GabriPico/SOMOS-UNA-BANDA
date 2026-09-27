# Panel del club: habitación interactiva · actualizado 2026-09-27

El Panel sustituye tarjetas, resúmenes y accesos duplicados por siete objetos de
una habitación ilustrada, siguiendo la composición de la referencia del usuario.
La cabecera del Panel es un HUD navy translúcido y conserva fecha, competición,
rival y CONTINUAR. Las otras pantallas conservan su cabecera. Se elimina
la barra lateral del shell; el escudo permite volver al Panel desde cualquier
pantalla mediante la navegación existente, incluidos sus bloqueos del tutorial.

## Objetos y destinos existentes

| Objeto | Rótulo visible | Destino |
| --- | --- | --- |
| Camisetas y madera del perchero | EQUIPO | squad |
| Pizarra | Tácticas | tactics |
| Estantería y hoja pegada con celo | Entrenamientos | training |
| Puerta abierta y cartel superior | VESTUARIO | dressing-room |
| Papel con chinchetas en el corcho superior | Próximo partido | next-match |
| Papel en el corcho inferior | Clasificación | standings |
| Portátil viejo y post-it | Staff | staff |

No existe un objeto de Mensajes. ClubPhone y useClubPhone mantienen su montaje
único, sus conversaciones, estados, contador y acciones. El tutorial señala el
dock global para abrir el teléfono. CONTINUAR utiliza exclusivamente la cabecera
y las acciones explicativas del tutorial; no hay un segundo control en el Panel.

## Capas y responsive

- Imagen activa club-panel-reference.png (1619×971), creada a partir de la
  última referencia del usuario. Sin HUD, teléfono, datos ni selección luminosa.
  Los siete nombres físicos forman parte del bitmap por petición explícita;
  solo los datos y emblemas del corcho son interfaz dinámica.
- SceneHotspot reutilizable: botón nativo con aria-label, Enter, Espacio y orden
  de Tab. Su clip-path poligonal restringe el hit test al objeto. Un SVG registra
  una copia del mismo fondo en el mismo plano, con brillo al pasar el cursor;
  otro SVG dibuja el contorno. Las camisetas tienen contornos individuales.
  Entrenamientos usa contornos del papel, celo, conos, petos, ropa, bolsas y
  balones; una máscara ilumina solo el material y los soportes. La nueva escena
  no tiene una silla delante del material. No se dibuja un rectángulo general.
- Los datos reales son HTML/SVG sobre los papeles vacíos, bajo los títulos
  manuscritos del bitmap. Caveat y Kalam permanecen locales con licencias OFL.
  Se elimina CarvedTeamLabel: EQUIPO ya no tiene letras superpuestas, sombras
  SVG ni biseles que puedan parecer relieve hacia fuera. Sus trazos finos se
  representan en el propio material de la ilustración. El hover ilumina la
  copia registrada del tablón original junto con las camisetas; no añade neón
  ni un segundo rótulo al grabado.
- Coordenadas porcentuales, viewBox normalizado y proporción compartida con la
  imagen. El plano continúa detrás del HUD y llena ancho y alto (descontando DEV).
  El origen se limita por los extremos de los siete objetos: VESTUARIO queda
  bajo la cabecera y el portátil completo dentro del área visible en las cuatro
  resoluciones solicitadas. Solo se recortan detalles periféricos de techo y mesa.
  Se retira la capa club-scene-surround: no hay bandas, blur ni transparencia
  lateral. Botones, texto, imagen y contornos siguen en el mismo plano.
- El tamaño de la escritura sigue la misma escala que la escena. No se introduce
  contención CSS que encierre los elementos resaltados del onboarding detrás del
  sombreado. Scrim, objeto resaltado y diálogo quedan en capas separadas.
- Hover de 180 ms; estado normal sin brillo. El foco muestra el contorno con línea
  discontinua. Se respeta prefers-reduced-motion.
- Por debajo de 700 px se conserva una escena proporcional de al menos 700 px
  con desplazamiento horizontal local. En paisaje de menos de 500 px de altura
  se permite desplazamiento vertical local. No desborda la página.

Los tablones reutilizan getClubPanelPresentation y los emblemas del juego. El papel
de clasificación muestra cinco posiciones alrededor del club, con sus puntos
reales. El partido refleja rival, fecha, hora y competición actuales, o el estado
sin partido programado. No se recalcula ni modifica dominio desde la escena.

## Archivos de la entrega inicial (2026-09-26)

Modificados:

- src/App.tsx
- src/App.css
- src/components/AppShell.tsx
- src/screens/ClubPanelScreen.tsx
- src/screens/ClubPanelScreen.css
- src/presentation/clubPanelPresentation.ts (ya presente en el árbol de trabajo)
- tests/playerScreens.test.mjs (actualización de la expectativa de barra lateral)
- docs/DECISIONS.md
- docs/VISUAL_SYSTEM.md
- docs/VISUAL_ASSETS.md

Creados:

- src/components/InteractiveClubScene.tsx
- src/components/SceneHotspot.tsx
- src/presentation/clubSceneHotspots.ts
- public/assets/materials/club-panel-room.png
- public/assets/fonts/Caveat.ttf y Caveat-OFL.txt
- public/assets/fonts/Kalam-Regular.ttf y Kalam-OFL.txt
- docs/CLUB_PANEL_HUB.md

Se conservan los cambios previos del usuario en el resto del proyecto. Las
capturas y el script de comprobación están en .panel-check.local, excluido de Git
por la regla existente *.local. No se añaden dependencias, aleatoriedad ni sistemas
de dominio. No hay funcionalidad nueva preparada pero inactiva.

## Decisiones de implementación

Se utiliza un único fondo para el Panel con la iluminación de la referencia; no
se genera una segunda variante nocturna. La hora de partida y los ambientes de
las otras pantallas siguen funcionando como antes. El retorno mediante el escudo
compensa la retirada completa del sidebar sin rediseñar las otras pantallas.

## Verificación

- Proyecto ejecutado en Vite y comprobado en Chrome aislado con perfil temporal.
- 1920×1080, 1600×900, 1440×900 y 1366×768: siete clics y hovers por resolución;
  sin desbordamiento de página, objetos alineados y sin selección al cargar.
- Tab hasta cada objeto, foco visible y navegación mediante Enter; Staff también
  comprobado con Espacio. Teléfono probado desde Panel, Equipo y Tácticas; contador
  real conservado al minimizar y navegar.
- Tutorial real: objeto Staff visible y clicable sobre el sombreado, introducción
  del staff y siguiente paso que resalta y abre el teléfono global.
- Cero errores de consola en las comprobaciones de la interfaz.
- npm run build, npm run lint, git diff --check y 129 tests correctos. Permanece
  el aviso existente de Vite sobre el tamaño del bundle. Los tests existentes
  pueden emitir avisos de puerto HMR compartido entre servidores de prueba.
- Sin commit ni push.

La corrección del 2026-09-27 modifica únicamente ClubPanelScreen.css,
InteractiveClubScene.tsx, SceneHotspot.tsx, clubSceneHotspots.ts y el nuevo
CarvedTeamLabel.tsx, además de esta documentación, VISUAL_SYSTEM.md y DECISIONS.md.
Se conserva el fondo original; no cambian cabecera, VESTUARIO, navegación ni
teléfono. La segunda corrección del 2026-09-27 refuerza el relieve y reemplaza
cover por encaje completo con prolongación ambiental. Solo modifica
ClubPanelScreen.css, CarvedTeamLabel.tsx e InteractiveClubScene.tsx, además de
esta documentación, VISUAL_SYSTEM.md y DECISIONS.md. Se comprueban imagen,
hotspots, grabado, VESTUARIO y teléfono dentro del área visible, hovers y siete
destinos en las cuatro resoluciones, teclado y tutorial.

## Sustitución de la escena base (2026-09-27)

Por la nueva petición del usuario se sustituyen el fondo activo y el encuadre,
conservando rutas, cabecera y teléfono. Se modifica InteractiveClubScene.tsx,
clubSceneHotspots.ts y ClubPanelScreen.css; se elimina CarvedTeamLabel.tsx.
Se añade public/assets/materials/club-panel-room-wide.png. El bitmap anterior
permanece conservado y no se utiliza en el Panel.

Los objetos se registran en píxeles de la nueva ilustración y se convierten a
porcentajes fuera de React. Se recolocan los rótulos y se ajustan los datos a los
papeles del corcho, comprobando que las cinco posiciones caben dentro del papel.
Se conservan las siete acciones existentes, el orden de Tab y Enter/Espacio.
Registro de generación y prompts en CLUB_PANEL_WIDE_ASSET.md; documentación
actualizada también en VISUAL_ASSETS.md, VISUAL_SYSTEM.md y DECISIONS.md.

## Nueva referencia principal y HUD integrado (2026-09-27)

La última referencia sustituye las composiciones anteriores. Se activa
club-panel-reference.png; club-panel-room.png y club-panel-room-wide.png
se conservan sin uso. Los nombres físicos permanecen en sus superficies;
EQUIPO tiene arañazos manuales dentro del tablón, sin letras superpuestas.
Fecha, partido, escudos y clasificación siguen siendo datos reales del juego.

Se actualiza el HUD únicamente en el Panel. El fondo detrás de la cabecera es
la misma imagen de la habitación, sin capas duplicadas. El encuadre comparte
límites funcionales con los hotspots y protege VESTUARIO y el portátil.
Inventario de esta entrega, soluciones y prompts en CLUB_PANEL_REFERENCE.md.
