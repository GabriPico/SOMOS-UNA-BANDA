# SOMOS UNA BANDA

## Contexto

Simulador minimalista de entrenador de fútbol modesto ambientado en la 4a
Catalana. La beta plantea una temporada, una liga de 12 equipos, objetivo de
ascenso y una plantilla inicial de 20 jugadores de nivel aproximado de media
tabla. El fútbol amateur, los atributos deportivos y los factores humanos deben
tener consecuencias visibles. El despido del entrenador y la temporada completa
están planificados, no implementados todavía.

La interfaz es deliberadamente sencilla. El usuario la diseña progresivamente:
no rediseñar pantallas completas por iniciativa propia y preferir cambios
incrementales coherentes con el estilo existente.

## Stack actual

- React 19, TypeScript y Vite.
- CSS simple, sin librería de UI.
- Sin React Router; navegación propia mediante estado.
- Datos mock deterministas en esta fase.
- Sin backend ni Tauri.
- No añadir dependencias sin justificar su necesidad.

## Arquitectura y convenciones

- `src/domain` contiene modelos y lógica independiente de React.
- `src/data` contiene datos mock; la persistencia futura debe seguir separada.
- `src/screens` compone pantallas y `src/components` contiene UI reutilizable.
- No incrustar en React cálculos de ratings, generación o familiaridad posicional.
- La aleatoriedad debe poder reproducirse mediante semilla.
- La Calidad General, la mejor posición y los ratings son valores derivados; no
  guardarlos como números editables o duplicados.
- La posición de un slot táctico nunca modifica las posiciones naturales.
- Equipo y Tácticas reutilizan `src/components/PlayerDetail.tsx`.

## Reglas críticas del sistema de jugadores

- Atributos en escala 1–20; ningún atributo vale 0.
- Cada jugador tiene posición principal, posiciones secundarias, pierna hábil,
  arquetipo y posibles rasgos.
- `calculatePositionRating` calcula capacidad teórica sin familiaridad.
- `calculateTacticalRating` usa atributos efectivos y familiaridad para el puesto
  ocupado. No altera atributos base ni Calidad General.
- Las ponderaciones viven únicamente en `src/domain/playerRatings.ts`.
- El grafo y las penalizaciones posicionales viven en
  `src/domain/positionFamiliarity.ts`.
- El bloque de portería solo se muestra si `POR` es posición natural.

Consultar [docs/PLAYER_SYSTEM.md](docs/PLAYER_SYSTEM.md) antes de cambiar jugadores,
ratings, generación, ficha o Tácticas. Consultar
[docs/DECISIONS.md](docs/DECISIONS.md) para las decisiones acumuladas,
[docs/GAME_DESIGN.md](docs/GAME_DESIGN.md) para el alcance y
[docs/ROADMAP.md](docs/ROADMAP.md) para el estado de los hitos.

## Principios de trabajo

- Priorizar una experiencia clara, realista, cercana y con humor.
- Evitar complejidad no necesaria y no inventar requisitos.
- Mantener lógica comprobable y separada de la presentación.
- Preservar cambios del usuario y limitar cada tarea a su alcance.
- Registrar decisiones nuevas en `docs/DECISIONS.md`.

## Verificación

Antes de terminar cambios de código:

- Ejecutar `npm run build`.
- Ejecutar `npm run lint`.
- Ejecutar los tests disponibles; actualmente no hay runner de tests configurado.
- Resumir archivos modificados y decisiones no especificadas.
