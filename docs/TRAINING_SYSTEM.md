# Sistema de entrenamiento

La fuente ejecutable está en `src/domain/trainingEngine.ts`, `trainingBalance.ts`,
`trainingPersonality.ts`, `trainingSessionResolver.ts` y `trainingTypes.ts`. La
pantalla de Entrenamiento solo planifica y consulta resultados. La resolución se
produce al alcanzar el checkpoint temporal y se representa en una escena aparte.

## Planificación, resolución y resultado

Cada sesión distingue la planificación (`TrainingSessionPlan` y previsiones), el
resultado persistente (`SessionResult`) y sus eventos tipados. Antes del checkpoint
no existe resultado. `resolveTrainingSession` resuelve una sola vez asistencia y
Staff reales, incidencias, calidad y efectos; una sesión ya resuelta se devuelve
sin nuevas tiradas.

Las fases visuales de llegada, bloques, incidencias y resumen se derivan del
resultado. El índice de fase pertenece a React y no se persiste como hecho de la
partida.

La disponibilidad prevista se presenta al inicio y no se clasifica como
incidencia. Las incidencias quedan reservadas para hechos que alteran la sesión
(lesión, molestias, falta excepcional sin avisar); el rendimiento cotidiano,
los retrasos leves y los comentarios del Staff son observaciones. Una sesión
normal puede terminar sin incidencias. Tras la primera sesión se muestra el plan
guardado para la segunda y se permite mantenerlo o abrirlo para modificarlo.
`PLANNED` sigue siendo editable; solo `COMPLETED` es inmutable.

Los valores humanos y físicos se conservan numéricamente en dominio, pero la UI
los presenta mediante escalas cualitativas compartidas. La autoridad representa
la percepción general del entrenador; el estado individual se expresa como
relación con el entrenador, no como un porcentaje de autoridad personal.

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
