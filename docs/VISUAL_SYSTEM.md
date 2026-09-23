# Sistema visual del juego

## Alcance e identidad

La identidad de club municipal se aplica a **Tácticas, Equipo / Plantilla, perfil completo de jugador, Mensajes y Estado del vestuario**, incluida
su cabecera y navegación (revisión del 22 de septiembre de 2026). Reutilizan pared
de yeso cálida, documentos de papel, pintura marina y metal sencillo. Tácticas
mantiene el zócalo cerámico; Equipo y perfil usan una pared fotográfica continua.
Tácticas conserva su pizarra verde con marco de madera, configuración sobre corcho y
alineación en portapapeles. Equipo añade una hoja administrativa de plantilla,
ficha individual con retrato enmarcado y una vista al campo. Equipo y perfil
comparten una escena ambiental con ventana, fotografía antigua ficticia y trofeo.

Las demás pantallas conservan el rediseño anterior: azul noche, azul eléctrico
para selección y acciones, verde positivo, ámbar de advertencia y rojo de problema.
Su migración queda pendiente de siguientes encargos. La fotografía ambiental
no representa datos de la partida. No hay lemas ni retratos nuevos de jugadores;
el monograma FCP y los retratos por ID se conservan.
El selector claro/oscuro se ha retirado del shell completo por petición expresa.
La identidad de las pantallas migradas es fija y el resto mantiene su paleta base.

## Piloto de materiales del club

### Análisis del sistema existente

`themeTokens.css` contiene la paleta base; `managementTheme.css` define los
componentes de gestión; `gameUi.css` integra estilos compartidos; `App.css` controla
el shell y sus breakpoints. `TacticsScreen.css`, `TacticsWorkspaceScreen.css` y los
estilos de `TacticalWorkspace` / `TacticalPlayerCard` conservan la composición,
las consultas de tamaño, la densidad, las transiciones y los desplazamientos.

Los componentes comunes relevantes son `AppShell`, `MainNav`, `TacticalBoard`,
`TacticalInstructions`, `LineupList`, `TacticalPlayerCard`, `PlayerDetail`,
`PlayerPortrait`, `StarRating`, `StatusBar`, `StatusText` y `ManagementIcon`.
Se reutilizan sin sustituir sus operaciones ni crear versiones de dominio.

### Aplicación y reutilización

- `styles/clubMaterialTokens.css` declara colores de materiales, tinta, pintura,
  papel, pizarra, madera, cemento, cinta, bordes, sombras, tipografía y estados.
  Adapta los tokens `--ui-*` existentes en `.club-material-theme`, sin cambiar
  `:root` ni duplicar los componentes de indicadores.
- `styles/clubMaterials.css` contiene superficies reutilizables (`club-sheet`,
  `club-sheet--cork`, `club-sheet--taped`, `club-sheet--clipboard`, `club-sheet--stacked`,
  `club-board-mount`, `club-chalkboard`), acabado del shell e integración del
  piloto. Se importa después de `gameUi.css`; todas sus reglas están acotadas
  a `.club-material-theme`.
- `styles/clubSquad.css` integra esos materiales en Equipo. `clubPlayerFile.css`
  resuelve el documento compartido de ambas fichas; `ClubPlayerFile` compone el
  marco exterior y el mismo `PlayerDetail`, sin duplicar contenido ni cálculos.
  Se conservan las diez columnas y los breakpoints de `TeamScreen.css`; la densidad
  de filas se adapta a la altura disponible en `clubSquad.css`.
- `AppShell` activa esa clase en Tácticas, Equipo, Mensajes, Estado del vestuario y cualquier perfil completo.
  La intervención de partido conserva su acabado anterior.
  Volver de un perfil mantiene la pantalla de origen montada y recupera su foco
  y scroll. La navegación principal conserva su comportamiento de montaje previo.
- La identidad es única: papel claro, tinta oscura, cabecera crema y pintura azul
  en la navegación. Se elimina el estado de tema, su lectura/escritura en
  localStorage, el botón y las variantes CSS claras. Una preferencia antigua
  guardada deja de consultarse, sin afectar a ningún dato de partida.
- Once SVG locales aportan texturas y piezas de los soportes. Se retiran el
  rincón de equipación y la ventana ilustrada. Un PNG ambiental local añade
  la vista fotográfica del club; procedencia y prompt en `VISUAL_ASSETS.md`.
  No se incorporan dependencias ni imágenes remotas en tiempo de ejecución.
- Las decoraciones son fondos, pseudoelementos o elementos con `aria-hidden`,
  siempre con `pointer-events: none`;
  no alteran accesibilidad, hit targets, arrastre, selección ni tooltips.

En Tácticas, la distribución sigue siendo configuración izquierda / campo central / alineación
derecha. Se conservan las columnas y alturas responsive del workspace. El papel
añade un margen interior compacto para sus encabezados. En móvil continúa el
apilado y el desplazamiento local del campo. No hay rotaciones de los documentos
ni filtros sobre textos, retratos, estrellas o controles; solo gira levemente la
cinta decorativa. Las líneas de la pizarra y su textura usan colores de tiza;
las fichas mantienen estados legibles y feedback de destino durante el arrastre.

### Objetos y ambiente de la segunda iteración

- La franja cerámica tiene juntas, relieve de borde y variaciones de tono. El
  yeso cálido y la pintura usan texturas diferentes, con desgaste moderado.
- La configuración conserva una hoja legible, rodeada por corcho y sujeta con
  cinta. La alineación utiliza otro soporte: tablero marino con pinza metálica,
  canto de papel e impresión de competición. No se rotan las áreas de lectura.
- El campo usa un marco de madera con veta, tornillos y sombra de contacto.
  El dibujo de tiza se realiza como un SVG de fondo con pequeñas irregularidades;
  el filtro solo afecta a ese dibujo. Los marcadores DOM del workspace compartido
  permanecen, y se ocultan visualmente solo en el piloto. Las posiciones de
  jugadores, fuentes de arrastre y callbacks no cambian.
- Una bandeja con borrador y tiza remata el marco. Se insinúa un perchero detrás
  de la pizarra. El adorno del lateral se retira del shell completo en la segunda
  iteración de Equipo: la navegación solo contiene controles funcionales.
- El botón de próximo partido sigue mostrando los datos del calendario; su
  acabado de papel grapado aporta el contexto administrativo sin duplicar datos.
  No hay menús, precios, patrocinadores ni frases inventadas para decorar.

Para futuras pantallas, activar explícitamente el contenedor de materiales y
reutilizar sus superficies. Añadir un nuevo material como token compartido cuando
haga falta; no copiar esta hoja completa ni extender automáticamente el piloto
mediante selectores globales. Los ambientes de Entrenamientos, Staff y
otras zonas aún no están activados ni diseñados en esta iteración.

### Equipo: documentación y vista al campo

- Se mantienen título, contador, buscador, ambos filtros, diez columnas,
  selección y nombres enlazados. La cabecera y los filtros son más bajos; las
  veinte filas iniciales miden entre 26 y 32 px según la altura disponible.
  La tabla conserva cabecera fija y scroll local para ventanas más pequeñas o
  plantillas más largas, sin cortar datos para simular que caben.
- El listado usa `club-sheet--stacked` y la cinta compartida. Las líneas impresas
  y el papel alterno delimitan las filas. La selección es azul apagado con borde
  marino; los estados mantienen tinta verde, ocre o roja, también al seleccionar.
- La ficha reutiliza `PlayerDetail` dentro de `ClubPlayerFile`, con el mismo
  portapapeles y pinza que el perfil completo. El marco queda fuera del scroll;
  el documento tiene márgenes reales y el clip no se desplaza con su contenido.
  El encabezado reduce el retrato a 70×82 px (54×65 px en la ficha más estrecha)
  y equilibra nombre, felicidad y el bloque calidad/rol/personalidad.
  Es un resumen rápido: identidad, calidad, rol, personalidad, medidas, posiciones,
  estadísticas, estado y observaciones relevantes. El botón «Ver ficha completa»
  abre el perfil. Los atributos y el desplegable de vestuario quedan en la ficha
  completa; las posiciones se muestran como una leyenda compacta, sin mini campo.
- `PlayerPortrait` mantiene los originales completos mediante `object-fit: contain`,
  sin filtros ni recortes. La sustitución futura de la silueta por una caricatura
  sigue el mapping por ID de `docs/PLAYER_PORTRAITS.md`; no requiere otra ficha.
- La escena de ventana, campo, foto antigua y trofeo ocupa el fondo continuo del
  contenido, detrás de los documentos. Se une por arriba al yeso y queda anclada
  al borde inferior. Ya no existe un recorte aislado en la cabecera ni el componente
  `ClubRoomContext`. Se reutiliza el PNG existente sin nuevos textos ambientales.
- En pantallas estrechas se conserva la ficha encima de la tabla y el scroll
  horizontal local de sus columnas. La pinza permanece anclada al documento;
  los adornos no reciben eventos ni alteran el orden de foco.
- El perfil ampliado conserva volver, identidad, posiciones, contexto táctico,
  atributos, estadísticas, estado y datos adicionales. Usa papel sobre el mismo
  soporte y reglas impresas. Su cuadrícula usa una columna izquierda para retrato,
  identidad y posiciones, y una derecha para calidad, datos físicos, atributos,
  estadísticas y estado. El retrato gana una altura de 165–255 px en escritorio
  (140 px en móvil); el ancho máximo del documento pasa a 1680 px. Se condensan
  espacios y se retiran la felicidad y el escudo duplicados. El rol conserva
  su explicación en el tooltip. El desplegable opcional puede ampliar la página.
- Ninguna lógica de jugadores, estadísticas, finanzas, filtros u operaciones
  cambia. Las demás áreas esperan encargos posteriores.

### Verificación del piloto

Chrome headless con perfil de pruebas separado: las cinco formaciones en
1920×1080, 1600×900, 1536×864, 1440×900 y 1366×768, sin solapamientos de fichas
ni desbordamiento horizontal de página. También 768×1024 y 390×844, conservando
el scroll local del campo. Se revisan la identidad fija, selección sincronizada,
arrastre con ratón y táctil, controles por teclado, retorno del perfil con foco,
tooltips, movimiento reducido, desplegable de candidatos, desplazamientos,
cambio de instrucciones, propuesta del segundo y CONTINUAR en el tutorial.
En móvil, el texto del segundo ocupa la columna que libera su icono oculto y las
columnas de indicadores se compactan para conservar espacio para los nombres
dentro del papel, sin retirar ninguna columna.

Build, lint, `git diff --check` y los 113 tests disponibles pasan. Vite mantiene
el aviso del bundle JavaScript superior a 500 KB; este piloto no añade paquetes
ni cambios de dominio. Las capturas y los scripts de
revisión local quedan fuera del producto.

La extensión de Equipo se revisa a 1920×1080, 1600×900, 1366×768, 1280×800,
1201×800, 1050×900, 768×1024 y 390×844. Se comprueban búsqueda sin resultados,
limpieza de filtros, seis ordenaciones, selección con ratón/teclado/táctil,
separación de atributos de campo/portero, ficha desde el nombre y el inspector,
retorno de foco y scroll, perfil ampliado y navegación. No hay solapamientos de
ventana ni desbordamiento horizontal de página. Build, lint y los 113 tests pasan.

La segunda iteración comprueba también el perfil completo en esas ocho resoluciones:
márgenes del papel dentro del marco, tamaño reducido del retrato, ausencia de
colisiones entre atributos y estrellas, sidebar sin adornos y retorno con foco
desde Equipo y Tácticas. Se repiten búsqueda, filtros, ordenaciones, perfil ampliado
y selección táctil sobre la composición final. Los 113 tests siguen pasando.

La revisión del 17 de septiembre comprueba Equipo y perfil en 1920×1080,
1600×900, 1536×864, 1366×768 y 1280×800, además de 768×1024 y 390×844.
En los cinco tamaños de escritorio la plantilla inicial muestra veinte filas
sin scroll vertical de página, tabla o inspector. Se revisan los veinte perfiles
con el escenario DEV Jornada 1: todos caben a 1366×768, incluidos porteros,
jugadores a prueba y el jugador con molestias. El retrato mide 192 px de alto
en esa resolución. No se oculta contenido ni se escala la interfaz para lograrlo.
El móvil y el desplegable opcional de vestuario conservan desplazamiento natural.
No hay colisiones entre nombres de atributos y estrellas ni desbordamiento
horizontal de página. Se verifican búsqueda, los seis órdenes, selección con
ratón/teclado/táctil, nuevo botón, retorno al origen con foco y acceso desde
Tácticas. Build, lint, diff y los 113 tests pasan; no cambian los sistemas de dominio.

## Tema y estructura

- `styles/themeTokens.css`: colores semánticos, tamaños, espaciado, tipografía,
  radios, sombras y variables de la paleta base.
- `styles/managementTheme.css`: paneles, tablas, estados, indicadores e historial.
- `styles/gameUi.css`: reglas compartidas de integración y adaptación de pantallas.
- `AppShell` y `MainNav`: cabecera, navegación y CONTINUAR. La selección de tema
  se retiró en la segunda iteración; no hay persistencia de preferencias visuales.

La barra lateral muestra Panel, Equipo, Tácticas, Entrenamientos, Estado del
vestuario, Mensajes, Próximo partido, Clasificación y Staff. Las pantallas de
resultados, goleadores y sanciones conservan la navegación interna de Liga.
La cabecera consulta el club, fecha y siguiente rival reales. Los bloqueos de
onboarding y la acción común de avance temporal permanecen en App.

La tipografía usa fuentes locales (Bahnschrift, Arial Narrow, Segoe UI). No se
instalan bibliotecas ni se realizan descargas de fuentes.

## Plantilla y ficha

Equipo tiene una única vista con tabla e inspector permanente, aproximadamente
61/39 en escritorio. Seleccionar una fila cambia el inspector sin abrir modal;
una búsqueda vacía conserva la selección. Se filtran todas las posiciones
naturales y la búsqueda ignora tildes. El orden se puede cambiar por posición,
nombre, edad, partidos, minutos y goles.

La tabla incluye dorsal, retrato/nombre, posiciones, edad, PJ(TIT), minutos,
goles, felicidad, estado y observaciones. La tabla puede desplazarse de forma
independiente. La ficha mantiene su columna; en pantallas bajas admite scroll
interno para conservar acceso a todos sus bloques. Por debajo de 1050 px se
apilan ficha y tabla, conservando una sola instancia de cada componente.

La ficha común `PlayerDetail` se usa integrada en Equipo, como resumen de Tácticas
y en el perfil dedicado. Otros accesos conservan el diálogo. Solo la variante modal bloquea el scroll, captura Escape y
gestiona el foco. La posición contextual se deriva del once actual después de un cambio.

La cabecera de la ficha prioriza retrato, identidad y felicidad. Inmediatamente
después aparecen **Calidad General**, **rol en el equipo con descripción** y
**personalidad**. El rol reutiliza las expectativas y el papel social existentes
del vestuario; un jugador a prueba se identifica como tal. No se deducen nuevas
expectativas de su calidad ni de la alineación seleccionada.

Después se muestran edad, altura, peso, pierna, mapa de posiciones, atributos,
estadísticas y estado/observaciones. Las cuotas, forma, relación, satisfacción de
entrenamiento y valoraciones históricas siguen accesibles en el desplegable final.

## Estrellas y estados

Por la última indicación del usuario, los atributos se presentan con **0–5
estrellas en pasos de media estrella**, sustituyendo las barras inicialmente
solicitadas. La conversión es lineal de 1–20 a 0–5, redondeada al medio punto:
`round((atributo - 1) / 19 * 10) / 2`. Así 1 corresponde a 0 estrellas y 20 a 5.
Una valoración visual de cero nunca cambia el mínimo deportivo interno de 1.

`getAttributePresentation` centraliza esa conversión. `RatingStars` pinta tanto
estrellas completas como medias; `StarRating` conserva la conversión anterior de
Calidad General. Las dos escalas comparten el dibujo, pero no se confunden sus
fórmulas. No hay números 1–20 ni bonus exactos en texto, tooltip o accesibilidad.
La mejora provisional se identifica con una flecha. Las estrellas de atributos
usan los atributos base actuales, incluidas las consolidaciones del entrenamiento.

Condición, cansancio y felicidad conservan las etiquetas del dominio. El estado
prioriza lesión y elegibilidad, después incidencias registradas y condición/carga.
No se infieren resaca, sobrepeso ni conflictos de una personalidad, peso o rating.
Las observaciones recogen restricciones explícitas y ausencias planificadas.
Felicidad en Vestuario deriva de la felicidad real del equipo; el ánimo compuesto
se conserva en el resumen existente.

## Tácticas: configuración, campo y alineación

El rediseño específico de Tácticas utiliza tres columnas, aproximadamente 21% para
configuración a la izquierda, 48% para el campo central y 31% para alineación a la
derecha. La opinión del segundo cierra la columna izquierda y el campo gana la altura
de su antigua banda. El resumen superior conserva formación, mentalidad, ritmo y presión.
La familiaridad queda bajo Formación y Mentalidad con nivel, color y barra de lectura
cualitativa, reutilizando sus umbrales y el indicador común. Las diez
instrucciones y sus opciones se reutilizan sin duplicarlas:
Ajustes generales (Formación, Mentalidad), Con balón (Pase, Ritmo), En transición
(Tras recuperar, Tras pérdida) y Sin balón (Altura, Presión, Perder tiempo, Ser agresivos).
Formación y Mentalidad son selects directos. Los otros tres bloques muestran sus
valores y CAMBIAR; solo uno puede abrir sus selects a la vez. LISTO vuelve al
resumen. Editar actualiza el plan existente inmediatamente, sin un guardado paralelo.

Las instrucciones forman una columna continua con separadores, sin cajas por bloque.
`TacticalPlayerCard` selecciona desde tarjeta, retrato o posiciones. El nombre es
un enlace visual diferenciado hacia la página del perfil. La selección abre arriba
de la tabla un resumen de unos 150–200 px, variante del mismo `PlayerDetail`.
Su nombre y VER FICHA COMPLETA abren la página dedicada. La X del resumen o un clic
en campo vacío deseleccionan. Arrastrar el nombre no dispara la navegación.

`PlayerProfileScreen` usa todo el contenido del shell, sin backdrop ni diálogo.
El retrato y la identidad encabezan el perfil; calidad, rol, personalidad y datos
personales preceden a posiciones, atributos y estado. Las estadísticas ocupan la
franja inferior, con observaciones y perfil ampliable. En pantallas bajas la página
permite desplazamiento normal. El retorno identifica Tácticas o Equipo y conserva
selección, filtros, scroll y foco.

El corazón usa la condición real y sus etiquetas actuales. La barra de stamina
usa `100 - fatigue`, aproximado a decenas mediante el helper visual compartido;
ambos indicadores exponen etiquetas cualitativas, nunca porcentajes exactos.
Molestias, lesión y expulsión tienen avisos independientes. Una sanción previa
no se representa como una expulsión actual. La expulsión está admitida en la
tarjeta, pero no se inventa un evento de partido desde la pantalla de preparación.

`LineupList` muestra los once titulares y después los suplentes, en filas compactas
que reutilizan `TacticalPlayerCard` con variante de fila. Campo y lista reciben la
misma selección y los mismos callbacks de intercambio. Las estrellas de la lista
son Calidad General de los atributos base actuales, no rating del puesto ni
atributos individuales. Los suplentes se identifican como S1, S2, etc.; esto no
les asigna un dorsal nuevo.

Los suplentes son los convocados que no están en el once. Antes de anunciar la
convocatoria se indica brevemente y «VER RESTO DE LA PLANTILLA» muestra
los candidatos en un desplegable cerrado al final de la lista. Después de anunciarla,
el mismo acceso permite consultar los omitidos, conservando su restricción para entrar
en el once. No hay bloque inferior de suplentes ni banquillo ficticio de siete
jugadores. Los titulares inválidos permanecen en su puesto hasta sustituirlos.

Las variantes de tarjetas y controles agrupados se activan solo en Tácticas.
`TacticalBoard`, `TacticalSquadList`, `TacticalInstructions` y `moveLineupPlayer`
siguen compartidos con la intervención de partido, cuya presentación actual se
conserva. Los clics y el arrastre usan la misma operación y disponibilidad existente.

La altura disponible procede de la ventana, incluida la banda DEV y el objetivo
del tutorial. Cabecera global de 72–80 px y lateral de 172–176 px en escritorio.
El campo conserva una proporción vertical limitada por su contenedor y tarjetas
adaptadas mediante consultas de tamaño. La lista admite desplazamiento interior;
la configuración puede desplazarse cuando se expande un bloque en pantallas bajas.
No se usa zoom ni escalado global. Se verifican las cinco formaciones a 1920×1080,
1600×900, 1536×864, 1440×900 y 1366×768, con zoom real al 100%.
En ventanas estrechas se apilan los bloques; en móvil el campo admite scroll local.

La tabla presenta POS, JUGADOR, CALIDAD, COND. y STAMINA, y un espacio de incidencias.
Titulares y suplentes comparten filas compactas, sin tarjetas independientes.
Las posiciones naturales aparecen bajo el nombre completo. El campo muestra el
nombre corto y el puesto ocupado; el tooltip conserva identidad y posiciones.
Los movimientos se centralizan, con preview, transparencia de origen, feedback
de adaptación y animaciones de 170 ms respetando la preferencia de movimiento reducido.

## Datos disponibles y límites

- Altura y peso se generan de manera reproducible con una secuencia independiente
  de la generación deportiva. Describen al jugador y no añaden modificadores.
- Los dorsales y fechas de nacimiento son opcionales; todavía no se han asignado.
- Los retratos definitivos pendientes usan la silueta original. Se sustituyen
  añadiendo el archivo por ID o mediante el mapping de `playerPortraits.ts`.
- PJ(TIT) respeta apariciones y titularidades registradas. Un histórico incompleto
  se muestra como `13(—)`, no como una cifra inventada. Sin apariciones es `0(0)`.
- Los minutos suman el histórico real de Liga y excluyen amistosos. Si el histórico
  es parcial se indica en el título de la celda; si no existe se muestra `—`.
- Asistencias, sobrepeso y plazos médicos no tienen un registro activo que permita
  mostrarlos de forma fiable. No se generan para rellenar la interfaz.
- Asuntos y cambios del vestuario conservan su fuente actual, parcialmente mock.
  No se inventan fechas, conflictos ni respuestas narrativas.

## Verificación anterior a la identidad municipal

Revisión local con un Chrome headless aislado: las nueve secciones de navegación
en ambos temas, selección de jugadores, búsqueda, estado sin resultados,
intercambios tácticos y cambio de formación. Comprobaciones a 1920×1080,
1366×768, 768×1024 y 390×844; no hay desbordamiento horizontal de la página.

Los tests comprueban estadísticas, separación portero/campo, escalas de estrellas,
medidas reproducibles, invariantes de atributos, roles y preservación de sistemas.
Los helpers temporales de revisión del navegador no forman parte del producto.

La iteración de Tácticas del 15 de septiembre se valida a zoom 100% en las cinco
resoluciones de escritorio indicadas, con las cinco formaciones y sin solapamientos.
Se prueban Pointer Events de ratón y táctil, umbral de arrastre, swaps entre campo
y lista, restricciones de convocatoria/portero, avisos, selección y modal, propuesta
del segundo, ambas paletas y el objetivo de Tácticas del tutorial con CONTINUAR.
Build, lint, comprobación de diff y los 110 tests disponibles completan la revisión.

### Mensajes: conversaciones sobre papel y móvil funcional

Mensajes reutiliza el shell de materiales y las superficies de papel apilado con
cinta. Su entorno propio es una fotografía local de oficina y vestuario con mesa,
portátil viejo y pocos objetos cotidianos. La imagen cubre solo el contenido de
Mensajes y no lleva datos de juego. No hay lemas ni texto ambiental añadido.

`InboxScreen.css` se importa en `main.tsx` después de los estilos compartidos.
La carcasa del móvil está separada del historial desplazable. El chat conserva
cabecera, remitentes, separación por días, mensajes enviados/recibidos,
convocatorias, reacciones, participantes y respuestas predefinidas. El campo
inferior es de solo lectura: informa del estado y permite ir a la respuesta
pendiente. La escritura libre y los adjuntos no forman parte del sistema actual.

El listado muestra contactos reales de la partida, roles de las fuentes
existentes, fechas, previews y contadores derivados. No se añaden conversaciones
para completar el decorado. A 760 px o menos se apilan lista y teléfono; abrir
un contacto desplaza y enfoca el móvil. La decoración no captura interacción.

#### Revisión con la referencia del móvil en la mano

El teléfono utiliza un recurso fotográfico transparente de guante, manga y marco,
sin piel visible. La conversación se representa en HTML sobre la pantalla vacía
del recurso. El montaje conserva siempre la proporción 494:1024; la anchura se
ajusta al espacio disponible en alto y ancho mediante unidades de contenedor.

La mano y el teléfono se inclinan juntos 3 grados en escritorio, manteniendo
alineados los controles con el marco. A 760 px o menos se apilan las columnas
y desaparece la inclinación. La manga se recorta en los límites del entorno;
el listado conserva prioridad visual y los adornos no capturan interacción.
El reloj utiliza la hora de la partida; los demás indicadores son decorativos.

### Estado del vestuario: resumen humano compacto

Estado del vestuario comparte el shell de materiales de Equipo y Tácticas. El
fondo `club-dressing-room.png` es exclusivamente ambiental, con bancos, azulejos,
ventanas altas, una bota, cantimploras y cinta; nunca contiene información jugable.
Los indicadores y avisos utilizan papel opaco, tinta oscura y colores semánticos.

La tabla completa se sustituye por hasta seis jugadores a seguir: situación,
influencia y prioridad. Conserva PlayerTable, PlayerIdentity, StatusBadge y la
ficha modal de PlayerDetail; «Ver plantilla» utiliza la navegación a Equipo.
Los indicadores siguen usando CompactIndicator y los avisos, AlertItem.

El grid principal sitúa seguimiento a la izquierda, problemas y jerarquía arriba
a la derecha, voces y compromisos debajo, e historial al pie. PlayerSection y
SectionHeader conservan el papel crema. DressingRoomProblems muestra tres
incidencias y permite ampliar la lista; ChangeHistory tiene una variante compacta
de hasta cuatro entradas. Sus otras variantes mantienen el comportamiento previo.

Las alturas naturales, gaps de 8–12 px y paddings compactos permiten mostrar todos
los paneles a zoom 100 % en 1920×1080 y en un área útil de 1920×920, incluyendo
el shell y la barra DEV. No se usa escala ni recorte del shell. A 1400 px o menos
el grid pasa a dos columnas; a 600 px, a una. En ventanas menores se permite el
scroll natural, con desplazamiento horizontal local para la tabla de seguimiento.
Las incidencias y compromisos adicionales siguen accesibles al ampliar sus listas.

Comprobado en Chrome headless con perfil temporal aislado: dimensiones, fichas,
acceso a Equipo, expansión de problemas y una promesa real del escenario existente.
También se revisan 1366×768 y 390×844 sin desbordamiento horizontal de la página.

### Encabezados integrados

`screenHeaders.css` comparte el tratamiento de Tácticas: bloque crema translúcido
ajustado al contenido, con `width: fit-content` y máximo de 680 px. Solo el título
y subtítulo llevan la superficie; la fila de acciones permanece transparente.
Conserva blur de 2 px, filete azul grisáceo, Bahnschrift y tamaño de 21–28 px.
Los títulos navy y subtítulos gris azulado son opacos y no llevan sombra. Elimina el
recuadro independiente de Equipo, Mensajes y Vestuario y aplica el mismo patrón a
los encabezados de Entrenamiento, Liga, Staff, Próximo partido y preparación.
Sus selectores solo alcanzan cabeceras; no cambian los paneles de contenido, el
shell ni la navegación. Tácticas comparte el contraste y conserva su composición
y dimensiones. El padding vertical anterior evita aumentar la altura; el margen
horizontal es de 14 px en escritorio y conserva el anterior hasta 800 px de ancho.
Los márgenes del soporte compensan su padding para mantener la posición de los
controles y del contenido inferior. Los subtítulos se limitan a dos líneas.
