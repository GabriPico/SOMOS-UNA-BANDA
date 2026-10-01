# Competición y actas

## Presentación

Competición es un portal federativo dentro del juego, con fondo blanco/gris,
tinta azul marino, acentos rojos, tablas y navegación redondeada. Conserva el HUD
global y el teléfono. AppShell excluye el escenario ilustrado y los materiales
del fondo en este destino. Próximo partido amplía el corcho físico del Panel,
con hojas que presentan datos vivos y una convocatoria ampliable. El acta
posterior al partido conserva su presentación fuera del portal. Los emblemas SVG del
juego no son escudos oficiales; su paleta se comparte con las equipaciones.

La temporada procede de las fechas del calendario. Los datos de competición son
informativos: la beta solo tiene una liga, sin selectores de categorías ficticias.
Resultados permite recorrer las 22 jornadas, abrir fichas pendientes y consultar
actas terminadas. Los amistosos tienen su propio filtro, conservado al navegar.
Clasificación muestra todos los encuentros de liga ya disputados, sin selector
de jornada. Resultados y Sanciones tienen su propio selector. Calendario divide
las jornadas existentes en dos vueltas con desplegables. Equipaciones presenta
primera y segunda equipación por club. Los partidos pendientes muestran VS, fecha
y hora, nunca un falso resultado de 0–0. Antes del debut se muestran la tabla
inicial y el estado vacío de goleadores. El grupo se omite cuando no existe en
los datos; no se inventa un número de grupo.

Los cálculos existentes de puntos, desempates, forma reciente y goles siguen en
`leagueStandings.ts` y `leagueScorers.ts`. No se inventan partidos jugados ni
promedios individuales para rivales sin un historial de participación completo.
La convocatoria conserva elegibilidad, anuncio y efectos humanos; su calidad se
presenta con estrellas y su forma con las etiquetas cualitativas compartidas.

## Archivo del partido

`MatchTeamState.initialLineup` captura formación, puestos, titulares y banquillo
al crear el encuentro. Los cambios durante el partido no modifican esa copia.
`MatchPlayer.shirtNumber` conserva el dorsal cuando existe en la plantilla.

Al confirmar el final, `applyPostMatch` añade una única acta a
`GameState.matchReports[matchId]` mediante `createMatchReport`. Es una instantánea
serializable y separada de React que contiene:

- Participantes y condición de titular/suplente al inicio, posiciones y minutos.
- Goles con identidad real del jugador del motor, minuto y marcador progresivo.
- Incidencias individuales de gol, tarjetas y entrada/salida del campo.
- Todos los pares de sustitución, incluidas las reentradas.
- Estadísticas objetivas y nombre del entrenador del club cuando está registrado.

No copia atributos, factores humanos ni estado mutable de entrenamiento. El
archivo se conserva al avanzar o iniciar otro encuentro. La hidratación admite
partidas antiguas sin `matchReports`; los partidos activos antiguos pueden
recuperar titulares a partir del primer cambio de cada jugador, sin confundir
reentradas con suplencia inicial.

El botón «Ver acta» del resumen final confirma las consecuencias y abre el acta.
Su botón «Continuar» invoca la acción temporal común hacia el siguiente checkpoint.
También se accede desde Resultados y desde «Acta del último partido» en Próximo
partido, incluso cuando no quedan encuentros programados. Consultar el archivo
no aplica efectos ni vuelve a procesar el encuentro.

## Límites actuales

Los resultados previos y los partidos rivales resueltos en segundo plano conservan
solo marcador y eventos de gol. Su acta muestra esos hechos y explica la ausencia
de detalle; no fabrica alineaciones, tarjetas, dorsales, staff ni árbitros.
La generación de identidades rivales y el motor no cambian en esta tarea. Sus
identificadores de partido pueden representar variantes de los jugadores
canónicos: el portal no los cuenta como participaciones de otro identificador.

El archivo dura lo que la partida actual: todavía no existe guardado a disco.
No se implementan designaciones arbitrales ni reglas disciplinarias nuevas.
Sanciones reutiliza leagueSanctions y getSanctionsForMatchday: las tarjetas del
motor todavía no crean un historial federativo completo de sanciones.

## Portal compartido y fichas de club · 2026-09-27

- `domain/competitionPortal.ts` construye una proyección de solo lectura desde
  GameState y los catálogos existentes. Reutiliza clasificación, goles, sanciones,
  calendario, actas, jugadores propios y jugadores rivales. No guarda resúmenes
  calculados en el estado de partida ni crea resultados para la interfaz.
- `getCurrentLeagueStandings` es la tabla actual compartida por el portal y el
  ordenador del Panel. Excluye amistosos y playoff. Cambiar la jornada de
  Resultados o Sanciones nunca altera la clasificación ni la ficha de un club.
- `CompetitionPortal`, `CompetitionHeader` y `LeagueTabs` componen el sitio;
  `components/competition` contiene tablas, partidos/calendario, enlaces por ID,
  forma reciente, fichas y kits. Sustituyen las cuatro pantallas antiguas.
  `federationPortal.css` limita el estilo de web a estas superficies.
- App intercepta los identificadores antiguos `standings`, `league-results`,
  `league-sanctions` y `league-scorers`, conservando el destino de checkpoints,
  accesos y escenarios DEV. La navegación nueva usa `competition`; las pestañas,
  clubes y actas se consultan dentro del portal mediante estado, sin React Router.
- Un historial local de destinos conserva pestaña, jornada, filtros, posición de
  desplazamiento y foco al volver. Las vistas anteriores permanecen en Activity,
  incluidas las jornadas desplegadas. No se ejecuta ningún efecto deportivo.
- FCF es una aplicación del teléfono, no un comando de navegación global.
  Usa la misma proyección y los mismos componentes con variante compacta.
  Cambiar de app o minimizar conserva la consulta y la pantalla de juego situada
  detrás. Los avisos obligatorios siguen abriendo Mensajes y respetan el onboarding.
- Todas las identidades gráficas del portal, incluidas las actas, enlazan por ID
  real a su club, con hover/foco discreto. La ficha muestra tabla actual, forma,
  partidos cronológicos, siguiente partido, plantilla pública y selector 1ª/2ª.
- LeagueTeam admite localidad, campo, superficie, fundación, colores, temporadas
  en categoría y kits opcionales. Los campos desconocidos se omiten. El campo
  puede proceder de un partido local registrado. La plantilla rival solo muestra
  las identidades públicas existentes, con una nota sobre su carácter parcial.
  Los nombres conservan `data-player-id` para futuras fichas, sin enlaces ficticios.
- No había un generador de kits previo. `clubAppearance.ts` centraliza las paletas
  existentes de TeamBadge y genera valores visuales reproducibles; `ClubKit` los
  representa en SVG (camiseta, pantalón y medias). Un club puede aportar sus kits
  explícitos. No se añaden imágenes de equipaciones ni datos históricos inventados.
- PJ y goles/partido priorizan participaciones con minutos registrados en actas
  completas. Los totales propios del estado solo se usan si son coherentes con
  los partidos y goles existentes. Sin historial suficiente se muestra «—».
- Se corrige la inicialización de una partida nueva: el calendario vacío de
  resultados ya no arrastra goles históricos del mock que reaparecían al disputar
  un encuentro con el mismo ID. No se borran goles de partidas en curso.

## Panel del club

El asset `club-panel-competition.png` reemplaza únicamente los dos objetos de
navegación solicitados: cartel inferior por mesa con portátil modesto, y portátil
de Staff por archivador en la mesa existente. El monitor muestra CLASIFICACIÓN
y filas reales en SVG alineado a la pantalla. Staff conserva la caligrafía manual
sobre su post-it. Los hotspots, hovers y objetivos del tutorial usan estos objetos;
no se añaden botones flotantes. El fondo anterior y sus títulos permanecen guardados.

## Verificación

`tests/matchReports.test.mjs` comprueba local/visitante, reentradas, titulares,
identidad real de los goles rivales, serialización, compatibilidad, ausencia de
mutaciones y aplicación única de las consecuencias. La revisión de UI incluye
final → acta → continuar → reabrir, filtros, jornadas futuras y tamaños de
1920×1080, 1366×768, 1024×768 y 390×844.

`tests/competitionPortal.test.mjs` añade invariantes de proyección sin mutaciones,
tabla/ficha consistente, calendario, jugadores a prueba, identidad pública,
estadísticas ausentes, kits, destinos antiguos e históricos mock inconsistentes.
QA headless aislada revisa las seis pestañas, fichas, retorno, Staff y FCF sobre
Tácticas en 1920×1080, 1366×768, 1024×768, 390×844 y 780×390. Una fixture local
simula un partido con el motor y applyPostMatch para revisar goleadores y actas
con datos reales. Los scripts y capturas están en `.competition-qa.local`, fuera
del código de producción; no se incorporan dependencias ni escenarios de prueba
al bundle. El perfil de Chromium de pruebas vive fuera del repositorio.

Validación final: 133 tests correctos; `npm run build`, `npm run lint` y
`git diff --check` correctos. Persiste el aviso previo de tamaño del bundle de
Vite (>500 kB), sin errores de compilación.
