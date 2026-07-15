# Simulador FM 4a Catalana

## Objetivo

Crear un simulador minimalista de entrenador de fútbol modesto ambientado
en la 4a Catalana.

La versión beta cubre una única temporada.

## Principios

- Priorizar una experiencia jugable clara.
- Mantener un tono realista, cercano y humorístico.
- Las decisiones deben tener consecuencias visibles.
- Evitar sistemas innecesariamente complejos.
- No inventar requisitos que no estén documentados.
- Registrar las decisiones nuevas en docs/DECISIONS.md.

## Arquitectura

- React y TypeScript para la interfaz.
- El motor del juego debe estar separado de React.
- El código de src/domain no puede importar React.
- La lógica debe ser comprobable mediante tests.
- La aleatoriedad debe poder reproducirse mediante una semilla.
- La persistencia debe estar separada de la lógica del juego.

## Restricciones iniciales

- No crear backend.
- No añadir Tauri todavía.
- No añadir librerías sin justificar su necesidad.
- No implementar varias temporadas.
- No realizar grandes cambios visuales y del motor al mismo tiempo.

## Verificación

Antes de terminar una tarea:

- Ejecutar npm run build.
- Ejecutar los tests disponibles.
- Resumir los archivos modificados.
- Informar de cualquier decisión no especificada.