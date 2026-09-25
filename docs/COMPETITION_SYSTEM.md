# Competición y actas

## Presentación

Clasificación, Resultados, Goleadores y Próximo partido comparten una superficie
clara, cabeceras rojas, tinta azul marino y emblemas SVG de los equipos del juego.
El estilo se limita al contenido de estas pantallas y del acta; no cambia el
header ni la navegación global. Los emblemas son identificadores gráficos del
juego, no escudos oficiales. Las fichas reutilizan el campo ilustrado existente.

La temporada procede de las fechas del calendario. Los datos de competición son
informativos: la beta solo tiene una liga, sin selectores de categorías ficticias.
Resultados permite recorrer las 22 jornadas, abrir fichas pendientes y consultar
actas terminadas. Los amistosos tienen su propio filtro, conservado al navegar.
Clasificación y Goleadores se limitan a jornadas disputadas; antes del debut se
muestran la tabla inicial y el estado vacío de goleadores. Los partidos pendientes
muestran fecha y hora, nunca un falso resultado de 0–0.

Los cálculos existentes de puntos, desempates, forma reciente y goles siguen en
`leagueStandings.ts` y `leagueScorers.ts`. No se inventan partidos jugados ni
promedios individuales para rivales sin un historial de participación completo.
La convocatoria conserva elegibilidad, anuncio y efectos humanos; su calidad se
presenta con estrellas y su forma con las etiquetas cualitativas compartidas.

## Archivo del partido

`MatchTeamState.initialLineup` captura formación, puestos, titulares y banquillo
al crear el encuentro. Los cambios durante el partido no modifican esa copia.
`MatchPlayer.shirtNumber` conserva el dorsal cuando existe en la plantilla.

Al confirmar el final, `applyPostMatch` añade una única acta a
`GameState.matchReports[matchId]` mediante `createMatchReport`. Es una instantánea
serializable y separada de React que contiene:

- Participantes y condición de titular/suplente al inicio, posiciones y minutos.
- Goles con identidad real del jugador del motor, minuto y marcador progresivo.
- Incidencias individuales de gol, tarjetas y entrada/salida del campo.
- Todos los pares de sustitución, incluidas las reentradas.
- Estadísticas objetivas y nombre del entrenador del club cuando está registrado.

No copia atributos, factores humanos ni estado mutable de entrenamiento. El
archivo se conserva al avanzar o iniciar otro encuentro. La hidratación admite
partidas antiguas sin `matchReports`; los partidos activos antiguos pueden
recuperar titulares a partir del primer cambio de cada jugador, sin confundir
reentradas con suplencia inicial.

El botón «Ver acta» del resumen final confirma las consecuencias y abre el acta.
Su botón «Continuar» invoca la acción temporal común hacia el siguiente checkpoint.
También se accede desde Resultados y desde «Acta del último partido» en Próximo
partido, incluso cuando no quedan encuentros programados. Consultar el archivo
no aplica efectos ni vuelve a procesar el encuentro.

## Límites actuales

Los resultados previos y los partidos rivales resueltos en segundo plano conservan
solo marcador y eventos de gol. Su acta muestra esos hechos y explica la ausencia
de detalle; no fabrica alineaciones, tarjetas, dorsales, staff ni árbitros.
La generación de identidades rivales y el motor no cambian en esta tarea.

El archivo dura lo que la partida actual: todavía no existe guardado a disco.
No se implementan designaciones arbitrales, nuevas estadísticas ni otras secciones
de las capturas de referencia. Sanciones conserva su implementación anterior.

## Verificación

`tests/matchReports.test.mjs` comprueba local/visitante, reentradas, titulares,
identidad real de los goles rivales, serialización, compatibilidad, ausencia de
mutaciones y aplicación única de las consecuencias. La revisión de UI incluye
final → acta → continuar → reabrir, filtros, jornadas futuras y tamaños de
1920×1080, 1366×768, 1024×768 y 390×844.
