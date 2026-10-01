# Diseño del juego

## Identidad

**Míster** es un simulador minimalista de entrenador de fútbol modesto
ambientado en la 4a Catalana. Su subtítulo, **Este año subimos**, expresa el
objetivo de ascenso que guía la temporada y las expectativas del entorno del club.

El tono debe ser realista, cercano y humorístico. La interfaz es funcional y
deliberadamente sencilla; evolucionará mediante cambios incrementales.

## Alcance de la beta

- Una temporada y liga de 12 equipos.
- Plantilla inicial de 20 jugadores y nivel aproximado de media tabla.
- Objetivo definitivo: ascender a 3a Catalana, directamente o mediante playoff.
- Ascender resuelve la beta como victoria; terminar la temporada sin ascender la resuelve como derrota.
- Fútbol amateur con factores deportivos y humanos.
- Autoridad, felicidad, cohesión, condición física y relación con el presidente.
- Posibilidad de fracaso y despido del entrenador.

**Estado:** la maqueta navegable, Equipo y Tácticas están implementados con datos
mock. La temporada completa, simulación con consecuencias, guardado, ascenso y
despido están planificados.

Las expectativas temporales del presidente sirven para evaluar la marcha del
equipo, pero no cambian la condición final de victoria o derrota.

La economía distingue el presupuesto deportivo que gestiona el entrenador, las
cuotas de temporada que administra el club y los gastos personales de cada
jugador. Un contacto externo de fisioterapia se paga normalmente por jugador y
sesión; no equivale a incorporar un fisio al Staff.

## Plantilla y jugadores

El modelo actual usa 18 atributos en escala 1–20, posiciones naturales múltiples,
pierna hábil, arquetipos y rasgos. La Calidad General es derivada; no es un dato
arbitrario. La especificación canónica está en [PLAYER_SYSTEM.md](PLAYER_SYSTEM.md).

## Flujo objetivo de una jornada

1. Consultar el estado del equipo y eventos.
2. Elegir alineación, formación e instrucciones.
3. Simular el partido.
4. Mostrar resultado y consecuencias.
5. Actualizar clasificación y estado humano.
6. Guardar la partida.

Este flujo completo está **planificado**; la navegación y la edición táctica son
actualmente una maqueta funcional.
