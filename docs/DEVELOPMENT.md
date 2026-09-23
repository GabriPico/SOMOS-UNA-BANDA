# Herramientas de desarrollo

## Menú de escenarios

Al ejecutar `npm run dev` aparece un acceso discreto `DEV` en la esquina superior derecha. El menú no se renderiza ni se incluye como recurso separado en la compilación de producción.

Cada escenario se reconstruye desde las factorías normales con una seed estable (`84731` por defecto). La seed puede cambiarse en el panel. `REINICIAR` vuelve a construir el escenario activo con la misma seed y descarta cualquier cambio realizado durante la prueba.

Los escenarios posteriores a la introducción completan la escena de Manolo, avanzan el calendario mediante `advanceGame` y, cuando corresponde, ejecutan las sesiones con `executeTrainingSession`. Los escenarios de partido crean el encuentro con `createMatchState` y recorren el motor paso a paso; sus minutos, eventos, estadísticas, observaciones y estados físicos no se escriben manualmente.

`Después de Manolo`, `Tour del Panel completado`, los objetivos de `Staff`, `Táctica` y `Equipo`, `Primer entrenamiento`, `Segundo entrenamiento` y `Primer amistoso` reconstruyen los hitos correspondientes del onboarding real. `Primer amistoso` está activo y prepara el encuentro `FRIENDLY`; `Jornada 1` parte de una pretemporada marcada como completada y abre la primera previa oficial.

## Añadir un escenario

Las charlas previas tienen 44 casos en `src/dev/preMatchTalkScenarios.ts`. El menú
incluye amistoso, debut y Liga normal, rival directo, derbi, mala racha, ascenso,
semifinal y final, cohesión y autoridad altas/bajas, arenga agresiva/tranquila,
recepción favorable/fría/negativa, capitán presente/ausente y nombre de equipo distinto.
Los casos de arenga elegida se detienen en su reacción; los de piña/capitán/nombre,
justo antes del ritual. Los otros empiezan al entrar al vestuario. `Charla · larga`
se detiene al perder atención tras escuchar el informe y delegar en un segundo
menos claro. Todos recorren los nodos y las consecuencias reales.

`npm test` ejecuta las pruebas disponibles, incluidas las de charla, restauración
de nodos, grito, elegibilidad y arranque determinista. La revisión visual manual
puede hacerse con los escenarios de piña, avanzando hasta el grito y comprobando
que no hay confirmación adicional antes del campo.

Los builders y el catálogo `DevScenarioDefinition[]` viven en `src/dev/devScenarios.ts`. Para añadir uno:

1. ampliar `DevScenarioId`;
2. componer un builder a partir de los helpers existentes o de funciones reales de dominio;
3. añadir su definición a `DEV_SCENARIOS`;
4. comprobar que dos construcciones con la misma seed producen el mismo estado serializado.

Los builders DEV pueden escoger condiciones iniciales útiles, pero no deben saltarse validaciones ni introducir reglas especiales una vez cargado el escenario. El estado de herramientas —escenario activo, panel y seed seleccionada— se mantiene fuera de `GameState`.

Los escenarios `Entrenamiento · primer acceso` y `Entrenamiento · tutorial
completado` abren directamente la planificación sin consignas seleccionadas. El
primero conserva el tour en su paso inicial; el segundo muestra directamente el
objetivo contextual posterior.
