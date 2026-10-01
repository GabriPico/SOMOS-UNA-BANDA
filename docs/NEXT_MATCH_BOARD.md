# Próximo partido: el corcho del club

La pantalla amplía el pequeño corcho del Panel mediante materiales existentes:
marco de madera, corcho, hojas crema, líneas de libreta, chinchetas y cinta.
Toda la escritura y los emblemas son componentes vivos de React. No se generan
imágenes ni se añaden dependencias. El HUD y el teléfono siguen siendo globales.

## Archivos

- `src/components/CorkBoard.tsx` y `.css`: corcho, hoja, chincheta y cinta
  reutilizables; texturas SVG existentes de madera, corcho y grano.
- `src/components/NextMatchPapers.tsx`: partido, datos, rival, scouting,
  dinámica, jugadores a vigilar y debilidades.
- `src/components/NextMatchSquadSelection.tsx`: traslado de la sección original
  de convocatoria, conservando íntegramente su comportamiento.
- `src/components/NextMatchSquadPaper.tsx`: nota de convocatoria y hoja ampliada
  en un diálogo nativo, cerrable mediante botón o Escape.
- `src/presentation/nextMatchPaperPresentation.ts`: formato de fechas, hora,
  sede, competición y temporada a partir del encuentro real.
- `src/screens/NextMatchScreen.tsx` y `NextMatchBoard.css`: composición del
  corcho, acciones existentes y adaptación al espacio disponible.
- `src/components/AppShell.tsx`: excluye el escenario de campo únicamente
  para esta pantalla; conserva la cabecera.
- `docs/DECISIONS.md` y `docs/COMPETITION_SYSTEM.md`: decisión y presentación.

## Datos y comportamiento conservados

Se reutilizan `getNextMatch`, `getOpponentId`, `getOpponentStanding`,
`getRecentMatches`, `summarizeRecentForm`, `getPlayersToWatch`,
`getScoutedWeaknesses`, `getTeamName`, `calculateStandings`, `latestClubMatch`,
`fixtureDate` y `competitionSeason`. Los emblemas son los `TeamBadge` existentes.
No se fija ningún rival, resultado, formación, fecha ni sede de ejemplo.

La selección conserva elegibilidad, rango de 11 a 18, errores, anuncio único,
reacciones y bloqueo tras anunciar. Tácticas, Jugar, Panel y la última acta
mantienen sus callbacks y condiciones originales. El calendario, el motor y
los efectos humanos no cambian.

Para evitar scroll de página en escritorio, la convocatoria se amplía al pulsar
su hoja. Las notas con listas variables tienen scroll interno accesible. En
pantallas estrechas las hojas pasan a un flujo vertical. El pie reserva espacio
para Mensajes en escritorio.

## Verificación

- Diez estados a 1920×1080 y 1366×768: amistoso, liga pendiente, cinco jornadas
  disputadas, cambio de rival/fecha/sede y calendario sin partido pendiente.
  Las partidas disputadas usan el motor real con semilla y `applyPostMatch`.
- Comprobados datos derivados, emblemas, cobertura del corcho superior al 85%
  del área útil, hojas dentro del marco, ausencia de scroll de página y
  separación de Mensajes.
- Convocatoria: jugadores no elegibles, rechazo de diez convocados, anuncio de
  once, bloqueo posterior, reapertura, cierre y condición de Jugar.
- Responsive a 390×844 y 1024×768 sin desbordamiento horizontal.
- Aplicación completa en ambas resoluciones: acceso desde el Panel, apertura
  y cierre del teléfono, navegación a Tácticas y retorno al Panel.
- Sin errores de navegador; 133 tests, build y lint correctos. Continúa el
  aviso existente de bundle superior a 500 kB.

Los scripts, fixtures y capturas de QA están en `.next-match-qa.local`, ignorado
por Git y excluido de producción. No queda funcionalidad preparada sin activar.
