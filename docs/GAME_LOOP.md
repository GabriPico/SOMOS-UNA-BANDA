# Ciclo temporal de la partida

Entrenamiento es un planificador, no el lugar donde se ejecutan sesiones. Cuando
`CONTINUAR` alcanza un checkpoint `TRAINING`, el dominio resuelve la sesión una
vez y abre `TrainingSessionEventScreen`. Su resumen final libera el checkpoint y
la siguiente pulsación continúa hasta el próximo acontecimiento cronológico.

La presentación de plantilla incluye las primeras palabras del entrenador en el vestuario. La elección añade evidencia moderada a su perfil emergente y unas pocas reacciones narrativas; queda completada con la escena de plantilla y no se repite.

La nueva partida comienza el 25 de agosto, en pretemporada. Tras la conversación con Manolo, el onboarding persistible enlaza Staff, Táctica, plantilla, Estado del vestuario, Buzón y la planificación de las dos sesiones sin obligar a volver al Panel. Después, la acción común `CONTINUAR` alcanza los entrenamientos reales del martes y jueves y la previa del primer amistoso. Cada pantalla ya presentada sigue disponible desde la navegación.

Los hitos de onboarding viven en `GameState.onboarding`. Las escenas solo se reproducen una vez y las actividades usan el estado normal: once, familiaridad, asistencia, carga y partidos no tienen una variante tutorial. El primer entrenamiento activa ayuda contextual; el segundo reutiliza el mismo sistema sin esa guía.

`getNextPendingGameEvent` centraliza la atención inmediata: onboarding, planificación incompleta, mensajes `REQUIRES_ATTENTION` y checkpoints temporales. Los mensajes normales no bloquean. Tras resolver una sesión, el resultado y los informes generados se guardan en `GameState`; la segunda sesión continúa editable hasta su propio checkpoint.

El calendario distingue `LEAGUE` y `FRIENDLY`. Los amistosos usan el motor y el postpartido normales para carga y efectos humanos moderados, pero se excluyen de jornada, clasificación, goleadores oficiales y resolución de los demás partidos de liga.

El reloj persistible vive en `GameState.temporal`. Contiene la fecha y hora actual, el calendario oficial, eventos, conversaciones pendientes, el checkpoint activo y los meses de cuotas ya procesados.

`findNextCheckpoint` reúne los entrenamientos todavía no realizados, eventos fechados, conversaciones pendientes y el primer partido oficial sin jugar. Ordena por instante y nunca ofrece un punto posterior al siguiente partido. `advanceGame` procesa los efectos automáticos hasta ese instante y devuelve el nuevo estado junto con el checkpoint que recupera el control del jugador.

El avance no depende de navegar al Panel. Una acción contextual común de
`CONTINUAR` puede invocarse al cerrar un entrenamiento, una conversación temporal
o una futura escena y enruta directamente el checkpoint devuelto. El Panel sigue
siendo accesible libremente y utiliza la misma acción.

Las escenas pueden declarar un flujo de finalización `RETURN` o `CONTINUE`. Esto
prepara destinos posteriores configurables —incluida la introducción— sin
implementar todavía la conexión narrativa con el primer entrenamiento.

Los entrenamientos ordinarios son martes y jueves a las 19:30. Al alcanzar uno se resuelve la disponibilidad determinista del Staff y se guarda en la sesión. `trainingEngine` recibe esos miembros presentes; no consulta datos mock ni concede impacto a ausentes.

Las solicitudes de búsqueda conservan fecha de petición y resolución. Cuando vence el plazo, se seleccionan los candidatos compatibles ya existentes y se genera una conversación obligatoria con Manolo. Las cuotas se revisan al entrar en un mes todavía no procesado; los pagos normales y los pocos retrasos se resuelven con la semilla de partida.

La previa (`PRE_MATCH`) bloquea el avance hasta jugar el encuentro. En Liga, `getNextPendingGameEvent` dirige primero a la convocatoria si todavía no está anunciada. La convocatoria guarda de 11 a 18 jugadores, historial y consecuencias humanas; después Tácticas y el motor solo reciben ese conjunto. Los amistosos conservan la plantilla abierta y admiten jugadores a prueba. `JUGAR PARTIDO` crea el estado persistible del encuentro y abre una reproducción incremental con descanso, intervenciones y final. Al confirmar el postpartido se actualizan calendario, liga, jugadores y vestuario, se prepara la semana siguiente y el motor temporal puede volver a encontrar el entrenamiento del martes.

Quedan preparadas las categorías de evento, el origen narrativo y los identificadores relacionados para futuras lesiones, tratamientos, incidencias logísticas y conversaciones contextuales. No hay generador diario de anécdotas.
