# SOMOS UNA BANDA

## Contexto

Simulador minimalista de entrenador de fútbol modesto ambientado en la 4a
Catalana. La beta plantea una temporada, una liga de 12 equipos, objetivo de
ascenso y una plantilla inicial de 20 jugadores de nivel aproximado de media
tabla.

El fútbol amateur, los atributos deportivos y los factores humanos deben tener
consecuencias visibles. La preparación táctica, el entrenamiento, el estado
físico, la felicidad y la autoridad forman parte del núcleo jugable.

El despido del entrenador, el motor completo de partido y la temporada completa
están planificados, pero todavía no están implementados por completo.

La interfaz es deliberadamente sencilla. El usuario la diseña progresivamente:
no rediseñar pantallas completas por iniciativa propia y preferir cambios
incrementales coherentes con el estilo existente.

## Stack actual

- React 19, TypeScript y Vite.
- CSS simple, sin librería de UI.
- Sin React Router; navegación propia mediante estado en `App.tsx`.
- Sin backend ni Tauri.
- Parte de los datos siguen siendo mock, pero ya existe lógica funcional de
  dominio para jugadores, Tácticas y Entrenamiento.
- El estado dinámico de entrenamiento vive actualmente en `App.tsx`.
- Todavía no existe persistencia real a disco.
- No añadir dependencias sin justificar su necesidad.

## Arquitectura y convenciones

- El motor de partido resuelve acciones mediante atributos individuales y contexto futbolístico; no mediante una comparación única de medias ni modificadores humanos globales.
- La velocidad, el cronómetro y la pausa visual del partido nunca deben alterar la simulación determinista ni actuar como fuente de verdad temporal.
- Cada gol es una interrupción automática del partido: se presenta una vez, ofrece mantener o modificar mediante el workspace táctico existente y conserva su estado serializable hasta reanudar.
- `TacticsScreen` y la intervención de partido deben reutilizar el mismo workspace táctico y las mismas operaciones de alineación.

- `src/domain` contiene modelos y lógica independiente de React.
- `src/data` contiene datos mock y datos iniciales.
- `src/screens` compone pantallas.
- `src/components` contiene UI reutilizable.
- No incrustar lógica de dominio ni cálculos importantes dentro de componentes
  React.
- La aleatoriedad debe poder reproducirse mediante semilla.
- Mantener una única fuente de verdad para cada dato; evitar estados derivados
  duplicados.
- Los valores derivados deben calcularse a partir del estado base cuando sea
  posible.
- Preservar compatibilidad con el estado existente al ampliar modelos.

### Conversaciones y escenas

- Las escenas viven como datos o funciones fuera de React y forman grafos de nodos tipados.
- La UI de conversaciones representa el nodo actual y lanza acciones; no codificar secuencias mediante cadenas de pasos o `if` dentro del componente.
- Los efectos persistentes de una escena actualizan el estado de partida. Una escena completada no debe reiniciarse al navegar.
- Los personajes recurrentes se definen una sola vez con identificadores estables.
- El onboarding forma parte del `GameState` y de la pretemporada real; no debe implementarse como un modo tutorial paralelo.

### Economía deportiva

- El presupuesto deportivo mensual es una caja común para entrenador, staff y jugadores; no pertenece a `StaffState`.
- Las cuotas de jugadores pertenecen a las finanzas del club y nunca aumentan el presupuesto deportivo controlado por el entrenador.
- Los planes de cuota y las compensaciones a jugadores viven en las finanzas de la partida. El presupuesto deportivo solo contabiliza compensaciones financiadas desde ese presupuesto; no inferirlas de la cuota.
- Los resúmenes económicos se derivan mediante lógica de dominio; no duplicar gastos calculados en el estado ni en React.

### Entrenamiento

La lógica principal de entrenamiento está separada de React y actualmente se
encuentra principalmente en:

- `src/domain/trainingEngine.ts`
- `src/domain/trainingBalance.ts`
- `src/domain/trainingPersonality.ts`
- `src/domain/trainingTypes.ts`

Reglas de arquitectura:

- `trainingEngine.ts` procesa las sesiones y sus efectos.
- `trainingBalance.ts` es la fuente de verdad de las constantes numéricas de
  balance del entrenamiento.
- No duplicar constantes de balance en componentes, pantallas o datos mock.
- `trainingPersonality.ts` define las diferencias de comportamiento mediante
  modificadores; evitar cadenas grandes de `if/else` específicas para cada
  personalidad.
- Las pantallas deben representar el estado y lanzar acciones, no recalcular el
  sistema de entrenamiento por su cuenta.
- Una sesión ya realizada es inmutable.
- Los efectos de una sesión no deben volver a ejecutarse al navegar o
  rerenderizar.

Consultar `docs/TRAINING_SYSTEM.md` antes de modificar Entrenamiento, condición,
cansancio, progresión de atributos, familiaridad táctica, autoridad, felicidad o
personalidades.

## Reglas críticas del sistema de jugadores

- Atributos deportivos en escala 1–20; ningún atributo vale 0.
- Cada jugador tiene posición principal, posiciones secundarias, pierna hábil,
  arquetipo y posibles rasgos.
- `calculatePositionRating` calcula capacidad teórica sin familiaridad.
- `calculateTacticalRating` usa atributos efectivos y familiaridad para el puesto
  ocupado.
- La posición ocupada en Tácticas nunca modifica los atributos base, Calidad
  General ni posiciones naturales.
- Las ponderaciones viven únicamente en `src/domain/playerRatings.ts`.
- El grafo y las penalizaciones posicionales viven en
  `src/domain/positionFamiliarity.ts`.
- La Calidad General, la mejor posición y los ratings son valores derivados; no
  guardarlos como números editables o duplicados.
- La Calidad General y la calidad por posición se presentan al usuario mediante
  estrellas; Forma, Felicidad, Condición y Cansancio mediante etiquetas
  cualitativas. Los atributos deportivos 1–20 y las estadísticas objetivas de
  partido permanecen numéricos.
- Equipo y Tácticas reutilizan `src/components/PlayerDetail.tsx`.

### Atributos efectivos y entrenamiento

Un atributo puede tener:

- valor base permanente;
- bonus provisional de entrenamiento;
- progreso de consolidación.

El valor utilizado para rendimiento puede ser distinto del atributo base debido
a modificadores temporales.

No modificar directamente el atributo base para representar:

- una buena semana de entrenamiento;
- cansancio;
- mala condición física;
- jugar fuera de posición.

Las mejoras permanentes deben pasar por el sistema de consolidación.

### Porteros y juego aéreo

- Los jugadores de campo utilizan `alcanceAereo`.
- Los porteros utilizan `juegoAereoPortero`.
- No tratar ambos atributos como dos capacidades aéreas independientes para un
  portero.
- Un portero no debe entrenar ni utilizar `alcanceAereo` como equivalente a su
  juego aéreo.
- El bloque específico de portería solo se muestra si `POR` es posición natural.

### Convocatorias

- Los partidos oficiales de Liga requieren una convocatoria anunciada de 11 a 18 jugadores antes de poder comenzar.
- Solo los convocados pueden formar el once y el banquillo de un partido oficial.
- Los jugadores `TRIAL` pueden entrenar y jugar amistosos, pero no son elegibles para Liga.
- Lesión, sanción, indisponibilidad o falta de inscripción nunca cuentan como descarte técnico.
- Cada convocatoria conserva historial por partido. Las consecuencias humanas se aplican una sola vez al anunciarla y dependen del contexto individual.

Consultar `docs/PLAYER_SYSTEM.md` antes de cambiar jugadores, ratings,
generación, atributos, ficha o Tácticas.

## Reglas críticas del Entrenamiento

### Estructura semanal

- Hay 2 sesiones semanales.
- Cada sesión permite 2 bloques.
- `Completo`, `Lúdico` y `Descanso` ocupan la sesión completa.
- La intensidad es Baja, Media o Alta y pertenece a toda la sesión.
- `De mínimos` no es seleccionable.
- Con menos de 13 asistentes la sesión pasa a ser un entrenamiento De mínimos.
- Solo los jugadores asistentes reciben efectos individuales.

### Escalas

Usar internamente escala 0–100 para estados como:

- condición física;
- cansancio;
- felicidad y sus componentes;
- autoridad;
- calidad del entrenamiento;
- familiaridades tácticas;
- familiaridad de formación;
- familiaridad de balón parado.

Los atributos deportivos permanecen en escala 1–20.

Clampear los valores cuando corresponda.

### Progresión

- El entrenamiento puede generar bonus provisionales decimales en atributos.
- El bonus provisional máximo inicial es +2 por atributo.
- Un atributo efectivo nunca puede superar 20.
- Las mejoras provisionales pueden decaer si dejan de trabajarse.
- La continuidad favorece la consolidación.
- Los jugadores jóvenes consolidan mejoras con mayor facilidad.
- Los atributos altos son progresivamente más difíciles de mejorar.
- Los atributos permanentes no deben incrementarse directamente fuera del
  sistema de consolidación.

### Familiaridad táctica

La Familiaridad Táctica General se compone de:

- 80% instrucciones tácticas.
- 20% familiaridad con la formación.

Cada opción táctica concreta conserva su propia familiaridad y memoria histórica.

Las instrucciones se agrupan en:

- Ataque posicional.
- Transición ofensiva.
- Defensa posicional / presión.
- Transición defensiva.

`Perder tiempo` y `Ser agresivos` no tienen familiaridad propia.

La formación seleccionada durante una sesión es la formación que se entrena.
Una sesión realizada debe conservar una instantánea del planteamiento utilizado,
aunque posteriormente se modifique Tácticas.

### Balón parado

- Existe una única Familiaridad de Balón Parado.
- No separar familiaridad ofensiva y defensiva.
- Es independiente de la Familiaridad Táctica General.
- Puede decaer tras varias semanas sin trabajarse.

### Condición y cansancio

Condición física y cansancio son variables diferentes.

Un jugador puede estar:

- en buena condición pero cansado;
- descansado pero en mala condición.

La Resistencia reduce el cansancio generado por los entrenamientos.

Una baja condición y/o un cansancio elevado pueden generar penalizaciones
temporales sobre atributos físicos, sin modificar sus valores base.

### Felicidad

La felicidad individual se compone de:

- 25% relación con compañeros.
- 25% tiempo de juego.
- 25% satisfacción con entrenamientos.
- 25% resultados / dinámica del equipo.

La felicidad general es la media de las felicidades individuales.

No penalizar el componente de tiempo de juego por un partido en el que el
jugador no estaba disponible.

### Autoridad

- Cada jugador tiene un valor individual de autoridad/respetro hacia el
  entrenador.
- La Autoridad General deriva de los valores individuales.
- Las decisiones y entrenamientos pueden modificarla.
- Las respuestas dependen de la personalidad: una misma sesión no debe provocar
  necesariamente la misma reacción en todos los jugadores.

### Personalidades beta

Las personalidades iniciales son:

- Profesional
- Trabajador / Currante
- Ambicioso
- Competitivo
- Fiestero
- Vago
- Veterano
- Líder
- Sociable
- Individualista
- Caliente
- Pasota

Las personalidades deben modificar tendencias y sensibilidades, no funcionar
como reglas absolutas.

No asumir que una personalidad es simplemente buena o mala.

Los sistemas profundos de conflictos, influencia social, resultados y tiempo de
juego todavía están parcialmente preparados y no deben inventarse o ampliarse
fuera del alcance de una tarea.

## Fuentes de verdad de diseño

Consultar antes de realizar cambios relevantes:

- `docs/PLAYER_SYSTEM.md`: jugadores, atributos, ratings y posiciones.
- `docs/TRAINING_SYSTEM.md`: sistema de entrenamiento.
- `docs/DECISIONS.md`: decisiones acumuladas.
- `docs/GAME_DESIGN.md`: concepto y alcance del juego.
- `docs/ROADMAP.md`: estado de los hitos.

Si documentación y código parecen contradecirse:

1. revisar primero las decisiones más recientes;
2. no asumir una solución;
3. preservar el comportamiento existente cuando sea razonable;
4. documentar cualquier desviación necesaria.

## Principios de trabajo

- Priorizar una experiencia clara, realista, cercana y con humor.
- Mantener el contexto específico del fútbol amateur de 4a Catalana.
- Evitar complejidad no necesaria.
- No inventar requisitos.
- Mantener lógica comprobable y separada de la presentación.
- Preservar cambios realizados por el usuario.
- Limitar cada tarea estrictamente a su alcance.
- No hacer refactorizaciones masivas salvo que sean necesarias.
- No rediseñar pantallas por iniciativa propia.
- Los escenarios DEV deben reutilizar la lógica real de dominio, ser reproducibles y permanecer excluidos de producción.
- Registrar decisiones nuevas en `docs/DECISIONS.md`.
- Actualizar documentación específica cuando cambie un sistema de dominio.
- El avance temporal no depende de volver al Panel; cualquier actividad temporal
  completada debe poder invocar la acción común hacia el siguiente checkpoint.

## Verificación

Antes de terminar cambios de código:

- Ejecutar `npm run build`.
- Ejecutar `npm run lint`.
- Ejecutar `git diff --check`.
- Ejecutar los tests disponibles; actualmente no hay runner de tests
  configurado.
- Comprobar que no se ha introducido `Math.random()` u otra aleatoriedad no
  controlada en sistemas que deban ser reproducibles.
- Revisar que no se hayan duplicado constantes o cálculos de dominio en React.
- Resumir archivos modificados.
- Indicar decisiones tomadas que no estuvieran especificadas.
- Indicar qué partes quedan preparadas pero todavía no están activas.
