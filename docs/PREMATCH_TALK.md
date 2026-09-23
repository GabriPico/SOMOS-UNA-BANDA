# Charla narrativa de vestuario

`JUGAR PARTIDO` conserva la previa táctica y abre una escena del motor narrativo
existente. Mientras se habla no hay `MatchState` ni avanza el calendario. El final
completa la charla y arranca el encuentro directamente, sin otra confirmación.

## Ritmo y decisiones

| Encuentro | Recorrido |
| --- | --- |
| Amistoso normal o primero | Entrada → contexto → plan opcional → salida |
| Debut y Liga corriente | Entrada → contexto → plan opcional → cierre breve → piña → grito |
| Importante | Entrada → contexto → posible informe → plan opcional → elección de arenga → reacción → piña → grito |
| Decisivo, semifinal o final | El recorrido importante, con una arenga de mayor duración narrativa |

La elección inicial representa la intención del entrenador. La siguiente permite
explicar brevemente el plan, delegarlo en el segundo presente, recordar solo lo
trabajado o no añadir indicaciones. Se decide una vez; no hay menús recurrentes de
«añadir algo más». Una charla sin explicación táctica también es una ruta válida.

El usuario es el entrenador. El POV oculta su figura incluso al recuperar runtimes
antiguos. Ningún nodo de charla lo representa hablando ni repite la elección como
diálogo de `MÍSTER`: se narra cómo transmite el mensaje y se observan las reacciones.
Los personajes visibles conservan identidad y renderer comunes.

## Contexto y preparación

`preMatchTalkContext.ts` congela el contexto al entrar: encuentro, calendario
disputado, clasificación real, resultados recientes, objetivo, expectativas,
preparación táctica, entrenamiento realizado y estados humanos de los convocados.

`getPrematchClosing` distingue salida, ritual y arenga. Los amistosos salen sin
grito destacado. Liga tiene ritual; rival directo, derbi, mala racha, presión por
objetivos, ascenso, clasificación a playoff, eliminatorias y última jornada con
algo importante en juego activan la arenga. Una buena racha o un rival flojo no
convierten por sí solos el encuentro en extraordinario. Los criterios de ascenso,
rival directo y partido decisivo siguen usando la clasificación existente.

El repaso reutiliza `getPrematchTopics` para seleccionar hasta dos referencias
tácticas relevantes. No introduce decisiones ni cálculos tácticos en React.
La opción de recordar entrenamiento solo existe si sesiones completadas acreditan
el trabajo de las instrucciones actuales. Sesiones pendientes o de mínimos no
cuentan. Se conservan las referencias al día trabajado y los cambios de formación.
Hablar no modifica alineación, instrucciones, familiaridad ni atributos.

## Segundo e información rival

El segundo no interviene de oficio en charlas rutinarias. Puede explicar el plan
si se le cede la palabra o aportar scouting cuando existe una referencia útil.
Siempre habla al vestuario, sin convertir la reunión en una conversación privada.

La claridad del plan usa conocimiento futbolístico y organización del Staff,
independientes de cuánto conozca al rival. Una exposición menos clara es más larga;
el veterano sintetiza y un segundo con buena relación con el grupo conecta mejor.
La voz, las capacidades y la presencia se obtienen del personaje real.

Una ficha mock no acredita scouting. `knowledge` ausente equivale a `LIMITED`.
Se exige `OBSERVED`, segundo presente, una observación concreta y una razón:
preparación explícita, conocimiento personal, partido anterior o encuentro importante.
Amistosos y rivales claramente flojos no generan informes. Los resultados públicos
no permiten inventar debilidades ni se leen atributos ocultos.

Si hay informe, se ofrece escucharlo antes del plan o centrarse en el propio equipo.
Tras escucharlo se puede dar peso a una ventaja compatible con el plan, mantener
el foco propio, observar primero o pedir detalle una sola vez. La fiabilidad limita
la información a una o dos referencias. No se cambian instrucciones silenciosamente.

## Arenga y reacción

Los partidos relevantes ofrecen cuatro intenciones finales: exigir un paso adelante,
quitar presión, utilizar al rival para picar al grupo o transmitir confianza. Después
se muestra una narración contextual, posibles señales de atención y reacción del grupo.
La final, semifinal y última jornada decisiva tienen textos y duración propios.

Las intenciones alimentan las seis emociones existentes: motivación, concentración,
confianza, nervios, tensión e implicación. La personalidad, confianza previa,
felicidad, autoridad y relación individuales cambian la recepción. Exigir puede
activar a un competitivo y tensar a un inseguro; quitar presión puede dejar frío
a quien quería competir con intensidad. Un mensaje de confianza tiene menos peso
si el entrenador carece de credibilidad.

La reacción de la arenga compara emociones justo antes/después de esa decisión
mediante `getPrematchTalkEmotions`; no simula otro resultado ni guarda puntuaciones
duplicadas. Los umbrales y ponderaciones están en `preMatchTalkBalance.ts`.
La UI recibe narraciones cualitativas, sin números ni indicadores de éxito.

La piña utiliza la etiqueta de cohesión común: anticipación con cohesión alta,
agrupación normal o entusiasmo desigual con cohesión baja. Una recepción muy
favorable o negativa tiene prioridad narrativa. Puede citarse una reacción
individual, sin convertir la personalidad en una regla absoluta.

## Capitán y grito

El capitán se obtiene de `initialDressingRoomState.players`, la misma fuente de
roles sociales usada en Vestuario, inyectada al construir el contexto. Solo puede
iniciar el ritual si está convocado y disponible. Se comprueban lesión, sanción
y registros de indisponibilidad mediante el sistema existente de elegibilidad.
Si falta, se busca al segundo capitán, influencia de líder, personalidad Líder o
influencia alta. Sin un candidato se representa una acción grupal. No se crea
otra capitanía ni se pide una decisión adicional.

La secuencia utiliza dos nodos `GROUP_CALL` del motor de cinemáticas:

1. `¡UNA, DOS Y TRES...!` durante 1,1 segundos.
2. `¡¡${teamName.toLocaleUpperCase('es-ES')}!!` durante 1,5 segundos.

`teamName` se captura de la fuente de equipos, no se escribe el nombre en el guion.
El mismo nombre llega al equipo del partido. Las charlas antiguas sin ese campo
usan los datos del club como respaldo. El texto aparece centrado, grande y con
una respuesta grupal destacada; las preferencias de movimiento reducido desactivan
la animación. No hay modal adicional ni sonido grabado nuevo.

Al terminar la respuesta se registra `closing`/`chant` y se pasa al campo. El grito
es presentación: su pausa no altera atención, emociones, semilla o tiempo simulado.

## Atención, efectos y continuidad

La duración se deriva de los beats del contexto, informe, plan y arenga. Leer despacio,
hacer clic o cambiar de pantalla no añade tiempo. Observar una reacción tampoco.
La tolerancia depende de personalidad, autoridad, relación, felicidad, cohesión e
importancia. Las señales de distracción o impaciencia no se repiten y nunca se
convierten en un minijuego explícito.

Los efectos emocionales se limitan a ±4 y solo afectan al jugador durante el partido,
con un peso pequeño en acciones individuales. Se desvanecen durante sus primeros
30 minutos disputados. No cambian atributos deportivos, autoridad ni felicidad
permanentes y no se añade un multiplicador global al equipo.

`preMatchPreparations[matchId].talk` conserva instantánea, beats y finalización;
`narrativeRuntimes` conserva nodo y personajes. Las decisiones se registran antes
de narrarse y los efectos son idempotentes. Reabrir o serializar durante una arenga,
piña o grito retoma el nodo pendiente. La pausa del nodo visual vuelve a comenzar,
sin repetir efectos. La versión 3 conserva beats antiguos y abandona nodos retirados:
retoma el repaso opcional o el cierre pendiente. Una charla ya cerrada va al final.

El arranque sigue comprobando convocatoria, elegibilidad, once y portero natural.
Una charla oficial nueva no puede completarse antes de terminar el grito. El
inicio del partido es idempotente y no ocurre durante una decisión o espera visual.

## Archivos y verificación

- `preMatchTalkContext.ts`, `preMatchTalkTypes.ts`: instantánea, presencia, líder y nombre.
- `preMatchTalk.ts`, `preMatchTalkBalance.ts`, `preMatchTalkTopics.ts`: cierre, efectos,
  atención y selección de referencias del plan.
- `preMatchTalkLines.ts`, `preMatchTalkPresentation.ts`, `preMatchTalkScene.ts`: opciones,
  narraciones, reacciones y grafo común.
- `narrative.ts`, `NarrativePlayer.tsx` y su CSS: presentación automática del grito.
- `App.tsx`, `preMatchFlow.ts`: fuentes de identidad y continuidad con el partido.
- `src/dev/preMatchTalkScenarios.ts`: 44 escenarios, incluidos los 20 casos solicitados.
- `tests/preMatchTalk.test.mjs`: recorridos, efectos, estados humanos, scouting,
  identidades, renderizado, compatibilidad, reanudación y determinismo.

DEV crea condiciones iniciales reproducibles y recorre las funciones reales. Los
escenarios de arenga elegida se detienen en la reacción; los de cohesión, capitán
y nombre, antes de la piña. La ruta larga escucha el informe, pide detalle y cede
el plan a un segundo menos claro. No fuerza una puntuación de éxito ni un estado
emocional de salida. Los escenarios quedan excluidos de producción.

Siguen preparados los campos de derbi y ronda de playoff, sin asignación automática
de rivalidades ni generación de eliminatorias. Tampoco se añade scouting completo,
conflictos profundos, selección editable de capitán o guardado real a disco.
