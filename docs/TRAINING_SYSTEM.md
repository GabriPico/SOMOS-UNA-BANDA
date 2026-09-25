# Sistema de entrenamiento

La charla previa de partido consulta únicamente sesiones completadas de la semana
actual y sus instantáneas tácticas. No vuelve a resolverlas ni modifica sus efectos.
Una sesión pendiente o de mínimos no acredita haber trabajado la táctica. Las
referencias narrativas contrastan formación y opciones realmente entrenadas con el
planteamiento del partido. Ese trabajo genera temas opcionales: el jugador decide
qué recordar y puede terminar sin explicar la táctica. Véase
[PREMATCH_TALK.md](PREMATCH_TALK.md).

Una sesiÃ³n pendiente conserva un estado explÃ­cito de planificaciÃ³n: `UNPLANNED`, `DIRTY` o `PLANNED`. Editar intensidad, bloques u otro dato guardado produce `DIRTY`; solo la acciÃ³n de guardar devuelve `PLANNED`. `CONTINUAR` no avanza mientras una sesiÃ³n semanal estÃ© sin guardar y la UI identifica las sesiones afectadas.

La primera sesión completada de toda la partida con intensidad Alta o algún
bloque Físico dispara una incidencia semiguionizada con un veterano seleccionado
de forma determinista. Un hecho narrativo serializable impide que se repita. La
elección puede crear una promesa tipada que dominio compara con el siguiente
entrenamiento realmente completado, sin depender del día o la semana.

Las dos primeras sesiones guiadas garantizan también una incidencia única con el
jugador más afín a un papel social e informal. Aparece tras la primera sesión
normal o queda pendiente para la segunda cuando el veterano tuvo prioridad. Su
protagonista, aparición y respuesta del entrenador quedan en hechos narrativos.

La fuente ejecutable está en `src/domain/trainingEngine.ts`, `trainingBalance.ts`,
`trainingPersonality.ts`, `trainingSessionResolver.ts` y `trainingTypes.ts`. La
pantalla de Entrenamiento solo planifica y consulta resultados. La resolución se
produce al alcanzar el checkpoint temporal y se representa en una escena aparte.

La presencia narrativa del segundo entrenador se deriva en
`assistantPersonality.ts` a partir de su arquetipo, capacidades, estado real de
los jugadores, resultado de la sesión y seed. Esa misma voz alimenta las
intervenciones presenciales y el informe posterior, evitando dos
caracterizaciones independientes. Sus observaciones sobre el esfuerzo no abren
una decisión rutinaria de carga. La intensidad Baja, Media o Alta se elige en la
planificación y se mantiene durante toda la sesión, salvo una incidencia
narrativa específica y excepcional. El relato no rebaja el cansancio ni modifica
el resultado de una sesión ya resuelta.

El generador enlaza las observaciones del segundo con los acontecimientos y el
resumen sin una elección intermedia de aflojar, mantener o esperar. Esto se aplica
al primer entrenamiento guiado y a todas las sesiones posteriores. Se conservan
las decisiones de incidencias concretas, como la queja única del veterano y el
episodio del gracioso, y la revisión del plan de la siguiente sesión en Mensajes.

## Planificación, resolución y resultado

Al cerrar el primer entrenamiento termina la guía global: Equipo, Staff,
Táctica, Entrenamiento, Mensajes, Estado del vestuario y Panel quedan accesibles.
El informe y la decisión sobre la segunda sesión pueden seguir pendientes, pero
solo condicionan el avance mediante `CONTINUAR`, nunca la navegación. Las escenas
concretas conservan su interacción modal. Consultar pantallas no resuelve sesiones.

Guardar una planificación y resolver una sesión son acciones independientes.
El guardado normal mantiene al usuario en Entrenamiento. Si se está atendiendo
la revisión de la segunda sesión prometida al ayudante, guardar esa sesión
resuelve la obligación y devuelve al Panel sin avanzar el calendario. Al cerrar
el resultado y sus incidencias también se vuelve al Panel; un checkpoint
posterior solo puede alcanzarse mediante una nueva pulsación explícita de
`CONTINUAR`.

En el seguimiento entre sesiones, el `CONTINUAR` global solo puede consumir el
checkpoint de la segunda sesión si se pulsa desde el Panel. Si la decisión de
mantener o revisar acaba de cerrarse desde el teléfono abierto o Entrenamiento,
esa primera pulsación minimiza el teléfono y vuelve al Panel sin avanzar el tiempo.
Mensajes es ahora un teléfono global: los informes llegan al historial existente,
incrementan el contador y pueden consultarse sin abandonar Entrenamiento ni otra
pantalla. Véase [MESSAGING_SYSTEM.md](MESSAGING_SYSTEM.md).

Cada sesión distingue la planificación (`TrainingSessionPlan` y previsiones), el
resultado persistente (`SessionResult`) y sus eventos tipados. Antes del checkpoint
no existe resultado. `resolveTrainingSession` resuelve una sola vez asistencia y
Staff reales, incidencias, calidad y efectos; una sesión ya resuelta se devuelve
sin nuevas tiradas.

Las fases visuales de llegada, bloques, incidencias y resumen se derivan del
resultado. El índice de fase pertenece a React y no se persiste como hecho de la
partida.

En el primer entrenamiento guiado, el segundo interviene antes de arrancar,
durante uno o dos momentos relevantes y al terminar. Las observaciones nunca
leen información inexistente: los nombres y diagnósticos parten de asistencia,
eventos de rendimiento, cansancio, calidad, carga e incidencias resueltas. La
selección de variantes es determinista y sembrada.

El segundo inicial tiene asistencia garantizada únicamente en esta primera
sesión guiada: su presentación narrativa forma parte del onboarding. Desde el
segundo entrenamiento vuelve a aplicarse su disponibilidad normal y sembrada.
Las incidencias propias del primer día conservan su resolución y añaden después
una reacción del segundo acorde con el mismo sistema de voz.

La disponibilidad prevista se presenta al inicio y no se clasifica como
incidencia. Las incidencias quedan reservadas para hechos que alteran la sesión
(lesión, molestias, falta excepcional sin avisar); el rendimiento cotidiano,
los retrasos leves y los comentarios del Staff son observaciones. Una sesión
normal puede terminar sin incidencias. Tras la primera sesión, el resumen y la
decisión sobre mantener o revisar el plan de la segunda se añaden al hilo de
Mensajes del ayudante disponible. Si se promete revisarlo, el avance queda
bloqueado hasta guardar de nuevo esa segunda sesión desde Entrenamiento.
`PLANNED` sigue siendo editable; solo `COMPLETED` es inmutable.

Los valores humanos y físicos se conservan numéricamente en dominio, pero la UI
los presenta mediante escalas cualitativas compartidas. La autoridad representa
la percepción del entrenador. Estado del vestuario distingue ahora la relación
individual de la autoridad individual mediante etiquetas, sin mostrar porcentajes
ni modificar sus valores o efectos.

## Estado guardable

`GameState.training` (`TrainingGameState`) conserva semana, semilla reproducible, sesiones, resultados,
estado físico y humano individual, atributos base, bonus provisional,
consolidación, continuidad y memoria táctica. Actualmente vive en `App.tsx`; no
existe todavía persistencia a disco.

Cada atributo tiene bonus temporal limitado a +2 y valor efectivo limitado a 20.
El trabajo específico acumula ganancia según intensidad, calidad, dificultad,
respuesta sembrada y exposiciones semanales. Al cerrar la semana se aplican la
decadencia (30%, o 15% con mantenimiento Completo), continuidad y consolidación.

## Sesiones y calidad

Solo los asistentes reciben efectos individuales. Menos de 13 asistentes produce
una sesión De mínimos. Con 13 o más, la calidad pondera asistencia 35%, autoridad
30%, aportación del staff disponible 20% y estado del grupo 15%. La aportación
ya no procede de una calidad general visible: deriva de entrenamiento,
organización, compromiso, fiabilidad, disponibilidad y modificadores leves de
personalidad. Los multiplicadores y umbrales están centralizados en
`trainingBalance.ts`.

Condición y cansancio se procesan individualmente. Resistencia reduce la fatiga;
Físico amplifica condición y carga. Táctica, Balón parado, Lúdico y Descanso usan
sus reglas especiales. El motor expone atributos efectivos con penalizaciones
físicas para una integración posterior con el partido.

Una partida nueva comienza con fatiga mínima para toda la plantilla. La condición
inicial sí varía de forma determinista con la seed y representa la vuelta de
verano: predominan estados justos o bajos, con pocos jugadores en buena condición
y algunos casos muy bajos. Tácticas representa la condición con un corazón y el
cansancio mediante una barra de stamina independiente, ambos con sus etiquetas
cualitativas accesibles, incluido `Fresco`, sin porcentajes numéricos.

La familiaridad táctica visible en Tácticas reutiliza `calculateOverallFamiliarity`
y las etiquetas de `familiarityLabel`. Se presenta bajo Formación y Mentalidad
con barra aproximada a decenas y color cualitativo. Esta presentación no guarda
otra familiaridad ni cambia la ponderación, la memoria de opciones o sus efectos.

Cada `TrainingPlayerState` puede conservar una incidencia física puntual separada,
con tipo estable, fecha de inicio y días restantes. La generación inicial crea de
cero a dos casos leves mediante seed. Sus definiciones centralizan penalizaciones
temporales de atributos efectivos, recuperación, carga percibida, recomendación
del ayudante y riesgo de lesión. El calendario reduce su duración; una carga alta
o disputar suficientes minutos puede prolongar las incidencias sensibles al
esfuerzo. Ningún efecto modifica los atributos base.

## Familiaridad y memoria

La familiaridad general usa 80% instrucciones y 20% formación. Cada opción y
formación conserva valor actual, máximo histórico y marca semanal. La recuperación
de conocimiento previo se acelera y la decadencia tiene un suelo del 45% del
máximo. Balón parado tiene una única familiaridad y empieza a decaer desde la
tercera semana sin trabajo.

## Factores humanos

Hay doce personalidades beta definidas como matrices de modificadores. La
satisfacción con el entrenamiento y la autoridad individual reaccionan a bloque,
intensidad, calidad y mejora personal. Felicidad es la media de relación con
compañeros, tiempo de juego, entrenamiento y resultados. Tiempo de juego y
resultados están modelados pero pendientes de conexión al flujo de partidos.

El riesgo de lesión, la influencia de vestuario y el riesgo de conflicto están
encapsulados. Se muestra el nivel de riesgo de lesión, pero no se generan lesiones
ni eventos narrativos hasta que existan esos sistemas.

## Tutorial de planificación

La primera entrada en Entrenamiento durante el onboarding presenta un tour breve
de cinco pasos sobre semana, bloques, efectos, estado físico y avance temporal.
El paso actual y su finalización forman parte del estado serializable del
onboarding. Completar o saltar el tour no selecciona consignas, no ejecuta una
sesión y no avanza el calendario: solo deja visible el objetivo contextual de
preparar el primer entrenamiento. La ayuda general posterior es consultable sin
volver a iniciar automáticamente el tour.

## Vista de planificación

La vista del campo nocturno usa tarjetas compactas y transparentes. Los dos
entrenamientos del microciclo abren los mismos controles de planificación;
el tercer bloque informa del próximo partido real del calendario, sin crear
otra sesión. El tutorial abre el editor cuando señala bloques y efectos, y la
validación de CONTINUAR muestra la sesión pendiente de guardar.

Las tarjetas de entrenamientos realizados solo aparecen tras completarlos.
Muestran asistencia, calidad, riesgo y las etiquetas de estado físico y carga
conservadas en el resultado, sin sustituirlas por el estado actual de la plantilla.
Sus informes desplegables conservan todos los efectos y la instantánea táctica.
Destacados resume la última sesión completada. Jugadores a vigilar mantiene la
lista completa y el acceso a PlayerDetail. No se modifica la resolución ni el
avance temporal.
