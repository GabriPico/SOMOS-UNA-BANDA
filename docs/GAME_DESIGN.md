# Diseño del juego

## Identidad

**SOMOS UNA BANDA** es un simulador minimalista de entrenador de fútbol modesto
ambientado en la 4a Catalana. “Banda” alude al grupo humano formado por plantilla,
cuerpo técnico, directiva y entorno del club.

El tono debe ser realista, cercano y humorístico. La interfaz es funcional y
deliberadamente sencilla; evolucionará mediante cambios incrementales.

## Alcance de la beta

- Una temporada y liga de 12 equipos.
- Plantilla inicial de 20 jugadores y nivel aproximado de media tabla.
- Objetivo deportivo: ascenso.
- Fútbol amateur con factores deportivos y humanos.
- Autoridad, felicidad, cohesión, condición física y relación con el presidente.
- Posibilidad de fracaso y despido del entrenador.

**Estado:** la maqueta navegable, Equipo y Tácticas están implementados con datos
mock. La temporada completa, simulación con consecuencias, guardado, ascenso y
despido están planificados.

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
