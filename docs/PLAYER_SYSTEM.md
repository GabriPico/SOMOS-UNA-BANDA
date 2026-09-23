# Sistema de jugadores

La charla previa aporta estados emocionales pequeños a cada convocado al iniciar
el partido. Influyen en su conducta y ánimo, con respuestas según personalidad,
relación, felicidad y autoridad; no alteran atributos, Calidad General ni
familiaridad. Se atenúan usando los minutos disputados del motor. La preparación
táctica queda fijada al entrar en el vestuario. Véase [PREMATCH_TALK.md](PREMATCH_TALK.md).

La asignaciÃ³n determinista de personalidades respeta la edad: `Veterano` nunca se genera antes de los 30 aÃ±os y gana peso progresivamente a partir de 32â€“35; `LÃ­der` puede aparecer a cualquier edad con una ponderaciÃ³n ligeramente mayor al acumular experiencia. El rasgo deportivo `VETERANO` se valida igualmente con edad mÃ­nima de 30.

El primer amistoso usa el historial de convocatorias por partido, pero no aplica
máximo de 18 ni excluye jugadores a prueba. La lista anunciada restringe los
jugadores disponibles para el encuentro y se comunica como mensaje persistente
dentro del grupo del equipo.

Documento canónico del sistema implementado. La fuente ejecutable de verdad son
`src/domain/models.ts`, `playerRatings.ts`, `playerGeneration.ts` y
`positionFamiliarity.ts`.

## Modelo y atributos

`Player` contiene identidad, edad, posición principal, posiciones secundarias,
pierna hábil, arquetipo, rasgos, datos deportivos/humanos y `PlayerAttributes`.
No contiene Calidad General ni rating táctico persistidos.

Todos los atributos usan enteros 1–20:

- Portería: `paradas`, `juegoPiesPortero`, `juegoAereoPortero`.
- Mentales: `comunicacion`, `intensidad`, `mentalidad`.
- Físicos: `rapidez`, `alcanceAereo`, `fuerza`, `resistencia`, `agilidad`.
- Técnicos: `tecnica`, `regate`, `pases`, `remate`, `balonParado`, `entradas`,
  `marcaje`.

Ningún atributo generado vale 0. Rapidez, Fuerza, Resistencia y Agilidad tienen
mínimo 3 en la validación del generador. `balonParado` todavía no interviene en
ninguna fórmula de rating.

## Posiciones y pierna hábil

Posiciones válidas: `POR`, `DFC`, `LD`, `LI`, `CAD`, `CAI`, `MCD`, `MC`, `MP`,
`MD`, `MI`, `ED`, `EI` y `DC`.

Un jugador tiene una posición principal y cero o más secundarias. La UI las
muestra juntas (`LD/CAD`, `MCD/MC`, `DC/ED`). Un slot de una formación es una
posición táctica temporal y nunca añade o elimina posiciones naturales.

`PreferredFoot` admite `RIGHT`, `LEFT` y `BOTH`, mostradas como Derecha,
Izquierda y Ambas. La pierna no modifica actualmente los ratings.

## Calidad General y rating teórico

`calculatePositionRating(player, position)` aplica la fórmula de la posición a
los atributos base, conserva decimales y limita defensivamente el resultado a
0–100. La conversión es:

`suma(atributo × peso) × 5`

`calculateGeneralRating` devuelve el máximo rating entre las posiciones
naturales. `getBestRatedPosition` devuelve la posición natural que produce ese
máximo. La UI redondea solo al mostrar.

Mapeo de perfiles: POR→POR, DFC→DFC, LD/LI→LAT, CAD/CAI→CAR, MCD→MCD, MC→MC,
MP→MP, MD/MI→MD_MI, ED/EI→EXT y DC→DC.

### Ponderaciones implementadas

Los porcentajes siguientes coinciden con `POSITION_RATING_WEIGHTS`:

- **POR:** Paradas 50%; Juego de pies POR 10%; Juego aéreo POR 15%;
  Comunicación 10%; Mentalidad 15%.
- **DFC:** Comunicación 7,5%; Intensidad 10%; Mentalidad 10%; Rapidez 10%;
  Alcance aéreo 18,75%; Fuerza 10%; Resistencia 2,5%; Agilidad 2,5%; Técnica
  2,5%; Regate 1,25%; Pases 5%; Entradas 10%; Marcaje 10%.
- **LAT:** Comunicación 2,5%; Intensidad 10%; Mentalidad 7,5%; Rapidez 20%;
  Alcance aéreo 2,5%; Fuerza 5%; Resistencia 15%; Agilidad 5%; Técnica 2,5%;
  Regate 2,5%; Pases 7,5%; Entradas 10%; Marcaje 10%.
- **CAR:** Comunicación 2,5%; Intensidad 10%; Mentalidad 7,5%; Rapidez 20%;
  Alcance aéreo 1,25%; Fuerza 3,75%; Resistencia 18,75%; Agilidad 7,5%; Técnica
  5%; Regate 6,25%; Pases 7,5%; Remate 1,25%; Entradas 5%; Marcaje 3,75%.
- **MCD:** Comunicación 5%; Intensidad 12,5%; Mentalidad 12,5%; Rapidez 7,5%;
  Alcance aéreo 5%; Fuerza 7,5%; Resistencia 10%; Agilidad 2,5%; Técnica 5%;
  Regate 2,5%; Pases 12,5%; Entradas 10%; Marcaje 7,5%.
- **MC:** Comunicación 5%; Intensidad 10%; Mentalidad 10%; Rapidez 5%; Alcance
  aéreo 2,5%; Fuerza 2,5%; Resistencia 15%; Agilidad 5%; Técnica 10%; Regate 5%;
  Pases 20%; Remate 2,5%; Entradas 5%; Marcaje 2,5%.
- **MP:** Comunicación 2,5%; Intensidad 7,5%; Mentalidad 10%; Rapidez 7,5%;
  Alcance aéreo 1,25%; Fuerza 1,25%; Resistencia 7,5%; Agilidad 10%; Técnica 15%;
  Regate 12,5%; Pases 17,5%; Remate 7,5%.
- **MD_MI:** Comunicación 2,5%; Intensidad 10%; Mentalidad 8,75%; Rapidez 15%;
  Alcance aéreo 1,25%; Fuerza 3,75%; Resistencia 15%; Agilidad 7,5%; Técnica
  7,5%; Regate 8,75%; Pases 10%; Remate 2,5%; Entradas 5%; Marcaje 2,5%.
- **EXT:** Comunicación 1,25%; Intensidad 7,5%; Mentalidad 7,5%; Rapidez 20%;
  Alcance aéreo 1,25%; Fuerza 2,5%; Resistencia 10%; Agilidad 12,5%; Técnica 10%;
  Regate 15%; Pases 7,5%; Remate 5%.
- **DC:** Comunicación 1,25%; Intensidad 10%; Mentalidad 10%; Rapidez 15%;
  Alcance aéreo 10%; Fuerza 10%; Resistencia 5%; Agilidad 5%; Técnica 7,5%;
  Regate 5%; Pases 2,5%; Remate 18,75%.

Cada tabla suma 100% y se valida al cargar el módulo.

## Decisiones especiales de portero

Paradas es el factor dominante del rating POR. `juegoPiesPortero` es específico
del desempeño de un portero con balón: no equivale a Pases, Técnica o Regate, que
no intervienen en la fórmula POR.

El generador usa rangos propios para los atributos generales de los porteros y
solo ajusta hacia el objetivo mediante atributos ponderados. La ficha oculta el
bloque de portería salvo que `POR` sea una posición natural.

## Generación determinista

`generatePlayer` recibe `targetRating` y `seed`. La plantilla mock conserva
semillas fijas y por ello no cambia entre renders. El proceso implementado:

1. crea atributos iniciales concentrados alrededor del nivel objetivo;
2. aplica sesgos de arquetipo y rasgos;
3. calcula el rating real;
4. reparte ajustes entre atributos ponderados, con topes blandos;
5. valida escalas y mínimos físicos.

Escala interpretativa: 1–3 extremadamente bajo, 4–6 muy bajo, 7–9 bajo, 10–12
normal, 13–15 bueno, 16–18 destacado, 19 excepcional y 20 extraordinariamente
raro. El ajuste normal no crea 19–20; solo una tirada excepcional sobre una
fortaleza puede hacerlo. Se admiten especialistas con un atributo extraordinario
y carencias claras; no se busca homogeneidad.

## Arquetipos

Los arquetipos orientan tendencias, no son clases rígidas. Existe configuración
de probabilidades reutilizable para estos catálogos:

- POR: Parador, Dominador aéreo, Portero moderno, Completo.
- DFC: Central dominante, Central marcador, Central rápido, Central con salida,
  Central completo.
- LAT: Lateral defensivo, Lateral físico, Lateral ofensivo, Lateral equilibrado,
  Lateral técnico.
- CAR: Carrilero incansable, Carrilero reconvertido, Carrilero ofensivo,
  Carrilero asociativo, Carrilero completo.
- MCD: Destructor, Pivote posicional, MCD físico, Pivote constructor, MCD completo.
- MC: Todoterreno, Organizador, MC defensivo, MC físico, MC técnico, MC completo.
- MP: Creador, Regateador, Llegador, Segundo delantero, Mediapunta completo.
- MD/MI: Banda trabajador, Banda ofensivo, Banda defensivo, Banda asociativo,
  Banda completo.
- EXT: Extremo velocista, Extremo regateador, Extremo técnico, Extremo goleador,
  Extremo completo.
- DC: Hombre objetivo, Delantero rápido, Rematador, Delantero trabajador,
  Delantero técnico, Segundo punta, Delantero completo.

**Estado real:** los mocks seleccionan explícitamente su arquetipo. La tabla de
probabilidades existe para generación futura, pero todavía no hay una función que
elija automáticamente desde ella. Los sesgos alto/bajo están definidos para los
arquetipos usados por la plantilla actual, no para todo el catálogo.

## Rasgos

`PlayerTrait` contempla Veterano, Irregular, Muy físico, Frágil físicamente,
Talentoso, Limitado técnicamente, Rápido, Lento, Potente por arriba y Bajito. Los
rasgos pueden modificar tendencias antes del ajuste sin superar artificialmente
los topes altos.

**Estado real:** todos tienen modificadores en `applyTraits` salvo `IRREGULAR`,
que está tipado pero todavía no aplica dispersión adicional.

## Ficha y pantalla Equipo

Equipo muestra dorsal, retrato y nombre, todas las posiciones naturales, edad,
PJ(TIT), minutos, goles, felicidad, estado y observaciones en una tabla compacta.
Permite buscar, filtrar por posición y ordenar. Seleccionar una fila actualiza
la ficha permanente de la derecha, `src/components/PlayerDetail.tsx`, compartida
con Tácticas. El nombre de una fila o de la ficha lateral navega al perfil dedicado
`PlayerProfileScreen`, que reutiliza `PlayerDetail` en variante `page`. El retrato
y el resto de la fila siguen seleccionando. El botón «Ver ficha completa» del
resumen abre la misma pantalla. La ficha lateral conserva identidad, calidad, rol,
personalidad, medidas, posiciones, estadísticas y estado; los atributos y el
perfil de vestuario ampliable se reservan a la ficha completa. Otros accesos
conservan su modal actual.

Calidad General y calidad por posición siguen siendo cálculos internos 0–100,
presentados mediante la escala compartida de 1–5 estrellas con medias estrellas.
Los atributos deportivos conservan internamente su escala 1–20, pero se muestran
con **0–5 estrellas**, redondeadas a la media estrella más cercana mediante
`round((valor - 1) / 19 * 10) / 2`. No se expone el valor interno en texto ni
tooltip. Forma, Felicidad, Condición y Cansancio usan etiquetas cualitativas.
Las estadísticas objetivas de partido permanecen numéricas. Las titularidades y
minutos ausentes se muestran como «—»; un historial parcial de minutos se indica
en el tooltip. No se deducen minutos a partir de apariciones.

La parte superior de la ficha reúne Calidad General, rol en el
equipo y personalidad actual. El rol reutiliza las expectativas y el rol social
existentes en el vestuario; no crea nuevas reglas de minutos. Edad, altura, peso
y pierna dominante se agrupan. Equipo y perfil usan una leyenda compacta de
posiciones sin mini campo; la explicación del rol está en su tooltip. Altura y peso se asignan en
`generatePlayerMeasurements` con una semilla independiente de los atributos,
respetan valores explícitos y son descriptivos: no modifican el rendimiento ni
generan estados de sobrepeso. Los campos nuevos son opcionales para conservar
compatibilidad. Dorsal y fecha de nacimiento solo se muestran cuando existen.
El estado de cuota procede del plan de cuota del club y no expone importes ni
aumenta el presupuesto deportivo.

Estado del vestuario reutiliza esos mismos planes para derivar un resumen social
de cuotas y mostrar solo casos pendientes. Cobrar del club es excepcional,
determinista, de importe modesto y conserva el contexto del acuerdo; exenciones
y acuerdos especiales son más habituales.

La ficha completa agrupa los atributos base actuales en técnicos, mentales y físicos.
Solo los porteros naturales muestran el bloque de portería, sustituyendo alcance
aéreo por juego aéreo de portero. Desde Tácticas se añade el contexto del puesto
actual sin reemplazar los atributos base mostrados. El perfil desplegable conserva
forma, relaciones, cuotas y valoraciones. Las valoraciones válidas se guardan en
`PlayerSeasonStats` cuando el jugador disputa minutos; de ahí se derivan la media
y las últimas cinco sin inventar datos para el histórico previo. Las últimas
cinco se ocultan mientras no exista histórico. La ficha abierta desde Estado del
vestuario recibe las mismas estadísticas y lesiones que desde Equipo.

### Retratos y presentación del vestuario

`src/data/playerPortraits.ts` resuelve por `Player.id` el archivo original en
`public/assets/players/portraits/`. La convención es `<id>.png`; un mapping opcional
permite conservar otro nombre o extensión. `PlayerPortrait` se utiliza en Equipo,
Estado del vestuario, voces, Tácticas y ficha individual, con el mismo archivo en todos los
tamaños. Si falta o no puede cargarse, muestra `placeholder.svg`, una silueta
neutra. El fallo es local al componente; no cambia el estado de partida.

Todos los tamaños usan `object-fit: contain`, sin recorte, filtros ni deformación.
Los originales conservan transparencia y permanecen como assets independientes.
Nunca se generan ni se modifican caras. Para incorporar los archivos definitivos,
consultar [PLAYER_PORTRAITS.md](PLAYER_PORTRAITS.md).

El vestuario presenta tres indicadores compactos con nombre, etiqueta, barra de
nivel 0–100 y descripción breve. Las barras usan cohesión, felicidad y autoridad
actuales, aproximadas visualmente al múltiplo de 10 más cercano; su color sigue
la etiqueta cualitativa. No muestran porcentajes ni cambian escalas o umbrales.
Situación actual conserva hasta cuatro asuntos existentes priorizados por gravedad.
La sección Problemas aparece después y antes de Jugadores. Su tabla conserva toda la plantilla mediante scroll
interior y cabecera fija. `squadRole` se presenta como «Expectativa», manteniendo
su significado de minutos esperados; la autoridad individual usa
`managerAuthority` traducida con los mismos umbrales de autoridad del dominio.
No se generan nuevas expectativas, conflictos ni consecuencias.

Problemas es una vista derivada en `getDressingRoomProblems`: recoge situaciones
individuales registradas, asuntos negativos o de atención existentes, relación
«Mala / Muy mala», autoridad «Cuestionada / Muy cuestionada» y los casos de cuota
que ya devuelve `getTeamFeeSummary`. Las categorías humanas reutilizan los helpers
actuales; las finanzas conservan exclusiones de acuerdos, exentos y compensaciones.
Solo se incluyen jugadores presentes en la plantilla y los asuntos colectivos.

`situationIssueId` enlaza opcionalmente una situación individual con su aviso
general mediante ID estable, para conservar su severidad sin duplicar el mismo
problema. Es compatible con perfiles antiguos que no tengan ese campo. Los asuntos
positivos no se consideran problemas. La tabla usa Severidad, Jugador, Asunto y
Estado, ordena los casos por gravedad y permite abrir la ficha desde el nombre.
El scroll interior conserva todos los casos sin desplazar el protagonismo de la
tabla principal. Si no hay casos muestra «No hay problemas relevantes ahora mismo.».

Los estados «Activo», «Pendiente» y «Restricción activa» describen el dato actual;
no implican un nuevo flujo de resolución, conversaciones ni sanciones. Un caso
derivado desaparece cuando su fuente deja de indicarlo. Las situaciones iniciales
siguen existiendo hasta que se actualice su fuente, todavía mock. No se convierten
riesgos de personalidad, históricos de decisiones o malestar general en conflictos
activos ni se atribuyen causas no registradas.

El sistema visual global oscuro/claro se documenta en [VISUAL_SYSTEM.md](VISUAL_SYSTEM.md).
Todas las pantallas comparten los tokens de tema. En escritorio ancho, Cambios recientes
es un historial lateral con mayor presencia, agrupado por signo y sin fechas
inventadas. Voces y cuotas permanecen debajo de la tabla principal. Las cuotas
siguen derivándose mediante `getTeamFeeSummary`; la petición de Manolo solo aparece
cuando hay retrasos. Asuntos, situaciones individuales y cambios siguen usando
los datos existentes de `initialDressingRoomState`, sin simular una actualización
dinámica que todavía no existe. Objetivos y confianza presidencial dejan de
mostrarse aquí; sus datos permanecen en la partida para su futura presentación
en Panel / Objetivos.

## Tácticas y rating actual

En Táctica, condición física, cansancio e incidencia puntual se presentan como
tres dimensiones cualitativas independientes. La incidencia vive en el estado
dinámico serializable del jugador, puede afectar temporalmente el rendimiento
efectivo y desaparece por avance temporal; no se incorpora al modelo base ni a
la Calidad General permanente.

Las formaciones implementadas son 4-4-2, 4-3-3, 4-2-3-1, 3-5-2 y 5-4-1. Se
pueden intercambiar titulares y suplentes, y también dos slots del once.

El XI inicial y las propuestas del segundo entrenador reutilizan una asignación
global de jugadores a los slots de la formación activa. La asignación minimiza
primero puestos improvisados y después puestos meramente compatibles; las
diferencias de rating, condición y percepción del ayudante solo desempatan dentro
de ese orden estructural. La falibilidad del segundo afecta sus preferencias, no
la interpretación básica de los puestos requeridos por la formación.

En Tácticas, un clic en tarjeta, posiciones o retrato selecciona al jugador. Un único
`selectedPlayerId` vincula campo, tabla derecha y resumen compacto superior. Dos
clics sobre jugadores distintos permiten intercambiarlos. La X del resumen o el
campo vacío cancelan la selección. El nombre del jugador y VER FICHA COMPLETA abren
el perfil dedicado, usando el mismo `PlayerDetail` de Equipo en variante `page`.
La variante `summary` conserva la vista compacta del seleccionado. Abrir un nombre
no selecciona ni intercambia; arrastrar desde el nombre sí usa la operación táctica.
La ficha completa muestra Calidad General y
`calculateTacticalRating(player, tacticalPosition)` mediante estrellas, nunca un
valor almacenado, junto con familiaridad y adaptación cualitativa. Las tarjetas
del campo priorizan retrato, dorsal existente, nombre corto, puesto ocupado,
corazón de condición y barra de stamina, con avisos independientes de incidencias.
El cansancio alimenta la barra, aproximada a decenas y sin porcentajes visibles.

La columna derecha muestra titulares y suplentes en una tabla visual continua con Calidad General
mediante estrellas, calculada desde los atributos base actuales. Sus selecciones
se sincronizan con las tarjetas del campo. El banquillo muestra únicamente los
convocados fuera del once. Al final hay un selector desplegable de candidatos
antes de anunciar la lista y un acceso de consulta a no convocados después.
La selección, instrucciones y once se conservan al cerrar la ficha completa.
Las posiciones naturales aparecen bajo cada nombre completo, con principal y
secundarias diferenciadas. El puesto ocupado tiene su propia columna.

Clics y arrastre reutilizan `moveAvailableLineupPlayer`, que comprueba convocatoria
y elegibilidad y delega en `moveLineupPlayer`, incluida la regla del portero natural.
El arrastre por Pointer Events sirve a campo y tabla, ratón y táctil; empieza tras
7 px de movimiento y tiene preview compacta, destino resaltado y scroll local.
Las coordenadas pertenecen a los slots de la formación, nunca al jugador.
El feedback distingue principal, secundaria, compatible e improvisada a partir de
`getPositionFamiliarity`; improvisada muestra aviso sin añadir restricciones.
No se modifican atributos, ratings ni penalizaciones posicionales.

Las instrucciones visibles son:

- Ajustes generales: Formación y Mentalidad (Ofensiva/Equilibrada/Cauta).
- Con balón: Pase (En corto/Mixto/Directo) y Ritmo (Alto/Medio/Bajo).
- En transición: Tras recuperar (Contraataque/Equilibrada/Mantener posición)
  y Tras pérdida (Presión tras pérdida/Mixto/Repliegue).
- Sin balón: Altura (Alta/Media/Baja), Presión (Alta/Media/Baja), Perder tiempo
  (Sí/No) y Ser agresivos (Sí/No).

Las instrucciones ocupan una columna compacta a la izquierda del campo. Formación
y Mentalidad se editan directamente; los otros tres bloques alternan resumen y
selects mediante CAMBIAR / LISTO, con un solo bloque abierto simultáneamente.
Estas diez opciones editan el `TacticalPlan` existente en App y la partida;
el rediseño no cambia sus efectos en entrenamiento o simulación.

La familiaridad general calculada por entrenamiento se muestra debajo de Formación
y Mentalidad con texto, color y barra aproximada. Se reutilizan los niveles vigentes
Muy baja, Baja, Media, Alta y Muy alta. La propuesta del segundo cierra la columna
izquierda; no ocupa una banda horizontal sobre el campo.

El perfil dedicado reúne identidad, club, posiciones, calidad, rol, personalidad,
medidas, pie, estado, atributos y estadísticas disponibles. Mantiene observaciones
y el perfil de vestuario ampliable; no inventa asistencias ni notas de staff.
La navegación vive en App, con el ID de jugador y el origen conservado. Una frontera
`Activity` de React mantiene el estado y oculta la pantalla de origen; al volver se
restauran foco y desplazamientos. Selección, filtros, grupo táctico abierto, propuesta
y once no se reinician. Este estado de navegación no forma parte de la partida.

## Familiaridad y atributos efectivos

`positionFamiliarity.ts` contiene un grafo bidireccional y compatibilidades de banda.
La clasificación ejecutable vigente, conforme a las decisiones del sistema, es:

- `PREFERRED`: posición principal o secundaria; penalización 0.
- `COMPATIBLE`: compatibilidad de banda o distancia 1 desde una posición natural;
  penalización 0.
- `IMPROVISED`: los demás puestos; penalización 2 sobre atributos relevantes.

Relaciones actuales: DFC–LD/LI/MCD; LD–CAD; LI–CAI; CAD–MD/ED; CAI–MI/EI;
MD–MC/ED; MI–MC/EI; MCD–MC; MC–MP; MP–DC/ED/EI; ED–DC; EI–DC. `POR` no tiene
aristas: cualquier cruce POR↔campo es `IMPROVISED`.

`getEffectiveAttributesForPosition` copia los atributos base y resta la
penalización únicamente a los atributos con peso positivo en la fórmula del slot,
con mínimo temporal 1. `calculateTacticalRating` aplica la fórmula normal a esa
copia, con un punto de valoración por puesto preferido y límite 100. Ni los atributos base, ni las posiciones naturales, ni la Calidad General
cambian.

## Convocatoria oficial

Próximo partido permite anunciar entre 11 y 18 jugadores para Liga. La lista distingue convocados, descartes técnicos, lesionados, sancionados, indisponibles y no inscritos. Los jugadores a prueba son no inscritos para Liga, aunque siguen disponibles en amistosos. Tras anunciar, Tácticas restringe el workspace a los convocados y el historial queda guardado por partido.

Quedarse fuera solo modifica el componente humano de tiempo de juego cuando el jugador era elegible. La magnitud considera apariciones recientes, calidad, personalidad, felicidad, autoridad y descartes consecutivos.

## Planificado / pendiente

- Aprendizaje progresivo de posiciones por entrenamiento, minutos o experiencia.
- Overrides individuales de familiaridad y transición hacia posición natural.
- Selección probabilística automática de arquetipos desde la configuración.
- Sesgos detallados para todos los arquetipos catalogados.
- Efecto de pierna hábil y Balón Parado en sistemas de juego.

## Integración con entrenamiento

El entrenamiento conserva una copia guardable de los atributos base y estados
decimales por atributo. El valor efectivo suma el bonus provisional, nunca supera
20 y puede recibir penalizaciones físicas temporales antes de integrarse en el
motor de partido. La ficha muestra `↑` cuando existe un bonus provisional
positivo, sin revelar su valor exacto. Las estrellas reflejan los atributos base
actuales; el rating táctico utiliza los atributos efectivos y la familiaridad.

La consolidación puede elevar el atributo base al cerrar una semana. Para
porteros, el entrenamiento sustituye cualquier trabajo aéreo de campo por
`juegoAereoPortero`; nunca entrena `alcanceAereo` como equivalente.

## Resumen social del vestuario

`dressingRoomPresentation.ts` deriva una selección de hasta seis jugadores a
seguir desde sus incidencias actuales y, cuando existe, un apoyo influyente al
entrenador. La gravedad ordena las prioridades; un jugador no ocupa varias filas.
La influencia proviene de `TrainingPlayerState.lockerRoomInfluence` y la jerarquía
cuenta exactamente los miembros de la plantilla actual en sus cuatro categorías.
No se modifican atributos, roles, autoridad, felicidad ni influencia al consultar.

Las voces son una representación breve de los estados existentes, no nuevas
conversaciones persistentes. Compromisos proyecta las promesas activas de
`GameState.promises`, respetando identidad y estado; las incidencias no generan
promesas automáticamente. Su resolución sigue perteneciendo al dominio existente.
Los asuntos e historial mock conservan su fuente hasta la implementación de un
ciclo de vida completo. Los datos individuales siguen disponibles en Equipo y
PlayerDetail; Estado del vestuario prioriza ahora las situaciones colectivas.
