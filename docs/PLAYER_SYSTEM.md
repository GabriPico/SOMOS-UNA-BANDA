# Sistema de jugadores

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

Equipo muestra Pos, Nombre, Calidad General, Forma, PJ, G, Edad, Personalidad,
Felicidad e Ingresos para 20 jugadores. Al seleccionar una fila abre
`src/components/PlayerDetail.tsx`, compartido con Tácticas.

La ficha muestra datos personales, humanos y deportivos, Calidad General, mejor
posición, rating de posiciones naturales, perfil y atributos base. Los atributos
de portería se ocultan para jugadores de campo. Desde Tácticas puede añadir el
contexto del puesto actual sin reemplazar los atributos reales mostrados.

## Tácticas y rating actual

Las formaciones implementadas son 4-4-2, 4-3-3, 4-2-3-1, 3-5-2 y 5-4-1. Se
pueden intercambiar titulares y suplentes, y también dos slots del once.

Un suplente muestra Calidad General. Un titular muestra
`calculateTacticalRating(player, tacticalPosition)`, nunca un valor almacenado.
La ficha contextual muestra posición, rating, familiaridad y penalización.

Las instrucciones visibles son:

- Con balón: Mentalidad (Ofensiva/Equilibrada/Cauta), Estilo de pase (En
  corto/Mixto/Directo), Ritmo (Alto/Medio/Bajo) y Tras recuperación
  (Contraataque/Equilibrada/Mantener posición).
- Sin balón: Altura de presión (Alta/Media/Baja), Intensidad de presión
  (Alta/Media/Baja), Tras pérdida (Presión tras pérdida/Mixto/Repliegue), Perder
  tiempo (Sí/No) y Ser agresivos (Sí/No).

Actualmente son estado local de UI; no influyen todavía en un motor de partido.

## Familiaridad y atributos efectivos

`positionFamiliarity.ts` contiene un grafo bidireccional. Se toma la distancia
mínima desde cualquiera de las posiciones naturales:

- 0: `NATURAL`, penalización 0.
- 1: `RELATED`, penalización 1.
- 2: `UNFAMILIAR`, penalización 2.
- 3 o más: `VERY_UNFAMILIAR`, penalización 3.

Relaciones actuales: DFC–LD/LI/MCD; LD–CAD; LI–CAI; CAD–MD/ED; CAI–MI/EI;
MD–MC/ED; MI–MC/EI; MCD–MC; MC–MP; MP–DC/ED/EI; ED–DC; EI–DC. `POR` no tiene
aristas: cualquier cruce POR↔campo es `VERY_UNFAMILIAR`.

`getEffectiveAttributesForPosition` copia los atributos base y resta la
penalización únicamente a los atributos con peso positivo en la fórmula del slot,
con mínimo temporal 1. `calculateTacticalRating` aplica la fórmula normal a esa
copia. Ni los atributos base, ni las posiciones naturales, ni la Calidad General
cambian.

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
futuro motor de partido. La ficha abierta desde Entrenamiento muestra `↑` para
bonus menores que uno y `(+N)` desde el primer punto efectivo.

La consolidación puede elevar el atributo base al cerrar una semana. Para
porteros, el entrenamiento sustituye cualquier trabajo aéreo de campo por
`juegoAereoPortero`; nunca entrena `alcanceAereo` como equivalente.
