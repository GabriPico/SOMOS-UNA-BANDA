# Herramientas de desarrollo

## Menú de escenarios

Al ejecutar `npm run dev` aparece un acceso discreto `DEV` en la esquina superior derecha. El menú no se renderiza ni se incluye como recurso separado en la compilación de producción.

Cada escenario se reconstruye desde las factorías normales con una seed estable (`84731` por defecto). La seed puede cambiarse en el panel. `REINICIAR` vuelve a construir el escenario activo con la misma seed y descarta cualquier cambio realizado durante la prueba.

Los escenarios posteriores a la introducción completan la escena de Manolo, avanzan el calendario mediante `advanceGame` y, cuando corresponde, ejecutan las sesiones con `executeTrainingSession`. Los escenarios de partido crean el encuentro con `createMatchState` y recorren el motor paso a paso; sus minutos, eventos, estadísticas, observaciones y estados físicos no se escriben manualmente.

`Después de Manolo`, `Staff`, `Táctica`, `Primer entrenamiento`, `Segundo entrenamiento` y `Primer amistoso` reconstruyen los hitos correspondientes del onboarding real. `Primer amistoso` está activo y prepara el encuentro `FRIENDLY`; `Jornada 1` parte de una pretemporada marcada como completada y abre la primera previa oficial.

## Añadir un escenario

Los builders y el catálogo `DevScenarioDefinition[]` viven en `src/dev/devScenarios.ts`. Para añadir uno:

1. ampliar `DevScenarioId`;
2. componer un builder a partir de los helpers existentes o de funciones reales de dominio;
3. añadir su definición a `DEV_SCENARIOS`;
4. comprobar que dos construcciones con la misma seed producen el mismo estado serializado.

Los builders DEV pueden escoger condiciones iniciales útiles, pero no deben saltarse validaciones ni introducir reglas especiales una vez cargado el escenario. El estado de herramientas —escenario activo, panel y seed seleccionada— se mantiene fuera de `GameState`.
