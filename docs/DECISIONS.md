# Registro de decisiones

## Rediseño global y localizaciones sincronizadas · 26 de septiembre de 2026

El rediseño global autorizado unifica títulos, tipografía Bahnschrift, papel crema
y navy en todas las áreas principales. Panel es un hub de siete miniaturas con
datos derivados; Staff reúne cuerpo técnico, presidente, presupuesto y personal.
No se inventa una capacidad fija de staff. La iluminación depende exclusivamente
de la hora civil de la partida: día 07:00–19:29; noche 19:30–06:59. Cinco parejas
conservan composición; Tácticas conserva la pizarra y adopta los tokens nocturnos.
El teléfono global se conserva. Se añaden dos escenarios DEV reproducibles para
comprobar ambos momentos. Detalle de archivos, assets y pruebas en
[GLOBAL_UI_REDESIGN.md](GLOBAL_UI_REDESIGN.md). Quedan sustituidas las decisiones
visuales anteriores que mantenían pantallas azules o una página de Mensajes.


## Cierre emocional de la charla previa · 9 de septiembre de 2026

Esta revisión sustituye el recorrido por temas y el diálogo literal del entrenador
descritos en la entrada siguiente.

- Amistoso: contexto, un repaso opcional del plan y salida. Liga corriente y debut:
  se añade un cierre breve sobre los puntos, piña y grito. Rival directo, derbi,
  mala racha, objetivos, ascenso, carrera por playoff y encuentros decisivos:
  elección específica de arenga, narración, reacción y ritual. Semifinal, final y
  última jornada decisiva permiten palabras más largas. No hay menú de temas repetido.
- El usuario decide intenciones. Sus elecciones se presentan como narración y
  reacciones, nunca como diálogo de `MÍSTER`; se conserva el POV sin avatar.
- El repaso ofrece explicar, delegar en el segundo presente, recordar trabajo
  acreditado o no añadir indicaciones. Reutiliza relevancia táctica y sesiones
  completadas, con un máximo de dos referencias. Un informe rival es opcional y
  solo aparece con conocimiento y motivo acreditados. El segundo habla al grupo.
- La claridad del segundo deriva de conocimiento y organización, y su conexión
  de la relación con el grupo. El veterano simplifica; una exposición confusa
  consume más atención. No se crea otro sistema de Staff.
- La recepción de la arenga deriva de la diferencia de emociones individuales
  antes/después de esa decisión. No hay tirada de éxito, bonus colectivo ni nueva
  puntuación persistente. Confianza, nervios y motivación responden de forma distinta
  a las intenciones; la credibilidad también limita los mensajes tranquilizadores
  de confianza. Los efectos siguen limitados a ±4 y se diluyen durante el partido.
- La piña utiliza la cohesión existente, salvo recepción especialmente favorable
  o negativa. El capitán se obtiene del perfil social existente y debe estar
  convocado y disponible. Después se busca al segundo capitán, un jugador con
  influencia/liderazgo o se representa una acción del grupo. No se asigna capitanía.
- `teamName` es una instantánea del nombre del club en las fuentes de equipos.
  El grito lo convierte a mayúsculas; no se fija el nombre en el guion. El arranque
  conserva ese nombre. Las partidas antiguas usan la fuente de equipos como respaldo.
- `GROUP_CALL` amplía el motor común: llamada de 1,1 s y respuesta de 1,5 s,
  centradas, con tipografía destacada y movimiento reducido respetado. Son tiempos
  de presentación; no afectan a atención, emociones, semilla ni reloj del partido.
  Al acabar la respuesta se registra el cierre y se inicia el partido una sola vez.
- La versión 3 conserva el nodo y las decisiones al serializar. Los relatos antiguos
  conservan efectos y retoman el repaso opcional; los cerrados no vuelven a hablar.
  Hay 44 escenarios DEV reproducibles, incluidos los 20 casos pedidos.
- Se decide ofrecer el informe antes del plan y omitir comentarios automáticos del
  segundo sin información útil. No se añade sonido grabado, guardado a disco,
  generación de playoffs ni asignación automática de derbis. Ver [PREMATCH_TALK.md](PREMATCH_TALK.md).

## Charla previa dirigida por el jugador · 9 de septiembre de 2026

- Se revisa el flujo anterior con el mismo motor narrativo: ambiente neutral,
  elección de significado del partido, aporte breve del segundo si procede y
  menú de temas opcionales. El entrenador no explica automáticamente formación,
  táctica ni arenga. `Ya está. Al campo.` finaliza e inicia el encuentro sin otra
  confirmación ni intervención verbal.
- La escena adopta el POV del entrenador: `MÍSTER` identifica sus palabras y su
  silueta no se renderiza. La perspectiva es una opción de la escena compartida.
- Los temas y su estado se derivan del contexto y las menciones existentes. Se
  ofrecen primero los más relevantes, desaparecen tras hablar de ellos y siempre
  se puede terminar. Una sola idea adicional es una ruta completa y válida.
- Las fichas mock no equivalen a observaciones. La ausencia de `knowledge` pasa a
  significar `LIMITED`. Un informe exige `OBSERVED`, un segundo presente y una razón
  real: preparación explícita, conocimiento personal, encuentro anterior o partido
  importante. Amistosos y rivales claramente flojos quedan fuera. Sin informe, el
  segundo puede aportar consejo, ambiente, cansancio o silencio según el contexto.
- Las intenciones conservan efectos pequeños e individuales. La presión incorpora
  credibilidad, relación e importancia; quitar presión también puede restar algo de
  motivación competitiva. La atención depende de duración narrativa y factores
  humanos, con señales espaciadas y no repetidas. No se alteran estados permanentes.
- El renderer admite condiciones en elecciones y finales automáticos. Las escenas
  persistidas incluyen versión; al migrar una charla iniciada se preservan sus
  efectos y se devuelve el control al usuario sin reproducir los discursos antiguos.
- Se amplía DEV a 32 casos reproducibles. Derbi, rondas de playoff y fuentes explícitas
  de scouting quedan representables sin desarrollar nuevos generadores o procesos.
  El tema de jugador rival espera información real. Véase [PREMATCH_TALK.md](PREMATCH_TALK.md).

## Charla previa narrativa · septiembre de 2026

El flujo verbal y el criterio de información rival de esta primera implementación
quedan sustituidos por la revisión anterior; se conservan la integración, el
historial y los límites individuales de efectos.

- La previa deja de exigir una tarjeta de tono. `JUGAR PARTIDO` abre el vestuario
  en el motor narrativo común; `SALIR AL CAMPO` inicia la simulación después de
  completar la charla. El partido no existe ni avanza mientras se habla.
- Contexto, rival, staff, preparación, historial, familiaridad, entrenamiento y
  estados humanos alimentan una instantánea compartida por partido. No se inventa
  un sistema habitual en el debut ni información rival a partir de atributos ocultos.
- La duración se deriva de intervenciones idempotentes y afecta a la atención
  individual; no depende de cuánto tarde el usuario en leer. La ruta breve es válida.
- Los efectos son individuales, pequeños y exclusivos del partido. No modifican
  atributos deportivos ni estados humanos permanentes. Se atenúan durante los
  primeros 30 minutos disputados por cada jugador.
- Las elecciones de discurso no cambian instrucciones de forma implícita. Buscar
  la ventaja señalada exige un plan compatible; mantenerlo u observar siguen siendo
  opciones válidas. La preparación queda fijada al entrar en el vestuario.
- El progreso de escenas que lo solicitan se guarda en `GameState.narrativeRuntimes`.
  La charla conserva contexto y decisiones en la preparación del partido. Un
  `talkId` legado no evita la cinemática ni se convierte en efectos automáticamente.
- Playoff dispone de variantes narrativas vinculadas a una ronda explícita, sin
  añadir generación de eliminatorias. Criterios, límites y escenarios se detallan
  en [PREMATCH_TALK.md](PREMATCH_TALK.md).

## Bloqueo de navegación del onboarding

- La navegación guiada consulta una única guarda de dominio y solo se bloquea cuando el hito activo exige una pantalla concreta.
- `COMPLETE` es el estado terminal canónico. Al hidratar guardados antiguos, `FREE_PRESEASON` o haber completado `FIRST_FRIENDLY` limpian cualquier hito activo obsoleto y desactivan todas las restricciones del tutorial.
- El bypass de navegación DEV sigue teniendo prioridad sobre la guarda del tutorial.

## Migración global de narrativa presencial

- Toda escena presencial existente se reproduce mediante un único `NarrativePlayer`: alta completa con Manolo, presentación del segundo, presentación de Staff y Sito, conocimiento de la plantilla, charla inicial, conversaciones presenciales de Staff con Manolo, relato del entrenamiento e incidencias del veterano y del gracioso.
- Mensajes, WhatsApp, convocatorias e informes escritos permanecen en `conversations`/Mensajes. Las explicaciones de interfaz permanecen en spotlight, tour o prompt tutorial.
- Los finales declaran su destino. El encadenado `NARRATIVE:*` no pasa por una pantalla intermedia; los destinos de flujo temporal vuelven a la acción común de `App`.
- Los personajes fijos usan el registro de assets. Staff y jugadores de plantilla se resuelven dinámicamente por id y muestran nombre real con retrato placeholder si no existe asset propio.
- `ApplyConsequencesInput` admite las operaciones persistentes que ya requerían las escenas migradas (promesas, hechos, búsqueda de Staff y limpieza de conversación temporal). Las opciones narrativas no aplican estos efectos desde React.
- `CORRIDOR` y `CLUB_ROOM` se añaden como fondos semánticos placeholder; no incorporan arte definitivo.

## Voz del segundo entrenador en Entrenamiento

- Los cuatro arquetipos comparten `assistantPersonality.ts`, que centraliza tono, iniciativa, autoridad percibida, profundidad del análisis, variantes sembradas y respuestas del informe. La UI y Mensajes consumen la misma voz.
- El relato presencial del entrenamiento añade una intervención previa, una o dos lecturas contextuales y un cierre cara a cara sin convertir cada fase en diálogo. Las lecturas individuales se apoyan solo en eventos y estado real de la sesión.
- La intensidad elegida al planificar rige toda la sesión salvo una incidencia específica y excepcional. Se retira la decisión rutinaria de aflojar, mantener o esperar y sus efectos exclusivos sobre cansancio, relación, memoria y feedback. Los comentarios de esfuerzo del segundo son observaciones; las incidencias concretas y las decisiones sobre la siguiente sesión conservan su flujo.
- DEV ofrece cuatro escenarios del mismo primer entrenamiento y la misma seed, uno por arquetipo, para comparar exclusivamente la experiencia aportada por el ayudante.
- El segundo que forma parte del onboarding tiene presencia garantizada en el primer entrenamiento guiado. La excepción se aplica al preparar ese checkpoint, no a la disponibilidad general ni a sesiones posteriores; evita que una ausencia sembrada elimine la presentación jugable de su arquetipo.

## NarrativePlayer MVP

- La conversación inicial con Manolo migra el tramo real del objetivo de ascenso como segunda `NarrativeScene`: entra desde el alta del entrenador, vuelve después al presupuesto y conserva las respuestas, reacciones, evidencia y consecuencia existentes. La rama ambiciosa prueba relación, autoridad y memoria; una condición consulta esa memoria antes de la salida.
- Las escenas declaran metadatos opcionales de finalización y destinos tipados por prefijo (`NARRATIVE:` / `DIALOGUE:`). `App` encadena reproductores de forma genérica y `NarrativePlayer` ya no conoce decisiones ni escenas concretas; la evidencia narrativa se aplica dentro de `applyConsequences`.
- Las cinemáticas nuevas separan `NarrativeScene` (grafo de datos), runtime visual efímero y `NarrativePlayer` (overlay). El runtime no se guarda en `GameState`; al recargar se vuelve al checkpoint narrativo.
- La charla `initial_team_talk` es la única escena migrada. Conserva las cuatro respuestas, reacciones, evidencia del entrenador y consecuencias de Fase 2; estas últimas siguen pasando por `applyConsequences` y generan feedback inmediato global.
- Fondos, personajes, expresiones y posiciones se referencian mediante ids semánticos y registros. Los assets del MVP son placeholders dimensionados como futuros bustos.
- Los nodos automáticos tienen pausas acotadas y cada escena se valida antes de ejecutarse: referencias básicas, registros y existencia de un camino desde el inicio hasta `END`.
- La ejecución automática usa temporizadores controlados y cancelables ligados a `currentNodeId`, por lo que tolera el ciclo montaje/limpieza/montaje de React Strict Mode. No depende de eventos CSS; limita a 50 las transiciones consecutivas y muestra el nodo y sus estados temporales en DEV.
- El cierre explícito de la charla completa `FIRST_TRAINING_TALK`, vuelve al Panel y conserva `FIRST_TRAINING_READY` como checkpoint posterior. El escenario DEV usa el mismo grafo y reinicia estado, runtime y feedback mediante su builder existente.

## Navegación y aislamiento de escenarios DEV

- El contexto de navegación depende del tipo de escenario, no de haber usado el selector DEV. Los escenarios declarados con `onboarding: true` —incluido `Nueva partida normal`— conservan las guardas y transiciones reales; los saltos generales activan el bypass sin modificar el `GameState`.
- El botón `CONTINUAR` sigue usando la lógica real del checkpoint preparado. En escenarios con bypass, este se limita a navegación manual, accesos y botones de vuelta; nunca sustituye el avance de una presentación narrativa.
- Entrar en Staff desde `STAFF_HIGHLIGHT` completa primero ese hito, activa `STAFF_TUTORIAL` y abre automáticamente su escena. Si una partida antigua, HMR o DEV deja Staff abierto todavía en `STAFF_HIGHLIGHT`, la integración corrige idempotentemente el estado para evitar el softlock.
- Cada carga y reinicio reconstruye el escenario desde su builder y limpia la cola de feedback. Una revisión incremental remonta también el host visual para retirar toasts que ya estuvieran en pantalla.
- El menú DEV usa una capa superior a los overlays tutoriales, que siguen visibles y funcionales sin impedir cambiar o reiniciar escenarios.
- Los builders se validan mediante `validateDevScenario` antes de aplicarse. La charla inicial exige explícitamente diálogo activo, checkpoint pendiente, dos sesiones planificadas sin ejecutar, plantilla, Staff, táctica y estado de consecuencias.
- Un error de construcción muestra un diagnóstico `DEV SCENARIO ERROR`; un error de render queda contenido por `DevErrorBoundary`. En ambos casos el menú permanece accesible y ofrece reconstruir el escenario o volver al panel DEV. Estas superficies de diagnóstico no se activan en producción.
- El bypass ya es inherente a toda navegación iniciada desde el selector DEV, por lo que se elimina la casilla ambigua que podía anular diálogos al intentar ignorar bloqueos.

## Infraestructura transversal de consecuencias

- `applyConsequences` es la única operación transversal para decisiones narrativas: aplica efectos 0–100 con magnitudes estándar, modificadores de personalidad, flags, memorias, historial DEV y feedback diferido.
- El estado humano dinámico del jugador continúa dentro de `TrainingPlayerState`, evitando una segunda plantilla. La felicidad global sigue derivando de sus cuatro componentes existentes; una consecuencia global desplaza esos componentes de forma uniforme. `managerRelationship`, `managerAuthority` y `lockerRoomInfluence` son independientes.
- `GameState.manager.generalAuthority` es persistente y distinto de la autoridad individual. `calculateWeightedPlayerAuthority` y `normalizeGeneralAuthority` preparan su convergencia suave en checkpoints futuros, sin ejecutarla continuamente.
- `GameState.team.cohesion` sustituye al campo legado `dressingRoomCohesion`. La moral no se guarda: `calculateTeamMorale` la deriva de felicidad media (50%), cohesión (25%) y `recentResultsMood` (25%). Los resultados oficiales pesan más que los amistosos.
- Flags y memorias son conceptos separados. Las memorias son subjetivas por personaje e id; los flags registran hechos objetivos. Ambos, junto al `decisionLog` y la cola de feedback, son serializables dentro de `GameState`.
- El feedback de `applyConsequences` es `IMMEDIATE` por defecto: queda listo en la misma actualización que aplica la decisión. `DEFERRED` requiere una petición explícita y se libera mediante `flushConsequenceFeedback`.
- La UI consume cada aviso al incorporarlo a su pila local, limita la presentación a tres y procesa inmediatamente el resto de la cola cuando queda sitio. Un aviso consumido no vuelve a aparecer al cambiar de pantalla y nunca se traducen deltas numéricos a texto para el jugador.
- `hydrateGameState` aporta defaults y migra cohesión y `authorityWithCoach` de estados anteriores. El campo antiguo solo permanece tipado como entrada de compatibilidad y se elimina durante la hidratación.
- La respuesta ambiciosa a Manolo y las cuatro variantes de las primeras palabras al vestuario ejercitan la infraestructura sin añadir escenas ni desarrollar la pelea del amistoso.

## Overrides DEV del onboarding inicial

- `createNewGameState` y `createInitialStaffState` aceptan overrides opcionales de arquetipo de segundo y presencia de delegado. Sin overrides conservan exactamente el comportamiento determinista normal; el menú que los expone continúa detrás de `import.meta.env.DEV`.
- `REINICIAR ONBOARDING` crea un `GameState` íntegramente nuevo y limpia estado React auxiliar (escena, pantalla, focos de mensajes, validaciones, táctica y selección). No reutiliza hechos, conversaciones ni pasos del onboarding anterior.
- Forzar el segundo de confianza no evita su escena especial: la partida comienza antes de `MANOLO_INTRO`, por lo que el input de nombre y su propagación usan el flujo real.
- Los escenarios DEV declaran si reproducen onboarding. Esos escenarios conservan sus pasos y bloqueos exactos; el resto puede activar un bypass React no serializable que neutraliza el onboarding heredado, limpia la UI transitoria y deja la navegación libre. Reiniciar el onboarding siempre desactiva el bypass.

## Onboarding narrativo y segundo entrenador inicial

- Toda nueva partida genera exactamente un segundo entrenador mediante semilla: chaval enchufado (45%), veterano del club (30%), excapitán (18%) o persona de confianza (7%). El arquetipo y la identidad viven en `GameState`; el segundo de confianza puede ser nombrado por el jugador y bloquea al máximo su relación con el entrenador.
- La relación personal y la satisfacción del presidente y del Staff son dimensiones internas distintas, en escala 0–100, y se presentan mediante descriptores cualitativos. Las capacidades del segundo permanecen ocultas y alimentan los sistemas falibles ya existentes de alineación, entrenamiento y observación.
- El onboarding usa una secuencia serializable fina. Cada pantalla solo guarda su cambio y notifica la finalización; la máquina de onboarding decide el siguiente destino y fuerza el regreso al Panel tras Staff, Mensajes, Equipo, Táctica y la planificación de las dos sesiones.
- Tras planificar la semana no se ejecuta ningún entrenamiento. Vestuario, próximo partido y Liga se explican desde el Panel, y solo después de conocer personalmente a la plantilla y dar la primera charla aparece el checkpoint `EMPEZAR ENTRENAMIENTO`.
- La táctica y el XI base pasan a formar parte de `GameState` para que la preparación interactiva inicial sea serializable. Los campos anteriores del onboarding se conservan para compatibilidad con estados y escenarios existentes.
- La primera visita al Panel ya no reutiliza el tour genérico. `CLUB_PANEL_INTRO`, `CONTINUE_EXPLANATION`, `STAFF_HIGHLIGHT`, `STAFF_TUTORIAL`, `MESSAGES_HIGHLIGHT` y `MANOLO_MESSAGE` son pasos globales, obligatorios y serializables. Los pasos con objetivo usan un spotlight modal que intercepta eventos fuera del objetivo, acompañado por guardas equivalentes en la navegación de React.
- El mensaje inicial de Manolo se mantiene leído/oculto como novedad hasta terminar la presentación de Staff; entonces se marca como nuevo de forma idempotente y se muestra el badge en el Panel. La presentación de Staff excluye al segundo ya conocido, presenta dinámicamente al resto y a Sito, y trata la fisioterapia únicamente como servicio.
- Manolo no presenta a delegado, Sito, fisioterapia ni ningún miembro adicional: tras explicar el origen del segundo, la conversación termina y `SECOND_COACH_INTRO` conserva su presentación personal separada.
- Equipo, Táctica y Entrenamiento separan sus pasos `*_HIGHLIGHT` y `*_TUTORIAL`. Completar una pantalla siempre actualiza el estado global y vuelve al Panel; nunca conoce ni abre directamente el siguiente destino.
- El spotlight distingue `NAVIGATE_TO_TARGET` de `EXPLAIN_ONLY`. Vestuario, próximo partido y Liga usan el segundo modo: la tarjeta iluminada no recibe eventos y la única acción es `CONTINUAR TUTORIAL`.
- `MEET_SQUAD`, `FIRST_TRAINING_TALK` y `FIRST_TRAINING_READY` son tres pasos consecutivos. Terminar la charla vuelve al Panel y solo el CTA explícito de `FIRST_TRAINING_READY` permite consumir el checkpoint del primer entrenamiento.

## Mensajes como única vista de conversaciones

- El guardado normal de una planificación mantiene al usuario en Entrenamiento. Solo guardar la segunda sesión mientras `secondSessionPlanningDecision` está en `REVIEW_REQUIRED` resuelve esa petición y devuelve al Panel del club; nunca consume el siguiente checkpoint. Ejecutar el entrenamiento sigue requiriendo un `CONTINUAR` posterior.
- Mientras la decisión semanal sobre la segunda sesión esté confirmada (`KEPT` o `REVIEWED`) y esa sesión siga pendiente, el `CONTINUAR` global pulsado fuera del Panel solo cierra el flujo y vuelve al Panel. Únicamente una pulsación posterior realizada ya desde el Panel puede consumir el checkpoint del segundo entrenamiento.
- Tras la primera sesión de cada semana, el resumen del ayudante y la decisión sobre la segunda sesión viven en su hilo de Mensajes, no en la cinemática. La respuesta del entrenador y la réplica quedan en el historial. Si se elige revisar, `GameState.secondSessionPlanningDecision` bloquea `CONTINUAR` hasta guardar de nuevo la segunda sesión. Los ids incluyen semana y sesión para que la generación sea idempotente aunque los ids base de martes y jueves se reutilicen.

- La convocatoria es un `ConversationMessage` enriquecido de tipo `CALL_UP`. Sus datos de partido, lista, textos y reacciones viven en el propio mensaje serializable de `conversation-team-group`.
- La antigua pantalla independiente del grupo deja de ser un destino. Enviar una convocatoria abre Mensajes, selecciona el grupo y enfoca el mensaje creado; el hito histórico `TEAM_CHAT` se conserva por compatibilidad de partidas, pero ahora se resuelve dentro de Mensajes.
- La conversación seleccionada se conserva como `selectedConversationId` opcional en `GameState`. `teamChat` permanece únicamente como campo legado de estados anteriores y ya no recibe escrituras nuevas.

## Continuar global, conversaciones y prepartido

- `CONTINUAR` vive en `AppShell` y llama a la única acción de avance de `App`; nunca se desactiva y las obligaciones pendientes enrutan a su pantalla con una explicación.
- Cada entrenamiento completado añade un informe idempotente, fechado y específico de la sesión a la conversación del miembro de Staff deportivo presente. Tras cerrar la escena de sesión se abre esa conversación en Mensajes.
- La convocatoria utiliza `conversation-team-group` como historial real. Sus reacciones se guardan en el propio mensaje; `teamChat` se conserva por compatibilidad con la pantalla guiada de pretemporada.
- `PreMatchPreparation` guarda por partido XI, plan táctico, charla y completitud. El XI se valida exclusivamente contra la convocatoria y reutiliza el workspace táctico común.
- La charla previa v1 registra una elección narrativa moderada. No aplica todavía un modificador deportivo global ni altera atributos.
- El onboarding inicial encadena `SQUAD → INBOX → TRAINING_PLANNING`. `INBOX` es un hito serializable y bloquea el acceso guiado a Entrenamiento hasta que se completa; no convierte los mensajes informativos posteriores en bloqueos.
- Reconocer el informe del martes completa `FIRST_TRAINING_REPORT` sin navegar ni avanzar automáticamente. El siguiente `CONTINUAR` resuelve el checkpoint del jueves desde cualquier pantalla.
- Los destinos automáticos a Mensajes conservan conversación e id del mensaje enfocados. La UI selecciona, desplaza y marca como leído el informe recién generado.
- DEV ocupa una barra exclusiva fuera del shell visual del juego. En desarrollo el shell reserva su altura, por lo que no comparte coordenadas con `CONTINUAR`.
- Las validaciones de `CONTINUAR` respetan una jerarquía: primero el hito obligatorio del onboarding, después las obligaciones propias del hito de planificación y finalmente las validaciones ordinarias del calendario. La existencia anticipada de sesiones, convocatorias o partidos en `GameState` no puede bloquear un paso tutorial anterior.
- Las primeras palabras al vestuario ya no forman parte de la presentación de plantilla. `FIRST_TRAINING_TALK` es un hito y una escena serializables entre `TRAINING_PLANNING` y `FIRST_TRAINING`; al completarse una vez aplica la evidencia humana y entrega el control al checkpoint del martes.
- Mensajes no ofrece temas genéricos para iniciar conversaciones con Manolo. Objetivos, presupuesto y peticiones amplias permanecen en la conversación presencial; la mensajería solo muestra respuestas cuando el mensaje concreto declara `responseOptions`.
- Cada mensaje conserva `timestamp` y `order`. La normalización ordena por ambos, la adición asigna un orden creciente y nunca permite que una acción nueva quede antes del último mensaje existente. Una opción puede declarar una réplica contextual, insertada después de la respuesta del entrenador.

## Incidencia, convocatoria amistosa y grupo del equipo

- La incidencia reutiliza escenas tipadas y aparece solo tras el primer entrenamiento completado con intensidad Alta o un bloque Físico. El veterano se elige por rasgo, edad e identificador, y un hecho narrativo serializable impide repetirla.
- Durante las dos primeras sesiones guiadas aparece además una incidencia cotidiana con un jugador de perfil social. Si el veterano ocupa la primera sesión, esta segunda escena queda para la segunda; si ambas coinciden entonces, el veterano se resuelve primero y una transición separa las dos conversaciones.
- Las promesas de bajar carga o introducir más balón amplían `PromiseState` con un tipo reutilizable. Se resuelven una sola vez contra el siguiente entrenamiento completado, sea cual sea su día o semana.
- El amistoso reutiliza `MatchSquadSelection` e historial, sin límite ni exclusión de jugadores a prueba. La lista anunciada pasa a ser también la disponibilidad real del motor de partido.
- El grupo del equipo es distinto del Buzón. Conserva mensajes tipados y reacciones en `GameState`; la convocatoria usa un identificador estable para impedir duplicados.

## Decisiones del flujo narrativo de entrenamiento

- Cada gol actualiza primero el marcador y abre una interrupción automática serializable. La UI presenta una celebración diferenciada, después ofrece mantener o entrar en la intervención táctica existente, y el evento se consume una sola vez al reanudar.

- Calidad General y calidad por posición permanecen como cálculos internos 0–100 y se presentan mediante una escala centralizada de 1–5 estrellas con medias estrellas. Los tooltips solo expresan estrellas.
- Forma, Felicidad, Condición, Cansancio y relación individual con el entrenador se muestran cualitativamente. Los atributos deportivos 1–20 y las estadísticas objetivas de partido siguen siendo numéricos.
- Cada jugador conserva en `PlayerSeasonStats` las valoraciones de los partidos en los que disputó minutos. Valoración media y Últimos 5 derivan del mismo histórico; no se reconstruyen valoraciones para apariciones anteriores sin registro.

- Los estados humanos, físicos y de familiaridad mantienen escala interna 0–100, pero se muestran principalmente mediante etiquetas cualitativas compartidas; la autoridad nunca se presenta como porcentaje.
- Las ausencias previstas pertenecen a la disponibilidad inicial. Una falta sin avisar parte de una probabilidad excepcional y solo aumenta con factores humanos o de personalidad ya modelados.
- `INCIDENCIAS` se reserva para hechos que alteran claramente la sesión. Observaciones rutinarias se narran aparte y una sesión sin incidencias es el resultado habitual válido.
- Tras completar la primera sesión, Mensajes recuerda el plan de la segunda y pregunta si se mantiene o revisa. `PLANNED` permanece editable y la resolución consume siempre sus valores actuales; solo `COMPLETED` queda bloqueada.

- La pantalla Entrenamiento solo edita planes y muestra resultados ya ocurridos. Nunca ejecuta una sesión.
- El checkpoint temporal resuelve asistencia y Staff reales, eventos y efectos mediante `resolveTrainingSession`; el resultado se guarda y no se recalcula al navegar.
- Previsiones y hechos reales permanecen separados. Las incidencias son una unión discriminada y una sesión sin incidencias es válida.
- La escena de sesión deriva cinco fases del resultado persistente. Su avance visual no forma parte de `GameState`.
- `GameState` conserva tanto `training` como `inboxMessages`; navegar, volver a abrir una sesión o cargar el mismo estado no vuelve a resolver efectos ni duplica informes.
- `getNextPendingGameEvent` prioriza onboarding, planificación incompleta y mensajes que requieren atención antes de delegar en el calendario. Un mensaje normal sin leer nunca bloquea `CONTINUAR`.
- Tras Manolo, el onboarding presenta una sola vez el Panel del club mediante un tour persistible. Staff, Táctica, Equipo y Preparación de entrenamiento se abren manualmente desde el Panel, que actúa como centro de operaciones. Tras la primera sesión se muestra el informe y se deja una parada para retocar la segunda.

## Decisiones de convocatoria

- Un partido de Liga exige una convocatoria anunciada de 11 a 18 jugadores. `PRE_MATCH` sigue siendo el checkpoint y `getNextPendingGameEvent` dirige a Próximo partido mientras falte la lista.
- La elegibilidad deriva del estado real: lesionado, sancionado, indisponible o `TRIAL` no son descartes técnicos. Los amistosos no aplican el límite oficial y mantienen disponibles los jugadores a prueba.
- `GameState.squadSelections` guarda la lista bloqueada por partido y `squadSelectionHistory` conserva un registro por jugador. Resolver de nuevo el mismo partido no reaplica reacciones ni mensajes.
- La reacción por descarte técnico combina uso previo, calidad, felicidad, autoridad, personalidad y racha de ausencias. Solo las reacciones relevantes producen un mensaje posterior.

## Decisiones de workspace táctico y sustituciones

- El XI automático se resuelve como una asignación global entre jugadores y slots. Minimiza primero posiciones improvisadas, después usos compatibles y solo entonces compara valoración posicional, estado físico y preferencias falibles del segundo entrenador.
- La propuesta del segundo conserva siempre la formación activa. Su conocimiento, observación e interés de pretemporada pueden cambiar qué candidato válido prefiere, pero no justifican una improvisación cuando existe una alineación completa estructuralmente compatible.
- La posición ocupada se clasifica como preferida, compatible o improvisada. Preferida recibe solo un punto moderado en la valoración posicional; compatible no sufre penalización genérica; improvisada reduce únicamente atributos relevantes para el puesto.
- Las posiciones de banda son ampliamente intercambiables. Laterales, carrileros e interiores de ambos lados forman una familia compatible; ED/EI también pueden alternar extremo e interior. Las ponderaciones del puesto siguen produciendo medias diferentes.
- Táctica e intervención reutilizan `TacticalWorkspace`. Clic y drag & drop solicitan la misma operación de alineación y las validaciones futbolísticas permanecen en dominio.
- La propuesta del segundo entrenador es determinista y falible: combina conocimiento, observación, condición, perfil, seed e interés moderado por probar jugadores en pretemporada. Se previsualiza antes de aplicar.
- Liga y amistoso consultan una configuración única de sustituciones. Liga conserva tres interrupciones propias y ventana rival; el amistoso permite interrupciones libres y no ofrece esa ventana.
- La condición de partido se representa mediante cuatro segmentos y etiqueta accesible. Nota numérica, media posicional y ánimo permanecen separados.

## Decisiones de pretemporada y onboarding v1

- La plantilla empieza la pretemporada con fatiga mínima y condición física variable, generalmente mejorable. La seed de partida determina ambos valores; el cansancio relevante aparece después por carga real.
- Condición, fatiga e incidencia física puntual son estados independientes y serializables por jugador. Las incidencias tienen duración, modificadores temporales de rendimiento, recuperación y riesgo, y nunca alteran atributos base.
- Una nueva partida genera de cero a dos incidencias leves mediante seed. Táctica muestra siempre condición y cansancio cualitativos, además de la incidencia cuando existe.
- La partida empieza el 25 de agosto, antes de la Jornada 1. El onboarding es estado serializable de la partida y utiliza calendario, plantilla, entrenamientos, familiaridad y partidos reales.
- Manolo enlaza con el Panel del club. Un tour guiado explica sus tarjetas y después señala, sin bloquear la navegación libre, Staff, Táctica, Equipo y Preparación de entrenamiento. Cada paso devuelve al Panel antes del siguiente; después continúan los dos entrenamientos y el primer amistoso.
- La plantilla inicial distingue jugadores que continúan y jugadores `TRIAL`. Los jugadores a prueba entrenan, aparecen en Equipo y Táctica y pueden jugar amistosos; no tienen todavía cuota, compensación ni proceso de contratación.
- El calendario y el estado de partido distinguen `LEAGUE` y `FRIENDLY`. Un amistoso no da puntos, no avanza jornada, no resuelve otros resultados oficiales ni alimenta estadísticas y sanciones de liga.
- Las presentaciones consultan el Staff generado. La ausencia de segundo entrenador cambia el texto y nunca bloquea el flujo.

## Decisiones del motor de partido v1

- La reproducción visual solicita pasos incrementales al dominio. El cronómetro, la pausa y las velocidades Normal/Rápida nunca intervienen en la semilla ni cambian el resultado.
- La narración contextual interpreta acciones ya resueltas y no aumenta por sí misma tiros o goles. Eventos destacados y contexto tienen jerarquía visual diferente.
- Rendimiento, condición y ánimo conservan valores internos; sus etiquetas visibles son derivadas. El ánimo de partido no sobrescribe la felicidad persistente.
- El segundo entrenador muestra como máximo las observaciones actuales más relevantes, basadas en telemetría y sujetas a error, cooldown temático y disponibilidad real.
- El partido conserva un `MatchState` serializable y avanza mediante acciones deterministas hasta cortes lógicos; una intervención cambia solo el futuro.
- Las acciones se resuelven con atributos individuales y contexto de ruta/duelo. Las medias por posición quedan para selección y UI, no como resolución global.
- Formación e instrucciones existentes modifican ocupación, rutas, espacio, coberturas, volumen y coste físico; no conceden bonus fijos de ataque o defensa.
- Familiaridad, autoridad, felicidad, personalidad y cohesión alteran coordinación, adherencia, implicación, concentración y ayudas, sin modificar universalmente los atributos deportivos.
- El rival usa el mismo estado de equipo y marco de atributos mediante un adaptador determinista mientras su plantilla completa siga siendo simplificada.
- El resultado confirmado actualiza el calendario vivo y los eventos de gol vivos. Clasificación, Resultados y Goleadores derivan de esas mismas fuentes.
- El postpartido conecta minutos, goles, tarjetas, condición, cansancio, lesiones simples y cambios humanos moderados con la semana siguiente.

## Decisiones del ciclo semanal y calendario

- `CONTINUAR` avanza hasta el siguiente momento relevante, no un número fijo de días. Los días sin checkpoint se procesan sin devolver el control.
- El calendario oficial guardado en la partida es la fuente de verdad para fecha, jornada y próximo partido. La jornada deriva de partidos oficiales ya disputados.
- La semana ordinaria tiene entrenamientos el martes y el jueves a las 19:30. Cada sesión conserva identidad propia y solo se puede ejecutar al alcanzar su checkpoint.
- Los partidos se programan en sábado o domingo, con mayoría dominical y horarios deterministas apropiados para fútbol amateur.
- La disponibilidad del Staff se resuelve por actividad con semilla, fecha, disponibilidad, compromiso y fiabilidad. Solo los presentes aportan impacto; entrenar solo sigue siendo válido.
- Las solicitudes de Staff tardan entre dos y cinco días de forma determinista. Al resolverse crean una conversación pendiente con Manolo y no presentan candidatos silenciosamente.
- Los vencimientos de cuotas se procesan con el calendario del club, sin alimentar el presupuesto deportivo. La mayoría se paga automáticamente y los retrasos nuevos son minoritarios y reproducibles.
- Una conversación obligatoria y la previa de partido son checkpoints bloqueantes. El motor nunca avanza más allá de un partido oficial sin resolverlo.
- Los eventos temporales nacen principalmente del estado (solicitudes, cuotas y futuros sistemas médicos o de vestuario), no de una tirada diaria de anécdotas.

## Decisiones de cuotas, fisioterapia y conversaciones con Manolo

- Estado del vestuario muestra un resumen derivado de los mismos planes de cuota que Equipo: conteos generales, casos pendientes y presión actual de Manolo. No guarda un segundo estado ni muestra contabilidad del club.
- Los retrasos se clasifican como menores, relevantes o graves según vencimientos acumulados y decisiones explícitas existentes. Esta gravedad prepara recordatorios y conflictos, pero nunca bloquea automáticamente a un jugador.
- Los impagos son también un asunto social: en el futuro podrán afectar felicidad, cohesión, autoridad y relaciones. Los acuerdos conservan si son conocidos solo por el entrenador o también por el vestuario para no asumir conflictos públicos automáticos.
- En una plantilla normal de 4a Catalana lo habitual es que nadie cobre. La generación determinista produce aproximadamente un 92% de plantillas sin remunerados, un 7% con uno y un 1% con dos; las compensaciones son modestas, redondas y tienen contexto narrativo.
- Una exención o acuerdo especial es deliberadamente más frecuente que pagar a un jugador. Las diferencias conocidas por el grupo quedan preparadas como posible fuente de conflictos futuros.
- La cuota estándar es de 500 euros por temporada para todo jugador sujeto a cuota. Puede pagarse completa o a plazos; Equipo muestra estados narrativos como `Pagada`, `Al día` o los meses pendientes, no importes aportados.
- Las cuotas pertenecen a la economía general del club, controlada por Manolo, y nunca aumentan el presupuesto deportivo del entrenador. Este último solo paga entrenador, Staff y jugadores remunerados.
- Pueden existir acuerdos especiales, rebajas o exenciones. Los impagos no impiden jugar automáticamente: una restricción por deuda debe ser una decisión explícita futura del club o de Manolo.
- El plan de cuota conserva pagos y vencimientos pendientes, y queda preparado para aplazamientos, cambios de plazos, recordatorios, conflictos y negociación.
- Un contacto externo de fisioterapia presta sesiones a jugadores concretos. Normalmente cada jugador decide y paga su tratamiento; el gasto no consume presupuesto deportivo. Rechazo, alternativa, ayuda del club y recuperación sin tratamiento recomendado quedan modelados para el futuro.
- Un fisio permanente continúa siendo posible como miembro de Staff, pero es una incorporación excepcional y distinta de un contacto externo.
- `Hablar con Manolo` abre una `NarrativeScene` contextual en `NarrativePlayer`. Las opciones pueden depender del estado de partida y sustituyen el selector administrativo de candidatos.
- Pedir ayuda crea una solicitud de búsqueda pendiente; no presenta candidatos inmediatamente. La resolución por paso de días, el mensaje de Manolo y la presentación narrativa de candidatos quedan pendientes del ciclo semanal.
- Durante los primeros días Manolo permite hablar, pero corta peticiones de Staff hasta que se haya completado al menos un entrenamiento.

## Decisiones del sistema narrativo y nueva partida

- Durante la beta se juega siempre con el FC Poblenou. Manolo Escudero es el presidente fijo y Sito el encargado del campo fijo; el entrenador principal usa el nombre elegido por el jugador.
- La creación del entrenador forma parte de la conversación inicial y solo solicita el nombre. La edad del entrenador se elimina; el perfil se construirá gradualmente mediante evidencia de sus decisiones.
- Las conversaciones son escenas reutilizables definidas fuera de React como grafos de nodos tipados. Admiten narración, diálogo, elecciones, input, condiciones, efectos, saltos y final; la pantalla solo representa el nodo visible.
- Las escenas relevantes pueden ocupar temporalmente una pantalla propia. Esto reemplaza la decisión inicial que limitaba todas las conversaciones a un bloque del Panel del Club.
- Una nueva partida comienza con la introducción y no permite entrar al Panel hasta completarla. Su final conserva entrenador, expectativa, Staff y escena completada en el estado de partida, evitando que la introducción se repita durante esa sesión.
- La única condición de victoria de la beta es ascender a 3a Catalana. Ascenso directo y playoff cuentan igual como victoria; terminar la temporada sin ascender supone perder la partida, independientemente de expectativas o valoración presidencial.
- Las expectativas del presidente —como ocupar puestos de playoff o mantener el vestuario controlado— son parciales y no sustituyen el objetivo esencial de ascenso.
- El presupuesto deportivo mensual es una caja común para entrenador, staff y jugadores. Se genera de forma reproducible entre 400 y 700 euros, siempre en incrementos de 50 y con mayor frecuencia de valores centrales.
- La compensación mínima del entrenador es 150 euros con presupuestos de 400–600 y 200 euros con presupuestos de 650–700. La asignación inicial usa ese mínimo; una elección posterior queda preparada mediante validación de dominio.
- Los pagos mensuales de Staff consumen presupuesto; gratuidad, favores, pago presidencial y pago por asistencia no son gasto mensual fijo. Los pagos a jugadores consumen, pero sus cuotas quedan fuera del presupuesto deportivo.
- La edad numérica no forma parte del modelo de Staff ni se muestra. La edad de los jugadores se mantiene porque sí tiene consecuencias deportivas.
- Promesas, favores y evidencia del entrenador tienen modelos persistibles mínimos, pero sus mecánicas completas quedan pendientes.

## Decisiones iniciales

- La primera versión será una aplicación web local.
- Se utilizarán React y TypeScript.
- La interfaz y el motor estarán separados.
- La beta tendrá una única temporada.
- No se utilizará backend inicialmente.
- No se añadirá Tauri hasta que el prototipo sea estable.
- Primero se construirá una maqueta funcional, no el diseño visual definitivo.

## Decisiones del Hito 1

- El club provisional se llama FC Poblenou.
- Los nombres de jugadores y equipos serán ficticios y provisionales.
- La decisión inicial de mostrar 4-2-3-1 queda reemplazada por el estado actual
  de la pantalla: Tácticas abre en 4-4-2 y permite cambiar a las demás formaciones.
- Las ideas de juego disponibles serán:
  - Equilibrada.
  - Juego directo.
  - Posesión.
  - Repliegue y contraataque.
- La navegación será libre desde el panel del club.
- El menú principal servirá como entrada al prototipo.
- Los eventos y conversaciones aparecerán como un bloque dentro del panel
  del club, sin una pantalla independiente.
- La interfaz estará pensada primero para ordenador, pero deberá adaptarse
  razonablemente a pantallas pequeñas.
- El diseño visual será funcional y provisional.
- Se creará una carpeta src/domain para los tipos del juego, aunque todavía
  no contendrá lógica de simulación.

## Decisiones de la pantalla Equipo

- Un jugador puede tener una o varias posiciones. Cuando tenga varias, se
  mostrarán separadas por una barra, por ejemplo `LD / DFC`.
- La decisión inicial de mostrar una `Calidad` fija queda reemplazada: Equipo
  muestra, en este orden, Pos, Nombre, Calidad General, Forma, PJ,
  G, Edad, Personalidad, Felicidad y estado de Cuota.
- El antiguo importe de `Ingresos` ya no representa cuotas ni compensaciones en
  la UI. Ambos tienen estado financiero propio; solo las compensaciones con
  financiación `SPORTS_BUDGET` consumen presupuesto deportivo.
- La plantilla usa un único modelo compartido por Equipo y Tácticas; la calidad
  general y la mejor posición se derivan siempre de los atributos.
- Los jugadores usan 18 atributos en escala 1–20, posiciones principal y
  secundarias, pierna hábil, arquetipo y posibles rasgos. Ningún atributo generado
  puede valer 0.
- Cada posición tiene un rating teórico ponderado. En multposición, la Calidad
  General es el máximo rating entre posiciones naturales.
- La plantilla mock se genera de forma determinista con semillas fijas, objetivos
  aproximados, arquetipos y rasgos. No se guarda una calidad editable.
- Los porteros parten de rangos propios para sus atributos de campo. El ajuste de
  calidad solo modifica atributos ponderados y prioriza los de su arquetipo.
- La calidad de un portero pondera Paradas al 50%; Juego de pies POR al 10%;
  Juego aéreo POR y Mentalidad al 15% cada uno; y Comunicación al 10%.
- Juego de pies POR es independiente de Pases, Técnica y Regate.
- La generación concentra los atributos en valores medios y aplica topes blandos:
  el ajuste normal reparte mejoras y no crea valores 19–20, reservados a una
  probabilidad excepcional en fortalezas del arquetipo.
- Los arquetipos y rasgos orientan la distribución sin imponer valores rígidos.
  Dos jugadores del mismo perfil pueden tener atributos diferentes.
- La ficha del jugador se abre como un diálogo dentro de Equipo para mantener la
  navegación sin router y permitir volver a la tabla sin cambiar de pantalla.
- La ficha solo muestra el bloque de atributos de portería cuando `POR` forma
  parte de las posiciones naturales del jugador.
- Equipo y Tácticas reutilizan una única ficha de jugador. En el campo, la
  valoración se deriva de la posición táctica actual; en el banquillo se muestra
  la Calidad General derivada de sus posiciones naturales.
- La familiaridad posicional se deriva de la distancia mínima en un grafo de
  posiciones relacionadas. Penaliza temporalmente entre 0 y 3 puntos únicamente
  los atributos ponderados del puesto; `POR` permanece separado del resto.
- `calculatePositionRating` representa capacidad teórica sin familiaridad;
  `calculateTacticalRating` representa rendimiento actual con atributos efectivos.
  Ninguno se persiste en los datos mock.
- El aprendizaje progresivo de nuevas posiciones queda planificado. Todavía no
  existen entrenamiento, experiencia ni minutos que alteren la familiaridad.

## Decisiones de la pantalla Staff

- La calidad numérica del staff es interna. La pantalla muestra únicamente rol,
  nombre, carácter conocido, disponibilidad aproximada y coste; no existen
  vacantes obligatorias ni una valoración general visible.
- Staff estará disponible desde la navegación principal y desde su bloque en
  el Panel del Club.
- El primer entrenador representa al usuario, siempre existe y no tiene una
  calidad comparable a los NPC. Su perfil se irá definiendo mediante decisiones.
- Los NPC tienen un rol principal, pero sus capacidades internas son
  transversales: en el fútbol amateur todos pueden ayudar en varias tareas.
- Personalidad real y conocimiento del entrenador son datos distintos. Antes de
  conocerla, la interfaz usa indicios narrativos y muestra «Por conocer».
- Sito es el encargado del campo fijo. Siempre existe como personal del club
  separado; no se contrata, no se despide desde Staff y no consume presupuesto deportivo.
- Staff comparte el presupuesto deportivo mensual con entrenador y jugadores.
  Solo los acuerdos mensuales consumen disponible fijo; gratuidad, favores, pago
  presidencial y pago por asistencia no lo hacen.
- Las personas protegidas o impuestas no pueden abandonar silenciosamente el
  cuerpo técnico: la interfaz exige hablar antes con el presidente.
- La búsqueda de ayuda pasa por el presidente y devuelve candidatos narrativos
  sin atributos visibles. El retraso temporal y las fuentes dinámicas quedan
  pendientes de la integración futura con calendario y eventos.
- El impacto se calcula por áreas separadas (entrenamiento, grupo, recuperación,
  táctica, información y porteros), considerando capacidad, compromiso,
  fiabilidad y disponibilidad, sin un multiplicador universal.

## Decisiones de la pantalla Clasificación

- Los 12 clubes de la liga viven en un mock común identificado por `id`, preparado
  para reutilizarse en calendario, resultados, goleadores y sanciones.
- Los partidos disputados son la única fuente de verdad de la clasificación. No
  se persisten puntos, estadísticas clasificatorias ni rachas por jornada.
- La sección de liga muestra sus cuatro pestañas, aunque en esta fase únicamente
  Clasificación tiene contenido y navegación activa.
- La jornada actual del mock es la 10, coherente con los partidos jugados de la
  clasificación provisional. Las jornadas 11–22 se muestran desactivadas.
- El histórico de clasificación se reconstruye acumulando los resultados hasta
  la jornada consultada. Goleadores queda preparado mediante eventos acumulables
  y Sanciones mediante jornada de inicio y número de partidos.
- El desempate provisional se ordena por puntos, diferencia de goles y goles a
  favor; si persiste, se usa el identificador del equipo para un orden estable.
- Resultados y Clasificación comparten los mismos partidos, equipos, selector de
  jornada y navegación de pestañas. Resultados muestra exclusivamente los seis
  encuentros de la jornada consultada mediante la consulta de dominio común.
- Los eventos de gol se almacenan separados de los partidos y referencian partido,
  equipo y autor. Se generan desde los marcadores mock y se validan contra ellos.
- Goleadores acumula esos eventos hasta la jornada consultada. Los autores del FC
  Poblenou referencian la plantilla real; los rivales usan identidades mínimas.
- La jornada seleccionada de La Liga vive en `App.tsx` y se conserva al cambiar
  entre Resultados, Clasificación, Sanciones y Goleadores.
- Las sanciones tienen una fuente independiente y se consultan por vigencia, no
  de forma acumulativa. Jornada inicial y duración determinan las jornadas en las
  que el jugador no puede participar y los partidos que aún le quedan.

## Decisiones de la pantalla Entrenamiento

- La planificación semanal contiene dos sesiones (martes y jueves), con dos bloques cada una e intensidad Baja, Media o Alta aplicada a toda la sesión.
- Completo, Lúdico y Descanso ocupan los dos bloques. Entrenamiento «De mínimos» no es seleccionable: será un resultado futuro cuando asistan 12 jugadores o menos; el mínimo para una sesión normal será 13.
- Las variables generales e individuales del entrenamiento usan internamente una escala 0–100. Felicidad y calidad pueden representarse mediante etiquetas.
- La Familiaridad Táctica General se calculará en el futuro con un 80% de instrucciones y un 20% de formación. Cada opción táctica y cada formación podrán conservar su familiaridad 0–100.
- Existe una única familiaridad de Balón parado, independiente de la familiaridad táctica.
- Los bonus provisionales decimales por atributo, su decadencia, continuidad y consolidación permanente se procesan al cerrar la semana. El valor efectivo nunca supera 20 y el bonus tiene un máximo provisional de +2.
- La calidad de sesión pondera asistencia, autoridad, staff y estado del grupo. Solo los asistentes reciben efectos y con menos de 13 la sesión se resuelve De mínimos.
- La familiaridad táctica conserva valor actual y máximo histórico por opción y formación. Su memoria acelera la recuperación y limita la decadencia; Balón parado mantiene memoria independiente.
- Las doce personalidades beta se implementan mediante modificadores compartidos, no mediante ramas específicas por jugador. Afectan satisfacción con entrenamientos y autoridad individual.
- La felicidad individual es la media de relación con compañeros, tiempo de juego, satisfacción con entrenamientos y resultados. En esta fase solo entrenamiento y Lúdico actualizan componentes; partido y minutos quedan por conectar.
- El riesgo de lesión y de conflicto están calculados y encapsulados, pero todavía no generan lesiones médicas ni eventos narrativos.

## Decisiones de la pantalla Próximo partido

- El próximo partido es el primer encuentro con estado `scheduled` en el que participa el FC Poblenou, ordenado por jornada, fecha y hora. El calendario guarda esos datos y no existe un partido específico hardcodeado en la pantalla.
- El perfil estático de cada rival contiene únicamente su posición en la temporada anterior, formación habitual, comportamiento con y sin balón, un patrón observado opcional y debilidades colectivas que todavía no pueden deducirse de forma fiable.
- La posición y estadísticas actuales proceden de la clasificación calculada con partidos disputados. La dinámica se obtiene de sus últimos cinco resultados como máximo y los goles individuales se cuentan desde los eventos de gol anteriores al próximo encuentro.
- Los jugadores a vigilar se ordenan de forma determinista por goles y después por calidad derivada para su posición. Sus fortalezas y las debilidades individuales básicas se describen a partir de atributos; no se guardan listas destacadas por jornada.
- El scouting de esta fase es determinista y no introduce información falsa cuando faltan partidos, goles o campos opcionales. En una fase futura, la calidad del staff podrá modificar la cantidad y precisión del informe, e incluso introducir apreciaciones erróneas.

## Decisiones de la mini clasificación del Panel

- La tarjeta de La liga reutiliza la clasificación calculada desde los partidos disputados hasta la jornada actual; no guarda posiciones ni puntos duplicados.
- La mini tabla intenta centrar una ventana de cinco equipos alrededor del FC Poblenou. En los extremos desplaza la ventana para conservar cinco filas siempre que la competición tenga suficientes equipos.
- El acceso a la clasificación completa conserva la navegación por estado existente en `App.tsx`.

## Decisiones de las previsualizaciones del Panel

- Táctica y Entrenamiento reciben el mismo estado vivo que sus pantallas desde `App.tsx`; no existe un mock específico del Panel.
- Equipo muestra el total de la plantilla y las sanciones vigentes para la próxima jornada. Las lesiones y la disponibilidad completa no se muestran hasta que exista un sistema médico.
- El estado humano combina felicidad y autoridad derivadas del entrenamiento con la cohesión actual del club. Las etiquetas descriptivas se generan mediante un helper de dominio compartido.
- Buzón dispone de mensajes tipados y estados propios; los antiguos eventos del
  club no actúan como sustituto de un mensaje.
- Cada sesión distingue explícitamente `UNPLANNED`, `PLANNED` y `COMPLETED`. `PLANNED` conserva la instantánea táctica prevista pero sigue siendo editable; únicamente `COMPLETED` es inmutable.

## Decisiones de Estado del vestuario

- Cohesión, ánimo colectivo y autoridad usan escala interna 0–100, pero se muestran
  mediante categorías descriptivas. El ánimo deriva de la felicidad individual y
  la autoridad de los valores individuales existentes en Entrenamiento.
- La felicidad conserva sus cuatro componentes actuales. La relación individual
  con el entrenador y la influencia social quedan como valores separados: no se
  incorporan artificialmente al cálculo de felicidad.
- Los perfiles del vestuario referencian jugadores de la plantilla mediante
  `playerId`; no existe una segunda plantilla. Añaden únicamente rol de plantilla,
  relación con el entrenador, influencia, papel social y situación relevante.
- La cohesión, los asuntos actuales y los últimos cambios son mock determinista.
  Minutos, resultados, conversaciones y eventos todavía no los actualizan.
- La influencia prepara futuras voces y dinámicas sociales, pero en esta fase no
  crea grupos, amistades, conflictos ni efectos jugables.

## Decisiones de Buzón y expectativas

- Buzón es el canal para comunicar eventos y consecuencias procedentes del
  presidente, staff, jugadores, club y competición. Los mensajes pueden estar
  nuevos, leídos, pendientes de respuesta o resueltos.
- Buzón representa comunicaciones y cambios, no el estado permanente. Las
  expectativas y la confianza del presidente tienen una única fuente de verdad
  y se consultan en Estado del vestuario; los mensajes del presidente solo hacen
  referencia narrativa a ellas.
- Las respuestas solo cambian el estado local del mensaje en esta fase. No crean
  promesas ni modifican felicidad, relación, autoridad o confianza hasta que se
  implemente el motor de consecuencias y la persistencia.
- Clasificarse para el playoff puede ser una expectativa parcial de la directiva,
  pero no sustituye la condición final de ascender a 3a Catalana.
- El club también espera mantener un buen ambiente en el vestuario. La confianza
  del presidente existe como estado propio y se muestra mediante categorías, pero
  todavía no tiene una fórmula dinámica.
- Las evaluaciones son relativas a lo esperado, no al resultado aislado. La
  futura fórmula considerará clasificación, distancia al objetivo, últimos
  partidos, tendencia y momento de la temporada para evitar reacciones excesivas
  partido a partido.
- El flujo futuro es `expectativa → realidad → evaluación → reacción →
  consecuencias`. Por ejemplo: expectativa deportiva → resultados → evaluación
  del presidente → confianza; rol esperado → minutos reales → felicidad → mensaje
  del jugador.
- Los roles de plantilla ya preparados en Estado del vestuario representan el
  rol esperado. Su comparación con el uso real queda pendiente y no duplica el
  campo deportivo descriptivo `Player.role`.
- Confianza, evaluaciones y mensajes podrán alimentar autoridad, vestuario,
  advertencias y despido, pero esas cadenas todavía no están activas.
- Una evaluación inferior podrá reducir la confianza y, posteriormente, la
  autoridad y la tolerancia del vestuario; una evaluación superior podrá producir
  el efecto contrario. Esta relación queda preparada conceptualmente, sin aplicar
  modificadores automáticos en esta fase.

## Decisiones de la superficie táctica compartida

- Táctica y la intervención durante el partido comparten el mismo campo,
  geometría de formaciones, tarjetas de jugador, banquillo e instrucciones.
- La valoración visible de un titular corresponde al puesto que ocupa en la
  formación seleccionada; no modifica su calidad general ni sus posiciones
  naturales.
- Durante el partido, las recolocaciones, sustituciones e instrucciones se
  preparan en un borrador local. Solo `Confirmar cambios` los aplica de forma
  atómica al estado del partido; cancelar no deja efectos parciales.
- Un jugador sustituido puede volver a entrar; un expulsado no. El portero del
  once confirmado debe tener `POR` como posición natural.
- Las familiaridades se presentan mediante categorías cualitativas en esta
  superficie, aunque el dominio conserva sus valores internos en escala 0–100.

## Decisiones de interrupciones y continuidad del flujo

- Los cambios de jugadores son ilimitados dentro de una misma ventana. Cada
  equipo dispone de tres interrupciones propias; el descanso y aprovechar una
  interrupción rival no consumen ninguna.
- Un jugador sustituido puede volver a entrar posteriormente. Cada entrada y
  salida permanece registrada en el historial del partido.
- Intervenir para consultar o modificar la táctica no consume interrupción. La
  interrupción propia se contabiliza únicamente al confirmar al menos un cambio
  cuando no existe una ventana gratuita.
- El reloj visible conserva su instante oficial en `MatchState`. Pausa,
  velocidad e intervención no participan en la semilla ni adelantan acciones.
- El Panel continúa disponible, pero no es un paso obligatorio entre
  checkpoints. Panel, entrenamiento y escenas temporales reutilizan la misma
  acción contextual `CONTINUAR` para localizar el siguiente punto relevante.

## Decisiones de reproducción y observación rival

- La reproducción completa dura aproximadamente 2:46 en velocidad Normal y
  1:32 en Rápida si no hay cortes. La velocidad solo cambia la cadencia visual,
  se conserva al intervenir y no forma parte de `MatchState` ni de la semilla.
- Durante el partido puede consultarse el once rival actual en formato compacto
  y sobre el campo táctico. Solo se muestran formación, nombres, puestos,
  tarjetas, lesiones observables y sustituciones.
- La vista rival lee sus tácticas y alineación vigentes, por lo que refleja los
  cambios realizados durante el encuentro. Ratings, atributos, condición y
  estados humanos internos permanecen ocultos.

## Indicadores de jugador durante la intervención

- Las tarjetas propias diferencian la media para el puesto de la nota de partido.
  Esta última es una traducción visual a escala aproximada 4–10 del rendimiento
  continuo ya existente; no altera su cálculo.
- Condición y ánimo se representan mediante un corazón cualitativo y un grupo
  reducido de expresiones. El texto exacto sigue disponible en el detalle o la
  ayuda contextual, sin mostrar porcentajes.
- El detalle seleccionado muestra entre tres y cinco métricas según el puesto.
  Ninguno de estos indicadores internos se utiliza en las tarjetas rivales.

## Tutorial contextual de Entrenamiento

- El primer paso de Entrenamiento se centra en el viewport sin desplazar la
  página. Los pasos anclados conservan el scroll al objetivo y usan una tarjeta
  centrada si no cabe a su alrededor. El overlay se monta en `document.body`
  para que los contenedores de las pantallas no alteren su posición fija.
- El tour del Panel y el de Entrenamiento reutilizan un componente contextual
  común para overlay, resaltado, scroll y posicionamiento dentro del viewport.
- Entrenamiento conserva en `OnboardingState` tanto el paso pendiente como la
  finalización. Visitar la pantalla no basta para marcarlo como visto.
- Terminar el tour es independiente de planificar o ejecutar una sesión. Tras
  cerrarlo permanece un objetivo no modal y la explicación general puede volver
  a consultarse desde `AYUDA` sin relanzar el onboarding.
# Mensajes, guardado de sesiones y personalidades por edad

- La guía global termina al cerrar el primer entrenamiento. Su finalización se
  deriva del hito `FIRST_TRAINING` mediante `isGuidedTutorialCompleted`, separada
  de la finalización de la secuencia de pretemporada. Los checkpoints posteriores
  también acreditan ese cierre en estados antiguos y escenarios DEV.
- El informe del primer entrenamiento, la segunda sesión, la convocatoria y el
  chat mantienen sus destinos de `CONTINUAR`, pero no restringen la navegación.
  No se guardan flags duplicados de bloqueo ni se adelanta el calendario al navegar.

- La comunicaciÃ³n visible se organiza en conversaciones persistentes de Mensajes. Los informes informativos solo generan estado sin leer; una respuesta pendiente existe Ãºnicamente cuando un mensaje contiene opciones sin resolver.
- `GameState.conversations` es la fuente activa de verdad. `migrateLegacyInbox` agrupa mensajes de partidas antiguas por participante; `inboxMessages` solo permanece como campo opcional de compatibilidad y no se escribe en partidas nuevas.
- Una planificaciÃ³n de entrenamiento distingue `UNPLANNED`, `DIRTY`, `PLANNED` y `COMPLETED`. Cualquier ediciÃ³n de una sesiÃ³n guardada la marca como `DIRTY` y el avance temporal exige volver a guardarla.
- La personalidad beta se asigna mediante pesos deterministas dependientes de la edad. `Veterano` pesa cero antes de 30 aÃ±os y aumenta progresivamente desde esa edad; `LÃ­der` sigue siendo posible en jÃ³venes.
# Conversaciones persistentes por identidad

- Cada conversación se identifica por un `participantId` estable (`manolo-escudero`, `staff-toni`, `player-N`, `team-group`); el nombre es únicamente presentación.
- `normalizeConversations` migra y fusiona aliases antiguos antes de consultar o añadir mensajes. `getOrCreateConversation` y `appendConversationMessages` son las operaciones generales de alta y anexado.
- La lista de Mensajes representa conversaciones ordenadas por la fecha del último mensaje. El historial conserva mensajes entrantes y del entrenador; no leídos y respuesta pendiente son cálculos independientes.
- Los informes de entrenamiento pertenecen al segundo entrenador presente. Si no está, puede informar otro miembro deportivo presente según sus capacidades; sin personal adecuado no se atribuye el informe a Manolo ni se inventa información técnica equivalente.
- Los temas iniciados por el entrenador son opciones predefinidas derivadas del estado, nunca texto libre. Se guardan como mensajes normales dentro de la conversación para permitir ampliar después escenas de varios pasos.

## Primera pasada visual y retratos de jugadores · 2026-09-11

- Equipo, ficha y Estado del vestuario comparten azul marino, fondos claros,
  bordes suaves y componentes de presentación sin nuevas dependencias. La
  estructura de navegación, CONTINUAR, DEV y onboarding se conserva. El tema de
  la barra y navegación lateral solo se aplica en las pantallas revisadas.
- Equipo contiene las ocho columnas deportivas solicitadas y el recuento de
  jugadores. Felicidad y cuotas pasan a consultarse en el vestuario y la ficha.
- Los retratos se asocian por ID estable mediante `playerPortraits.ts`. Se busca
  `<id>.png` o la excepción del mapping en `public/assets/players/portraits/`.
  El componente común usa el original con `object-fit: contain` en todos los
  tamaños. Si falla su carga muestra una silueta neutra. Nunca se reinterpretan,
  recortan, filtran ni generan los retratos definitivos.
- La ficha sigue siendo el mismo modal compartido con Tácticas. Conserva sus
  datos y contexto, añade barras de atributos y oculta el histórico inexistente.
  Desde el vestuario recibe también estadísticas de temporada y lesiones.
- El vestuario muestra Expectativa (el `squadRole` existente), relación y autoridad
  como conceptos separados. Las etiquetas de autoridad individual reutilizan
  los umbrales actuales. Los cálculos de resumen e influencia se extraen de React
  a `dressingRoomPresentation.ts`, preservando su comportamiento.
- La tabla del vestuario conserva todos los jugadores con scroll interior y
  cabecera fija para limitar la altura total. Los asuntos existentes se priorizan
  por gravedad y se limitan a cuatro; no se inventan problemas. Cuotas, voces y
  cambios se agrupan debajo. Los asuntos y cambios conservan su fuente mock.
- Se retiran del vestuario expectativas del club y confianza presidencial por
  petición de diseño. Sus datos no se eliminan ni se trasladan todavía a una
  pantalla nueva; su futura ubicación será Panel / Objetivos. Esta decisión
  sustituye la ubicación descrita en «Decisiones de Buzón y expectativas».

## Indicadores con barras y problemas del vestuario · 2026-09-11

- Se mantiene la jerarquía: título y resumen, indicadores, situación actual,
  problemas, jugadores, voces, cuotas y cambios recientes. La tabla de jugadores
  conserva las seis columnas y sigue siendo el bloque principal.
- Cohesión, ánimo y autoridad incorporan barras de nivel 0–100 y una descripción
  visible. El relleno marino usa el valor actual; las etiquetas y sus umbrales
  existentes se conservan, sin porcentajes visibles ni nuevas escalas.
- Problemas se deriva exclusivamente de los asuntos y situaciones registrados,
  la relación y autoridad individuales actuales y el resumen económico existente.
  No se crea estado persistido paralelo ni se modifican mecánicas. La severidad
  se presenta como Leve / Moderada / Alta a partir de las categorías existentes.
  Una situación sin aviso asociado se presenta con severidad Moderada.
- El enlace opcional `situationIssueId` permite asociar situaciones individuales
  con el aviso colectivo correspondiente, conservar su severidad y evitar
  duplicados sin comparar nombres o interpretar texto libre.
- La sección conserva todos los problemas en una tabla compacta con scroll,
  ordenada por gravedad. Los nombres abren la ficha existente. Sin casos muestra
  «No hay problemas relevantes ahora mismo.». No hay botones ficticios de resolver.
- Conflictos activos y malestar por una decisión concreta solo podrán mostrarse
  cuando exista un asunto registrado que los acredite; no se infieren del riesgo
  de conflicto, personalidad o histórico de decisiones.

## Vestuario como piloto del lenguaje visual · 2026-09-11

- El usuario confirma una base oscura azulada próxima a la referencia. Sustituye
  la paleta clara únicamente en Estado del vestuario. El resto de las pantallas
  se migrará progresivamente cuando el piloto esté validado.
- `managementTheme.css` define superficies, texto, bordes, azul del club,
  interacción y colores semánticos, junto con escalas de espaciado, densidad y
  tipografía. El tema requiere la clase explícita `management-theme` y no tiene
  reglas globales en `:root` ni excepciones de color por pantalla.
- Se amplían los componentes existentes de `PlayerUi` con cabecera, barra,
  texto semántico y avisos. El nuevo historial y los iconos son reutilizables.
  La presentación anterior de Equipo y ficha se conserva; el modal de jugador
  queda fuera del contenedor del piloto.
- Las barras usan el mismo rango visual 0–100, aproximado a decenas. El tono
  procede de la etiqueta de dominio; no hay porcentajes visibles ni precisión
  interna expuesta en el medidor. Esto sustituye el relleno exacto y siempre
  marino de la pasada anterior, sin alterar ningún valor de partida.
- La referencia orienta la distribución: tabla principal a la izquierda,
  historial más visible a la derecha, voces y cuotas debajo. Las tablas siguen
  conservando todos sus registros con scroll interior y cabeceras fijas.
- El historial agrupa las entradas existentes por signo. No se añaden cambios,
  fechas, filtros temporales, citas ni mensajes para completar la referencia.
  Los resúmenes y las cifras permanecen dinámicos donde ya lo eran.
- La guía de tokens, componentes y futura migración está en `VISUAL_SYSTEM.md`.

## Rediseño global de gestión y ficha permanente · 2026-09-14

- El usuario solicita extender el piloto a toda la interfaz. Esta decisión
  sustituye su alcance anterior limitado al vestuario: tema oscuro por defecto,
  variante clara y tokens compartidos, sin nuevas dependencias.
- Equipo utiliza tabla e inspector permanente; la ficha compartida también se
  integra en Tácticas. Se conservan los accesos modales de otras pantallas y los
  flujos de navegación, onboarding, entrenamiento, mensajes y partido.
- La navegación principal incorpora Vestuario, Mensajes, Próximo partido y
  Clasificación, además de los destinos anteriores; Staff pasa al final. No se
  añaden Club ni Finanzas. Los límites del tutorial siguen en el dominio actual.
- La cabecera conserva CONTINUAR y añade el rival real del calendario. El selector
  claro/oscuro guarda únicamente la preferencia visual local, no la partida.
- La petición posterior del usuario cambia las barras de atributos por estrellas
  0–5 con medios puntos y sube Calidad General, rol descrito y personalidad al
  principio de la ficha. Sustituye también la presentación numérica 1–20 descrita
  en instrucciones y decisiones anteriores; la escala deportiva interna no cambia.
- Los atributos convierten linealmente [1,20] a [0,5] y redondean a media estrella.
  Calidad General conserva sus umbrales previos. Ambas escalas comparten dibujo.
  Ni las estrellas vacías ni el puesto táctico modifican los atributos base.
- Altura y peso se incorporan a la generación con una secuencia sembrada separada.
  Se respetan medidas explícitas y no se consumen tiradas de atributos. No influyen
  todavía en duelos, físico, entrenamiento ni lesiones; tampoco indican sobrepeso.
- El rol usa `squadRole` y el papel social existentes del vestuario; las descripciones
  explican esa expectativa. No se crea un nuevo contrato ni una nueva consecuencia.
- Los minutos proceden del histórico registrado de Liga, excluyendo amistosos.
  Se conserva el histórico mock anterior: las titularidades y minutos ausentes
  se muestran con `—`. No se deducen minutos multiplicando apariciones por 90.
- La ficha refleja condición e incidencias mediante etiquetas actuales y no inventa
  motivos laborales, plazos médicos ni nuevos conflictos. Los originales de retrato
  y el fallback por ID se preservan; dorsales, nacimiento y asistencias quedan
  pendientes de datos. Véase `VISUAL_SYSTEM.md` para componentes y verificación.

## Rediseño específico de Tácticas · 2026-09-14

- La composición final utiliza configuración a la izquierda (21%), campo alto en
  el centro (50%) y alineación a la derecha (29%), sin zona inferior de suplentes.
  Se reutilizan las diez opciones y sus valores, las cinco formaciones, la
  propuesta del segundo y el workspace actual. Las variantes
  visuales nuevas se activan solo en Tácticas; no rediseñan la intervención de partido.
- Esta petición sustituye la ficha lateral en Tácticas aprobada en el rediseño
  global: solo Equipo conserva inspector permanente. Nombre o retrato abren el
  mismo `PlayerDetail` en modal, con estrellas, rol, personalidad, medidas y datos
  vivos. El clic en el resto de la tarjeta mantiene la selección para intercambiar.
- La lista derecha muestra titulares y suplentes con la misma selección y las
  mismas operaciones que el campo. Reutiliza `TacticalPlayerCard` como fila y sus
  estrellas representan Calidad General a partir de los atributos base actuales.
- Formación y Mentalidad se editan directamente. Con balón, En transición y Sin
  balón muestran resúmenes y CAMBIAR / LISTO; solo un bloque se abre a la vez.
  Los cambios actualizan el plan existente, sin nuevo estado táctico persistente.
- Cierre superior, clic exterior y Escape conservan selección, plan y alineación.
  El foco vuelve al botón de origen. No se modifica la navegación ni el onboarding.
- Las tarjetas separan condición general (corazón), stamina (inversa del cansancio,
  aproximada a decenas) e incidencia (esquina). No muestran porcentajes. Molestias
  usan 🩹, lesión 🤕 y expulsión 🟥; una sanción no se convierte en expulsión.
  El estado de expulsión queda admitido por la tarjeta, sin inventarlo en preparación.
- Los suplentes proceden de la convocatoria anunciada y excluyen al XI actual.
  Como antes de anunciarla no hay banquillo registrado, los candidatos quedan en
  un desplegable cerrado. Se conserva así la preparación del primer once sin
  asignar convocados ficticios ni reservar espacio permanente para los omitidos.
  Tras anunciarla, el mismo desplegable permite consultar los no convocados sin
  permitir que entren al once. No se cambia la convocatoria ni su historial.
- Clics y arrastre comparten `moveLineupPlayer`. Los controles y las propuestas
  respetan la elegibilidad existente, incluidas sus diferencias entre amistoso
  y Liga. Los titulares que necesiten sustituirse siguen visibles en su puesto.
- Retratos y dorsales reutilizan los datos disponibles; la ausencia de dorsal se
  indica con «—». No se añade ninguna dependencia ni se cambia el motor deportivo.

## Tácticas: densidad, selección y arrastre · 2026-09-15

- La última petición sustituye la apertura de ficha al pulsar nombre o retrato:
  cualquier clic selecciona mediante `selectedPlayerId`; campo y tabla derivan
  su selección del mismo ID. Clic A + clic B intercambia. La X del resumen y el
  campo vacío deseleccionan. Solo VER FICHA COMPLETA abre el modal común de Equipo.
- La variante `summary` de `PlayerDetail` reúne calidad, identidad, posiciones,
  rol, personalidad, felicidad, condición, stamina e incidencias encima de la
  alineación. No almacena copias de datos ni es una segunda ficha de atributos.
- Composición aproximada 18,5/50/31,5: instrucciones continuas con separadores,
  campo vertical y tabla visual con titulares y suplentes. Se eliminan cajas de
  instrucciones, bordes de filas y leyenda del campo. El nombre corto del campo
  gana legibilidad; nombre completo y posiciones naturales viven en tabla y tooltip.
- La altura responde al viewport, incluida la banda DEV y el objetivo del tutorial.
  Se compactan cabecera a 72–80 px y sidebar a 172–176 px. La lista tiene scroll
  interno; no se utiliza zoom ni transformaciones de escala para encajar la pantalla.
- Pointer Events centraliza ratón y táctil, con umbral de 7 px, preview pequeña,
  feedback por puesto y auto-scroll local. `moveAvailableLineupPlayer` aplica las
  mismas comprobaciones de elegibilidad a preview y commit y llama al intercambio
  existente. Se conserva la regla de portero y se permiten puestos improvisados.
  No se implementa reordenación de suplentes, que era opcional.
- El feedback posicional usa la clasificación ejecutable preferida/compatible/
  improvisada, consistente con las decisiones previas del sistema. Distinguir
  posición principal y secundaria solo afecta al color del destino, no al rating.
- Sin nuevas dependencias, nuevas instrucciones, efectos deportivos ni cambios
  en la presentación de intervención de partido. Las expulsiones quedan admitidas
  por los indicadores; no se crean expulsiones ficticias antes de disputar el partido.

## Perfil dedicado y propuesta lateral de Tácticas · 2026-09-15

- La nueva petición sustituye el clic sobre nombre de la iteración anterior:
  nombres en campo, tabla de Tácticas, resumen seleccionado, Equipo e inspector
  abren una página completa. Retrato, posiciones y resto de fila o tarjeta
  seleccionan; dos selecciones intercambian. El arrastre desde el nombre conserva
  el umbral y no dispara la navegación.
- `PlayerProfileScreen` compone navegación de retorno y `PlayerDetail` en variante
  `page`, sin otra implementación de atributos, ratings, estados o estadísticas.
  Mantiene club, identidad y medidas arriba, y posiciones, atributos, estado y
  estadísticas en áreas amplias. No añade métricas ni histórico ficticio.
- App conserva el origen y el ID del perfil; `Activity` de React mantiene oculta
  la pantalla anterior sin desmontar su estado. El retorno restaura foco y scroll,
  incluidos lista táctica, instrucciones y tabla de Equipo. DEV limpia el perfil
  al cargar otro escenario; el acceso no completa hitos del onboarding.
- Tácticas pasa a proporciones aproximadas 21/48/31. Familiaridad bajo Formación
  y Mentalidad, con barra, color y niveles existentes, incluida Media. La propuesta
  del segundo se integra al final de la columna izquierda y queda accesible en
  pantallas bajas; las instrucciones admiten scroll local cuando es necesario.
- La familiaridad, propuestas, formación e intercambios conservan el dominio
  existente. No se añade ninguna dependencia. Otros accesos a ficha mantienen
  sus modales; esta iteración cubre los nombres de Equipo y Tácticas.
- Se verifican navegación y retorno, selección, drag desde nombres, filtros,
  desplazamiento, cinco resoluciones a zoom 100%, las cinco formaciones, ambos
  temas y el objetivo de Tácticas del tutorial. Build, lint y 113 tests pasan.
- Tras un arrastre táctil sin clic residual, la apertura con teclado sigue
  disponible. El retorno devuelve el foco al nombre desde el que se abrió.

## Materiales de club municipal: piloto en Tácticas · 2026-09-15

- La nueva petición cambia la dirección artística hacia vestuario, oficina y
  campo municipal de 4a Catalana. En esta fase se aplica únicamente a Tácticas,
  incluido el shell visible en ella; el resto del juego espera su validación.
  Sustituye el acabado azul digital de esta pantalla, no su UX ni composición.
- Se conservan las tres columnas, jerarquía, tablas, controles, nombres enlazados,
  selección, resumen del jugador, arrastre, propuesta del segundo, tooltips,
  navegación y CONTINUAR. No se toca ningún estado ni cálculo deportivo.
- `clubMaterialTokens.css` define materiales y adapta los tokens de UI bajo una
  clase optativa. `clubMaterials.css` reutiliza papel, cinta y pizarra mediante
  clases de superficie y acota todos los acabados al piloto. Se mantienen los
  componentes compartidos con Equipo e intervención de partido.
- Se eligen pared beige, zócalo de azulejos azules, documentos crema, pintura
  marina y pizarra verde enmarcada en madera. Cinco texturas SVG con semillas
  fijas suman menos de 3 KB; no hay fotografías, fuentes externas ni dependencias.
  No se añaden patrocinadores, precios del bar ni mensajes ambientales ficticios.
- Como decisión de presentación, los dos modos conservan papel claro para
  lectura; el modo claro ilumina los mismos materiales. El perfil dedicado
  recupera su tema anterior porque queda fuera del alcance de Tácticas.
- La implementación solo añade clases e importaciones a `AppShell`,
  `TacticalWorkspace`, `TacticsScreen` y `main`, más estilos, texturas y guía.
  No migra otras pantallas ni modifica sus estilos existentes.

## Tácticas: objetos físicos e identidad única · 2026-09-16

- Segunda iteración solicitada sobre el mismo layout: más contexto de vestuario
  municipal y objetos físicos. Se conservan columnas, jerarquía, campos,
  selecciones, arrastre, fichas, propuestas, navegación y avance temporal.
- Se retira el modo claro/oscuro del shell compartido: botón, estado, acceso a
  localStorage y paletas alternativas. Sustituye las decisiones anteriores de
  mantener ambos modos. El piloto usa una identidad fija; las demás pantallas
  conservan la paleta base previa hasta su futura migración.
- Se eligen una cabecera crema pintada, navegación marina, configuración sobre
  corcho con cinta y alineación en portapapeles con pinza metálica. Se mantienen
  los tokens y componentes existentes, con nuevas variantes de superficie.
- La pizarra incorpora madera con veta, tornillos, ganchos de pared, dibujo de
  tiza irregular, bandeja, borrador y tiza. Las placas de jugadores tienen borde
  de papel e imán; las áreas interactivas y coordenadas siguen siendo las mismas.
- Un pequeño rincón de equipación ocupa el espacio libre del lateral en escritorio.
  No hay texto ambiental, eslóganes, precios ni patrocinadores ficticios. El
  próximo partido conserva su información real con aspecto de impreso grapado.
- Doce SVG locales suman menos de 10 KB y reutilizan semillas fijas. Decoración
  sin eventos de puntero ni contenido accesible redundante. Sin dependencias
  nuevas, aleatoriedad de juego, cambios deportivos ni migración visual adicional.
- El test existente del shell se adapta a la retirada explícita del selector;
  sigue comprobando CONTINUAR, destino activo y navegación del vestuario.

## Equipo: hoja de plantilla y ficha física · 2026-09-16

- Se amplía la identidad aprobada de Tácticas únicamente a Equipo / Plantilla,
  incluida su cabecera y navegación. Se reutilizan los mismos tokens, superficies,
  tipografías, estados y componentes. No se modifica ningún cálculo ni estado de juego.
- Se eligen listado como documentación administrativa con papel apilado y cinta,
  y ficha individual en el portapapeles marino con pinza ya existente. Un marco de
  papel presenta el retrato original sin recortarlo ni alterarlo. Las caricaturas
  pendientes siguen entrando por el mapping de retratos por ID.
- `PlayerDetail` acepta una clase opcional de superficie; se conserva toda su
  información y su lógica compartida. Equipo mantiene columnas, altura de filas,
  filtros, ordenaciones, selección, enlaces, scroll y apilado responsive.
- La selección usa papel azul apagado y borde marino, conservando los colores
  semánticos de estado. Se elimina el gradiente digital solo en este listado.
- Una pequeña ventana alta insinúa césped, valla y portería desde la pared libre
  entre título y filtros. Desaparece cuando no hay espacio (1200 px o menos).
  Se añade un único SVG local de unos 2,4 KB; no hay dependencias ni textos nuevos.
- `clubSquad.css` solo integra las superficies comunes en esta pantalla. La nueva
  variante `club-sheet--stacked` queda reutilizable. La pinza usa un contenedor
  relativo sin desplazamiento en móvil y mantiene el comportamiento sticky en escritorio.
- La identidad sigue siendo única, sin selector ni preferencias de tema. La
  pantalla dedicada de perfil y las demás áreas conservan su acabado previo hasta
  encargos posteriores. La navegación mantiene sus comportamientos de montaje;
  abrir y cerrar un perfil conserva selección, filtros, foco y desplazamiento.

## Equipo y perfil: composición compartida y entorno vivido · 2026-09-16

- La nueva iteración incluye Equipo, su inspector y el perfil completo abierto
  desde los nombres, también desde Tácticas. El perfil adopta la identidad fija
  del club y conserva su información, navegación y comportamiento existentes.
- `ClubPlayerFile` envuelve el mismo `PlayerDetail`: separa el soporte físico del
  documento con scroll. El marco y la pinza permanecen fuera del desplazamiento,
  con margen real alrededor de la hoja. No se escala la UI mediante transformaciones.
- El retrato lateral pasa a 70×82 px, o 54×65 px en el inspector estrecho. El perfil
  ampliado utiliza 90×106 px, o 76×90 px en móvil. Calidad, rol y personalidad usan
  una fila compacta cuando caben; conservan su apilado en espacios pequeños.
- El perfil mantiene su cuadrícula de información sobre un documento de ancho
  máximo 1360 px, con divisiones impresas y mayor margen. No se cambia el dominio,
  la navegación, la fuente de estadísticas ni la asociación de retratos por ID.
- Se elige un único ambiente fotográfico generado: ventana hacia el campo,
  fotografía antigua ficticia y trofeo sencillo sobre una repisa. Sustituye la
  ventana ilustrada y se integra en la pared libre de ambas pantallas mediante
  `ClubRoomContext`. No tiene textos, interacción ni significado de partida.
- Se elimina el adorno del sidebar, su CSS, token y SVG, tanto en Equipo como
  Tácticas y cualquier perfil. La navegación queda reservada a controles.
- Se conservan las demás pantallas. La procedencia del PNG y el prompt final
  de imagegen quedan registrados en `docs/VISUAL_ASSETS.md`.

## Equipo y perfil: resumen y aprovechamiento del espacio · 2026-09-17

- Por petición expresa se compactan y reorganizan ambas vistas. Equipo conserva
  listado a la izquierda, inspector a la derecha y filtros arriba. La altura de
  filas se adapta entre 26 y 32 px para mostrar la plantilla inicial de veinte
  jugadores en escritorio; ventanas menores o listas mayores conservan scroll.
- El inspector pasa a resumen: identidad, calidad, rol, personalidad, medidas,
  posiciones, estadísticas y estado. Se reservan atributos y perfil ampliable
  para la pantalla completa, accesible también mediante un botón explícito.
  No se muestran observaciones vacías en el resumen ni el gráfico del mini campo.
- El perfil aprovecha dos columnas: retrato grande, identidad y posiciones a la
  izquierda; calidad, medidas, atributos, estadísticas y estado a la derecha.
  Mantiene los datos deportivos y el desplegable secundario de vestuario.
  El retrato crece hasta 165–255 px de altura según la ventana, sin recortar el
  original. En móvil se apilan las secciones y se conserva scroll natural.
- Se retiran el escudo repetido, la felicidad duplicada y las posiciones
  repetidas bajo el nombre. Un dorsal sin asignar no ocupa una línea en el perfil;
  los dorsales asignados se conservan. La descripción del rol queda en el tooltip
  de su etiqueta; el modal anterior mantiene su descripción visible.
- El mismo PNG ambiental ocupa ahora la pared del contenido completa, unido
  al yeso mediante una transición superior y anclado abajo. Ventana, repisa,
  foto y trofeo forman un único fondo detrás de los documentos; su visibilidad
  depende del espacio libre. Se elimina `ClubRoomContext`, sin generar otra imagen.
- No hay nuevos cálculos, constantes de dominio, aleatoriedad ni dependencias.
  Se reutilizan `PlayerDetail`, los datos existentes y los callbacks de navegación.
  No se activan otras pantallas ni sistemas pendientes; continúan los retratos
  provisionales hasta incorporar los originales mediante el mapping por ID.

## Mensajes: móvil y oficina del club · 2026-09-17

- Por petición expresa, Mensajes adopta los materiales de Equipo y Tácticas,
  incluida la cabecera, navegación, próximo partido y CONTINUAR. Se mantienen
  el listado de conversaciones y la conversación abierta, sin cambiar el dominio.
- El chat vive en un móvil construido con HTML/CSS: carcasa mate, auricular,
  mensajes claros, enviados en verde grisáceo, separadores de día y pie de respuesta.
  El historial conserva su scroll; participantes y composer permanecen dentro
  de la pantalla del teléfono. Los participantes tienen scroll acotado.
- La lista usa el papel apilado y cinta compartidos. Presenta iniciales o icono
  de grupo, nombre, rol existente, último mensaje, fecha, no leídos y respuesta
  pendiente. No se inventan contactos, mensajes, cargos ni departamentos.
- El pie tiene un campo de solo lectura y acceso a la primera respuesta pendiente.
  La respuesta se sigue enviando mediante las opciones existentes, con los mismos
  callbacks y efectos. No se activa escritura libre, envío de adjuntos ni respuestas
  automáticas nuevas. Esta decisión conserva el sistema de conversaciones actual.
- En escritorio el móvil deja espacio lateral al portátil. En pantallas pequeñas
  se apilan lista y móvil; al seleccionar un contacto se lleva el chat a la vista.
  No hay rotaciones ni escalado de las áreas de lectura. Se conservan los estados
  vacíos, convocatorias estructuradas, reacciones y destinos a mensajes concretos.
- Se genera un único PNG local de oficina: mesa gastada, azulejo azul, ventana,
  portátil viejo, taza, llaves, equipación y pequeña repisa. Solo es ambientación;
  no aporta datos a la partida ni contiene lemas. Prompt en VISUAL_ASSETS.md.
- Los dos adjuntos de texto eran iguales y no incluían el archivo de imagen
  mencionado. Se usa la descripción y el sistema visual local como referencia.
- InboxScreen.css se carga después de los estilos compartidos en main.tsx para
  mantener la cascada de materiales. Sin nuevas dependencias, aleatoriedad ni
  cambios en los sistemas deportivos o humanos.

## Mensajes: smartphone en la mano según referencia · 2026-09-22

- Se aplica la nueva imagen de referencia aportada por el usuario. El teléfono
  mantiene una proporción vertical fija (494:1024) al cambiar de resolución;
  su anchura ya no puede crecer independientemente de la altura.
- Un PNG local transparente aporta la mano con guante oscuro, manga y marco
  del teléfono. No hay piel visible ni textos en el recurso. El fondo de oficina,
  listado de conversaciones y shell de materiales se conservan.
- El chat sigue siendo HTML interactivo, alineado con la pantalla fotografiada.
  La mano no recibe eventos ni forma parte del árbol accesible. Las dimensiones
  y coordenadas de montaje quedan en InboxScreen.css.
- Se elige una inclinación conjunta de 3 grados en escritorio para aproximar la
  referencia; en móvil se elimina la inclinación. Esto sustituye la decisión
  anterior de mantener recto el teléfono. El texto no se escala con transform.
- La franja superior muestra la hora real de la partida. Los indicadores de
  dispositivo son decorativos y no añaden estado ni datos de batería o conexión.
- Se conservan historial, selección, convocatorias, respuestas y participantes.
  Texto libre y adjuntos siguen sin activarse. Sin cambios de dominio,
  dependencias nuevas ni aleatoriedad.
- Verificación: build, lint, diff y 113 tests correctos; renderizado de 33
  conversaciones en 16 escenarios existentes, sin mutar el estado de partida.
  La comprobación visual en navegador queda pendiente: no había ningún
  navegador conectado.

## Estado del vestuario: materiales del club y lectura al 100% · 2026-09-22

- Por petición expresa, Estado del vestuario adopta el papel crema, pintura
  marina, cabecera y navegación de Equipo y Tácticas. Su fondo es una fotografía
  local generada de vestuario municipal, inspirada en la referencia: azulejos,
  bancos, ventanas altas, pizarra, una bota, cantimploras y cinta. Es decorativa.
- La distribución cambia de bloques apilados a resumen superior y documentos
  contiguos: plantilla a la izquierda; problemas, voces, cuotas y cambios a la
  derecha. El orden semántico conserva Problemas antes de Jugadores. Las seis
  columnas siguen separando expectativa, felicidad, relación, autoridad y situación.
- En escritorio de más de 1200 px y al menos 680 px de alto, la composición usa
  la altura real disponible, descontando cabecera y barra DEV. Las listas largas
  se desplazan dentro de su documento, con títulos visibles y regiones accesibles
  por teclado. La tabla adapta sus filas a su propio contenedor; no se aplica
  zoom, transform de escala ni reducción global del tamaño de letra.
- En ventanas menores, móvil o zoom aumentado se permite el desplazamiento
  natural y la tabla tiene scroll horizontal local, sin eliminar columnas.
  No se promete mostrar simultáneamente cada fila de cualquier lista: se prioriza
  mantener todos los bloques de gestión visibles en el escritorio y su lectura.
- Problemas tiene una presentación compacta opcional con los mismos nombres,
  severidad, asunto, estado y acceso a PlayerDetail. Se conserva la variante de
  tabla existente, así como el estado vacío y el orden de gravedad del dominio.
- PlayerSection y ChangeHistory admiten regiones desplazables enfocables de forma
  opcional; solo Vestuario las activa. No se alteran otras composiciones.
- No se modifican modelos, umbrales, efectos humanos, entrenamiento, finanzas,
  navegación ni datos existentes. Situación e historial siguen teniendo las fuentes
  mock anteriores; no se activa un nuevo sistema de conflictos ni de resolución.
- Sin dependencias nuevas ni aleatoriedad. Recurso y prompt en VISUAL_ASSETS.md.
- Verificación final: `npm run build`, `npm run lint`, `git diff --check` y los
  113 tests existentes correctos. Comprobación adicional de renderizado con tres
  semillas, 20 jugadores y 46 problemas por estado: contenido completo, regiones
  enfocables y sin mutaciones. No se ha añadido aleatoriedad ni cálculo de dominio.
  La comprobación visual e interactiva queda pendiente: no había navegador conectado.

## Mensajes: mano en sombra y teléfono vertical · 2026-09-22

- Por petición expresa, se sustituye el guante por una mano humana desnuda en
  contraluz: pulgar, palma y dedos con anatomía natural, sin tonos de piel ni
  tejido sobre la mano. La manga oscura se conserva en la muñeca.
- Se edita únicamente el PNG de primer plano mediante imagegen y se guarda
  como `club-phone-hand-shadow.png`; el recurso anterior queda conservado.
  El despacho, portátil, taza, llaves, cabecera y listado no se modifican.
- Se elimina la inclinación de 3 grados en todos los tamaños. Esta decisión
  sustituye la inclinación indicada en «smartphone en la mano según referencia».
  El tamaño exterior y las reglas responsive existentes se mantienen; se ajustan
  las coordenadas de montaje a la nueva fotografía, incluido su alto, para que
  el chat siga encajado en el marco sin ampliar la composición.
- El filtro de gris y brillo se limita a la fotografía para atenuar la mano
  y el marco, manteniendo la luminosidad del chat. El alfa original integra
  los contornos; la imagen sigue siendo decorativa y no intercepta eventos.
- No se alteran textos, horas, respuestas, lógica de mensajes ni otras pantallas.
  No se añaden dependencias, cálculos de dominio o aleatoriedad. No se activan
  funciones adicionales. Recurso y prompt en `VISUAL_ASSETS.md`.
- Verificación: build, lint y diff correctos; 110 de 113 tests pasan, incluidos
  todos los de Mensajes. Los tres fallos de `playerScreens.test.mjs` corresponden
  a retratos y estructura de Vestuario, fuera de este cambio, y se reproducen
  ejecutando la suite en serie. Durante la tarea se observaron ediciones ajenas
  en `App.tsx` y `DressingRoomScreen.tsx`, que se conservan sin intervenir.
- Se comprueban dimensiones, alfa y registro de la fotografía, y que el único
  cambio del componente es el recurso decorativo. La comprobación visual a
  zoom 100% queda pendiente porque no hay ningún navegador conectado.

## Vestuario: seguimiento humano y encabezados integrados · 2026-09-22

- Se sustituye la tabla completa de veinte jugadores por un seguimiento de hasta
  seis, con situación, influencia y prioridad; el acceso a la plantilla conserva
  la navegación y las restricciones del onboarding. Equipo mantiene sus datos.
- Se reutilizan indicadores, alertas, identidades, tabla, paneles, problemas,
  historial y PlayerDetail. No hay nuevos componentes React ni dependencias.
  `screenHeaders.css` comparte solo el acabado del título; Tácticas queda excluida.
- `getDressingRoomOverview` deriva el seguimiento y la jerarquía desde el estado
  actual. Prioriza la incidencia más grave por jugador y reserva un lugar para
  un apoyo influyente cuando existe. No asigna nuevas influencias ni efectos.
  LEADER/HIGH/MEDIUM/LOW se presentan como líderes, influyentes, núcleo y periféricos.
- Las tres voces son frases de presentación según situaciones y estados humanos,
  sin crear conversaciones o hechos persistentes. Mantienen roles e identidades
  existentes; los avisos e historial conservan su fuente parcialmente mock.
- Compromisos reutiliza `GameState.promises`: solo promesas activas con jugadores
  presentes o con el grupo. Las cumplidas e incumplidas no aparecen como pendientes.
  Se muestra el plazo conocido del próximo entrenamiento; no se inventan fechas
  ni promesas de minutos para rellenar el panel. Las finanzas siguen intactas y
  sus incidencias pendientes continúan en Problemas y en la ficha del jugador.
- El layout usa alturas naturales, grid flexible y espaciados compactos. Máximos
  visibles: seis jugadores, tres avisos, tres problemas, tres voces, tres
  compromisos y cuatro cambios. Problemas y compromisos adicionales son ampliables.
  No se escala ni se recorta el contenido principal; el fondo existente se conserva
  sin texto decorativo. En tamaños inferiores se permite desplazamiento natural.
- Comprobación visual en Chrome aislado a zoom 100 %: todos los paneles caben en
  1920×920 de área útil, incluyendo cabecera y DEV. Verificados ficha, acceso a
  Equipo, navegación entre pantallas, incidencias ampliables y promesa real.
  Comprobado responsive en 1366×768 y 390×844. El estilo común no cambia ningún
  estilo calculado ni dimensión de Tácticas al activarlo/desactivarlo.
- No se amplía el sistema de conflictos ni la creación/resolución de promesas.
  Las promesas de entrenamiento siguen resolviéndose en su lógica anterior;
  otros tipos de compromisos permanecen pendientes de futuras tareas.
- Verificación final: `npm run build`, `npm run lint`, `git diff --check` y los
  116 tests correctos. Se comprueban selección por gravedad, ausencia de duplicados,
  jerarquía derivada, estado vacío, promesas reales y ausencia de mutaciones.
  No se añade aleatoriedad ni cálculo deportivo/humano a los componentes React.

## Encabezados: contraste estable sobre fondos · 2026-09-23

- El ajuste se limita a `screenHeaders.css`: franja crema semitransparente
  `rgba(246,243,234,.92)`, desenfoque de 2 px y filete inferior azul grisáceo.
  Títulos en `#173f5b` y subtítulos en `#536b7a`, con opacidad 1 y sin sombra.
- Tácticas comparte esta base visual, conservando su composición, tipografía y
  alturas propias. Los paneles y controles de cada pantalla no cambian.
- Se conservan los 5 px verticales existentes para no aumentar el encabezado;
  se utilizan 14 px horizontales en escritorio y el margen anterior en ventanas
  de hasta 800 px para mantener los saltos de línea y las alturas móviles.
- Revisión visual en Vestuario, Mensajes y Tácticas sobre sus fondos reales.
  Comparación de estilos y dimensiones fuera de las cabeceras en ocho pantallas
  a 1920×980: sin cambios. Alturas comprobadas también en 1366×768 y 390×844.
  No se modifican componentes React, datos, dominio, dependencias ni aleatoriedad.

## Encabezados: superficie ajustada al contenido · 2026-09-23

- La superficie legible se traslada de la fila completa al grupo existente de
  título/subtítulo, con `width: fit-content` y un máximo de 680 px. Los botones,
  filtros y demás elementos de la fila mantienen su posición y presentación.
- Se conservan crema al 92 %, blur de 2 px, tinta navy y gris azulado opacos,
  padding compacto y filete inferior. El resto de la fila vuelve a ser transparente.
- Se reutilizan los wrappers existentes, o el propio h2 cuando no hay subtítulo;
  no se crea un componente React ni se cambia la estructura de las pantallas.
  Los márgenes compensan el padding para conservar el espacio de la cabecera,
  alineando el soporte con su borde superior izquierdo.
- Los subtítulos admiten como máximo dos líneas. Verificado con un texto largo:
  el bloque se limita a 680 px y el subtítulo a dos líneas de 15,4 px.
- Comparación en ocho pantallas a 1920×980: misma altura de cabecera, mismos
  controles y mismo contenido fuera del título. Revisados Vestuario, Mensajes
  y Tácticas también a 390×844, sin desbordamiento horizontal de página.

## Escenarios visibles y paneles compactos al 100 % · 2026-09-23

- Se reserva escenario sobre el contenido de Plantilla y sobre el perfil completo;
  la ventana pasa del pie al borde superior (`38% 0%`). El panorama conserva su
  proporción y se funde por abajo con el yeso, sin recortar el exterior con `cover`.
- Vestuario conserva el fondo existente, con foco `58% 42%`, velo claro mínimo,
  documentos separados por 12–22 px y un máximo de 1480 px de ancho. En escritorio
  ancho, los indicadores quedan a la izquierda de la pizarra, que permanece visible.
  Primera fila: seguimiento, problemas y jerarquía; segunda: historial, voces y
  compromisos. No se alteran las fuentes de datos ni la prioridad del seguimiento.
- Decisión de composición: conservar las seis entradas derivadas del seguimiento
  mediante scroll interno (aproximadamente cuatro/cinco visibles en 1080p), en vez
  de eliminar al apoyo influyente o cambiar el dominio. Problemas mantiene tres
  iniciales y ampliación; voces conserva sus tres entradas; el historial muestra
  tres cambios y compromisos sus tres primeros, con ampliación de los restantes.
- Papel crema al 88 %, desenfoque de 2 px y sombras mínimas en tabla, ficha lateral,
  bloques del vestuario y lista de Mensajes. El marco de la ficha también deja pasar
  el fondo para evitar una segunda superficie opaca. Se conserva el móvil legible.
- El shell acota la altura de las dos pantallas prioritarias a `100dvh`; sus filas
  descontarán cabecera, padding DEV y cualquier banner existente. Los bloques usan
  flex/grid y desplazamiento propio, sin escala, zoom CSS ni recorte del contenido.
  En ventanas estrechas/bajas vuelve el flujo natural. Header y sidebar no cambian.
- Mensajes conserva foco `100% 100%` y disposición; se corrige el doble descuento
  de la barra DEV. Tácticas no requiere ajustes: su pizarra ya aporta el escenario.
- Se registra en AGENTS.md la prohibición permanente de texto inventado dentro de
  escenarios. La edición del fondo para añadir camisetas, bolsa y taquillas quedó
  pendiente por límite de uso de imagegen: no se generó ni sustituyó ningún asset.
- Verificación: build, lint y 116 tests correctos; revisión visual en 1920×1080,
  1920×920, 1366×768, 1101×700, 1024×768 y 390×844. Se prueban búsqueda, filtros,
  ordenación, selección, ficha completa y vuelta, último jugador, problemas y una
  promesa real. Comparación de estilos calculados y geometría de todos los elementos
  de header/sidebar en las cuatro pantallas confirma que permanecen iguales.
- No hay dependencias, modelos, estadísticas, efectos humanos, aleatoriedad ni
  cálculos de dominio nuevos. No se preparan funciones de juego inactivas.

## Mensajes: tratamiento ilustrado del escenario · 2026-09-23

- Por petición expresa, se editan las imágenes originales para adoptar una
  ilustración digital semirrealista de videojuego, con materiales simplificados,
  texturas pintadas y sombras controladas. La imagen aportada se utiliza solo
  como referencia artística; se conserva la composición del despacho existente.
- El escenario ya estaba separado en dos capas. Se mantienen el fondo horizontal
  de 1536×1024 y el primer plano transparente de 1024×1536 con móvil y mano.
  Ambos reciben el mismo tratamiento; el teléfono no se duplica dentro del fondo.
- Se conservan mesa, silla, portátil, taza, llaves, ventana, repisa y equipación
  en sus posiciones, la perspectiva y los espacios libres para la UI. La pantalla
  ilustrada del móvil queda vacía; no se generan textos, logos ni interfaz.
- Los recursos nuevos son `club-messages-office-illustrated.png` y
  `club-phone-hand-illustrated.png`. Se conservan los originales. Las únicas
  modificaciones funcionales de código son sus referencias en InboxScreen:
  se mantienen geometría, responsive, filtros, controles, chat y lógica existentes.
- Edición mediante imagegen integrado, sin CLI, dependencias ni cambios de
  dominio. No se modifican otras pantallas ni estilos compartidos. No se preparan
  nuevas funciones inactivas. Prompts y recursos en `VISUAL_ASSETS.md`.
- Verificación: build, lint, diff y los 116 tests correctos. Se comprueban las
  dimensiones y transparencia de los PNG, su inclusión íntegra en producción
  y que todo el código y CSS, salvo rutas y comentarios, permanece idéntico.
  Revisados visualmente ambos recursos; no se pudo revisar la composición en
  navegador en esta sesión porque no había ninguno conectado.

## Entrenamientos: campo ilustrado y planificación compacta · 2026-09-24

- Rediseño solicitado de Entrenamientos, limitado a su contenido. Header, sidebar,
  navegación global y motor permanecen iguales. App aporta el próximo partido
  que ya deriva del calendario.
- Fondo aportado transformado con imagegen integrado en ilustración 2D:
  `club-training-night-illustrated.png`. Conserva el escenario nocturno, su
  composición y material, sin texto, carteles, logos ni personajes añadidos.
- Seis indicadores, táctica con mini campo derivado de la formación y microciclo
  de tres bloques. Se reutilizan cálculos y etiquetas de dominio, barras
  aproximadas compartidas y controles y handlers existentes.
- El tercer bloque muestra el partido real (día, rival, fecha, hora y competición).
  No se inventa una sesión de sábado ni una intensidad de partido: el modelo
  conserva dos entrenamientos semanales. Los ejemplos del brief son visuales,
  nunca resultados, jugadores o hechos nuevos guardados en la partida.
- Pulsar una sesión abre su planificación. Se conservan bloques completos,
  intensidad, staff, ausencias, previsión, guardado, DIRTY y revisión prometida.
  El tutorial abre el editor en sus pasos de bloques y efectos; CONTINUAR abre
  la sesión pendiente de guardar y mantiene la validación real.
- Solo las sesiones completadas tienen tarjetas de resultados. Estado físico,
  carga, calidad, riesgo y asistencia proceden del resultado original; el informe
  desplegable conserva todos los efectos, destacados e instantánea táctica.
  Destacados resume la última sesión completada, con estado vacío antes de ella.
- Paneles navy al 66–72 %, blur de 1–1.5 px y borde azul fino. Ancho superior máximo
  de 1160 px, zona inferior de 930 px; reserva lateral y césped inferior visibles.
  Jugadores a vigilar conserva la lista completa con desplazamiento y ficha.
- Verificado en Chrome aislado a 1920×1080, 1366×768, 1024×768 y 390×844: sin
  desbordamiento horizontal; planificación, dos informes reales, fichas, ayuda,
  validación y cinco pasos del tutorial comprobados. Sin dependencias, cambios de
  dominio, aleatoriedad nueva ni funcionalidades preparadas pero inactivas.
- Comprobación final: `npm run build`, `npm run lint`, `git diff --check` y los
  116 tests correctos. Con las dos sesiones completadas, todo el contenido cabe
  a 1920×1080 sin desplazamiento de página. La copia del fondo está incluida en
  producción; se conservan los cambios previos del usuario en otras pantallas.

## Mensajes: mano apenas sugerida detrás del móvil · 2026-09-24

- A petición del usuario, se reduce la superficie visible de la mano: la palma
  queda oculta detrás del teléfono, con un contorno de pulgar y dos pequeñas
  puntas de dedos. Se atenúan los detalles y el borde iluminado; la muñeca se
  pierde en sombra, sin presentar una mano negra completa ni un guante.
- Se edita solo el primer plano mediante imagegen integrado y se guarda como
  `club-phone-hand-subtle.png`, conservando la versión ilustrada anterior.
  Permanecen la manga oscura, estilo pintado, alfa y teléfono vertical vacío.
- El recurso generado acorta ligeramente el dispositivo. Se registra su pantalla
  contra el rectángulo HTML existente mediante el alto y desplazamiento de la
  imagen, conservando intactos tamaño, posición y estilos internos del chat.
- Solo cambian la referencia decorativa y su registro en InboxScreen. El despacho,
  otras vistas, estados y lógica de mensajes no cambian. No se añaden dependencias,
  aleatoriedad, cálculos de dominio ni funciones preparadas pero inactivas.
- Verificación: build, lint, diff y 116 tests correctos. Recurso revisado
  visualmente, con dimensiones y alfa comprobados e incluido íntegro en producción.
  Se confirma por comparación que el HTML y los estilos del chat no cambian.
  La revisión del montaje en navegador queda pendiente: no había ninguno conectado.

## Competición: estilo federativo y archivo de actas · 2026-09-24

- Rediseño solicitado de Clasificación, Resultados, Goleadores y Próximo partido,
  inspirado en las capturas: cabeceras rojas, tablas blancas, navegación redondeada,
  emblemas SVG del juego y enfrentamientos sobre el campo ilustrado existente.
  El shell y las demás pantallas se conservan. No se añaden dependencias ni assets.
- Se reutilizan los cálculos vivos de clasificación y goles. Resultados permite
  consultar jornadas futuras y amistosos, con ficha pendiente o acta terminada;
  los filtros permanecen al navegar. No se simula un resultado antes de jugar.
- MatchTeamState conserva el once de salida y los dorsales existentes; el acta
  guarda participantes, incidencias, marcador progresivo, cambios y estadísticas.
  Usa los autores reales del motor, sin confundirlos con identificadores agregados
  de goleadores. Las reentradas no convierten un titular en suplente inicial.
- applyPostMatch archiva una sola vez en GameState.matchReports. VER ACTA confirma
  el final y abre el documento; CONTINUAR desde él usa el checkpoint común.
  El archivo sigue accesible desde Resultados y desde el último partido, después
  de avanzar. El campo nuevo admite estados anteriores mediante hidratación.
- Decisiones de alcance: emblemas estilizados, sin copiar logotipos oficiales;
  la temporada se deriva del calendario; árbitros, dorsales y staff desconocidos
  figuran sin datos. Los resultados antiguos y rivales resueltos en segundo plano
  muestran marcador y goles, sin inventar alineaciones ni estadísticas.
- En la convocatoria se corrige la presentación existente de Calidad y Forma a
  estrellas y etiquetas compartidas. No cambian selección, ratings ni consecuencias.
- Revisado en Chrome aislado a 1920×1080, 1366×768, 1024×768 y 390×844: sin
  desbordamiento de página. Probados final, apertura desde arriba, continuar,
  reapertura del acta, filtro persistente de amistosos y jornadas futuras.
- Cobertura de dominio añadida en matchReports.test.mjs para titulares, reentradas,
  local/visitante, serialización, identidad de goles y procesamiento único.
  No hay nueva aleatoriedad ni efectos deportivos/humanos en React.
- El guardado a disco sigue pendiente en el proyecto; las actas duran durante la
  partida actual. No se dejan nuevas funciones preparadas pero inactivas.
  Especificación en docs/COMPETITION_SYSTEM.md y docs/MATCH_ENGINE.md.
- Verificación final: npm run build, npm run lint, git diff --check y los 121 tests correctos.

## Mensajes: teléfono global desplegable · 2026-09-25

- Por petición expresa se retira la pantalla independiente y la entrada del
  sidebar. `ClubPhone` se monta una vez en `AppShell`: barra navy inferior derecha,
  badge rojo, teléfono 2D oscuro con chats, búsqueda, No leídos y Llamadas.
- Se reutilizan conversaciones, convocatorias, reacciones, respuestas e identidades.
  `useClubPhone` centraliza apertura y sección en App; selección e historial siguen
  en GameState. El contador deriva de los mensajes. Llegar minimizado no abre el
  teléfono ni marca lectura. Navegar o minimizar conserva el fondo y su estado.
- Los destinos antiguos `inbox` se interceptan como comandos de apertura. El
  estado de pantalla los excluye. Panel, tutorial, CONTINUAR y convocatorias usan
  el mismo teléfono. Las escenas narrativas presenciales no cambian.
- `addMessage` entrega mensajes con ID estable sin duplicarlos; los generadores
  existentes siguen usando el mismo historial. `respondFromPhone` preserva las
  decisiones de entrenamiento y evita repetir respuestas o consecuencias.
- Llamadas usa un modelo serializable y un historial inicial de ejemplo separado,
  identificado en la interfaz. No se inventan mensajes reales ni consecuencias.
  Permanecen preparados los registros futuros de llamadas y tutoriales; no se
  activa telefonía, escritura libre ni persistencia a disco.
- Eliminados InboxScreen y su CSS, import y selectores muertos. Los fondos y manos
  anteriores se conservan como recursos del usuario, sin uso en el teléfono.
  Se mantienen los cambios previos de otras pantallas. No hay nuevas dependencias.
- Verificados chats, filtros, contador, respuestas, convocatorias, tutorial,
  conservación del fondo y teclado en Chrome aislado. Se corrige el retorno del
  foco al minimizar. Revisados escritorio, móvil estrecho y orientación horizontal.
  Arquitectura y ejemplo de entrega en `docs/MESSAGING_SYSTEM.md`.
- Verificación final: build, lint y diff check correctos; 126 tests pasan. La
  comprobación visual cubre seis tamaños, de 320×568 a 1920×1080. Vite conserva
  el aviso de tamaño de bundle; no se añaden errores de TypeScript ni lint.

## Panel: habitación interactiva sin sidebar · 2026-09-26

- Rediseño solicitado exclusivamente para la navegación del Panel, siguiendo la
  composición de la referencia: camisetas, pizarra, material, puerta, dos papeles
  en corcho y portátil con post-it. Se conservan rutas y acciones de App.
- Se elimina el sidebar del shell. El escudo de la cabecera permite regresar al
  Panel con las restricciones existentes del tutorial. Las otras pantallas no
  cambian su lógica ni sus componentes internos.
- ClubPanelScreen compone InteractiveClubScene y SceneHotspot. Botones nativos
  recortados por polígonos porcentuales, brillo local y contornos SVG. Sin bordes
  de tarjetas, selección inicial ni glow permanente. Hover y foco duran 180 ms;
  teclado y movimiento reducido conservan acceso a los siete destinos.
- El escenario se genera con imagegen integrado, sin textos ni estados horneados.
  Escritura, emblemas, partido y cinco posiciones reales se representan mediante
  capas de interfaz. Dos fuentes manuscritas OFL locales, con variantes de talla,
  rotulador, papel y post-it. No se añade ninguna dependencia.
- Proporción nativa 1733:907, encaje completo bajo la cabecera y coordenadas
  normalizadas. Puede haber franjas para conservar el encuadre. Por debajo de
  700 px se permite desplazamiento horizontal local del escenario legible.
- Decisión de alcance: único fondo del Panel con la luz de la referencia; no se
  crean variantes adicionales. No cambia la hora de partida ni la iluminación
  existente de las otras pantallas.
- Se retiran los accesos duplicados a Mensajes y CONTINUAR. ClubPhone permanece
  global y único; el tutorial señala su dock. Se ajustan únicamente los textos,
  selectores y capas del recorrido a los objetos nuevos.
- Chrome aislado: cuatro resoluciones solicitadas, 28 navegaciones por clic,
  hover, Tab, Enter/Espacio, retorno por escudo, teléfono y contador vivos; paso
  real de Staff a Mensajes del tutorial. Cero errores de consola. Build, lint,
  diff check y 129 tests correctos; permanece el aviso existente del bundle.
- Se preservan cambios previos del usuario. Sin nuevos cálculos de dominio,
  aleatoriedad, persistencia ni funciones preparadas pero inactivas. Sin commit
  ni push. Inventario y detalles en docs/CLUB_PANEL_HUB.md.

## Panel: cobertura, grabado y hover del material · 2026-09-27

- Corrección incremental solicitada sobre la habitación existente. El plano
  común de imagen y hotspots usa cover bajo la cabecera: llena ancho y alto,
  con recorte centrado razonable, sin franjas oscuras laterales ni deformación.
- EQUIPO deja de usar una fuente manuscrita. CarvedTeamLabel dibuja cortes SVG
  desiguales en mayúsculas con surcos, arañazos y bordes de madera. La rugosidad
  tiene semilla fija; el hover ilumina aristas cálidas junto con las camisetas.
- Entrenamientos ilumina papel, celo y material con contornos separados y una
  máscara del mismo fondo. Se ocultan los trazos detrás de la silla y del
  soporte frontal; desaparece el contorno rectangular general.
- Se conservan el bitmap, la cabecera, VESTUARIO, las siete acciones de
  navegación y el teléfono global. Sin dependencias ni cambios de dominio.
  No queda funcionalidad nueva preparada pero inactiva. Detalles e inventario
  en docs/CLUB_PANEL_HUB.md. Sin commit ni push.
- Verificación: cobertura completa sin desbordamiento en 1920×1080, 1600×900,
  1440×900 y 1366×768; siete rutas por tamaño, hovers, Tab, Enter/Espacio,
  teléfono y tutorial real. Cero errores de consola. Build, lint, diff check y
  129 tests correctos; permanece el aviso existente de tamaño de bundle.

## Panel: escena completa y cavidades en la madera · 2026-09-27

- Segunda corrección solicitada del Panel existente. Se sustituye el encaje
  cover del plano funcional por un ajuste proporcional que conserva toda la
  imagen dentro del ancho y alto disponibles. No se recortan el cartel de
  VESTUARIO ni los demás objetos. El espacio sobrante muestra una prolongación
  suavizada del mismo escenario, sin franjas oscuras ni controles duplicados.
- EQUIPO utiliza cavidades cerradas de anchura desigual, esquinas de herramienta
  y desconchados. Se registra la textura del tablón dentro de cada surco y se
  añaden paredes sombreadas y biseles cálidos para mostrar profundidad. El hover
  ilumina la veta y el relieve sin azul ni efecto neón en las letras.
- Se mantienen imagen original, geometría de hotspots, rutas, cabecera,
  VESTUARIO, hover de Entrenamientos y widget global de Mensajes. No se añaden
  dependencias, cálculos de dominio ni funciones preparadas pero inactivas.
  Inventario en docs/CLUB_PANEL_HUB.md. Sin commit ni push.
- Verificado en Chrome aislado: escena completa, siete hotspots, grabado,
  VESTUARIO y dock de Mensajes dentro del área visible en 1920×1080, 1600×900,
  1440×900 y 1366×768. La imagen ocupa el 92–100 % del ancho con DEV activo;
  hover, clic, teclado, teléfono y tutorial funcionan sin errores de consola.
  Build, lint, diff check y 129 tests correctos. Permanece el aviso de bundle.

## Panel: nueva ilustración ancha y EQUIPO rayado en el material · 2026-09-27

- El usuario autoriza sustituir la escena base. Se genera y activa
  club-panel-room-wide.png (1774×887, 2:1), con los mismos siete objetos y espacio
  ambiental en sus bordes. Se conserva el archivo anterior sin utilizarlo.
- EQUIPO está arañado físicamente en el tablón del bitmap por petición expresa:
  trazos finos irregulares y pequeños surcos claros, dentro de la madera. Se
  elimina CarvedTeamLabel y sus letras, sombras y biseles superpuestos. Es la
  única inscripción integrada en el fondo; todos los otros títulos, emblemas y
  datos permanecen en la interfaz. No se inventa escritura decorativa.
- Se elimina club-scene-surround y el blur lateral. El nuevo plano 2:1 ocupa
  todo el ancho y alto disponible; su margen ambiental permite ajustar las
  cuatro resoluciones sin recortar la composición funcional ni VESTUARIO.
- Hotspots registrados sobre la nueva ilustración, con las mismas acciones y
  orden de teclado. Equipo ilumina el tablón original y las camisetas; los
  contornos de Entrenamientos siguen el papel, celo, conos, petos, ropa, bolsas,
  balones y soportes, sin marco rectangular general. Datos del corcho dentro
  de sus papeles. Cabecera y teléfono global conservados.
- Sin dependencias, cambios de dominio, aleatoriedad ni funcionalidad nueva
  preparada pero inactiva. Inventario y prompts en CLUB_PANEL_WIDE_ASSET.md.
  Sin commit ni push.
- Comprobado con Vite y Chrome aislado en 1920×1080, 1600×900, 1440×900 y
  1366×768: plano cubriendo todo el contenido, siete hotspots y rótulos dentro
  del área visible, datos completos en los papeles, sin capas laterales ni
  letras superpuestas. Hover, 28 clics, Tab, Enter/Espacio, teléfono y tutorial
  correctos; cero errores de consola. Build, lint, diff check y 129 tests pasan.
  Se conserva el aviso existente de tamaño del bundle.

## Panel: última referencia principal y HUD de videojuego · 2026-09-27

- La nueva imagen del usuario sustituye las referencias anteriores. Se activa
  club-panel-reference.png (1619×971); los dos fondos previos se conservan sin
  uso. La habitación reproduce ventana, camisetas, pizarra, estantería, puerta,
  dos corchos y portátil. Se completa el teclado en el primer plano.
- El usuario pide títulos físicos integrados: los siete nombres permanecen en
  sus superficies del bitmap. Esto es una excepción explícita a la regla de
  fondos sin escritura. No se inventan textos decorativos. EQUIPO tiene letras
  manuales de anchos y alturas distintos, con arañazos finos interrumpidos dentro
  de la madera, sin relieve hacia fuera ni tipografía superpuesta. El hover
  ilumina la textura original. No se hornean datos reales, UI ni selecciones.
- La cabecera cambia solo en el Panel: HUD navy translúcido, escudo, calendario,
  papel del rival y CONTINUAR. Reutiliza las mismas acciones y datos. La imagen
  única continúa detrás del HUD. Su escala y origen se limitan por la geometría
  de los siete objetos, manteniendo completo VESTUARIO y el portátil sin bandas,
  blur ni duplicación de fondo en las cuatro resoluciones solicitadas.
- Los botones nativos reutilizan las siete acciones y orden de teclado. El
  brillo es sutil; Entrenamientos usa máscara y contornos de objetos separados.
  Los datos actuales del corcho se sitúan bajo sus títulos manuscritos y la letra
  de clasificación se aumenta. Teléfono global, tutorial y dominio conservados.
- En ventanas estrechas se recorre la habitación con desplazamiento horizontal
  local para conservar tamaños legibles. En paisaje muy bajo se permite scroll
  vertical local. No desborda la página ni se añade otra navegación.
- Inventario y prompts exactos de imagegen integrado en CLUB_PANEL_REFERENCE.md.
  Sin dependencias, aleatoriedad nueva, funciones inactivas, commit ni push.
- Verificado en Vite y Chrome aislado: 1920×1080, 1600×900, 1440×900, 1366×768,
  siete hovers y clics por tamaño, objetos completos bajo la cabecera, foco,
  Tab, Enter/Espacio, teléfono con contador real, tutorial de Staff/Mensajes y
  ventanas 390×844 y 780×390. Cero errores de consola. Build, lint, diff check
  y 129 tests correctos; se conserva el aviso anterior de tamaño del bundle.
