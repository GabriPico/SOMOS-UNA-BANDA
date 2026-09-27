# Rediseño global del club — 26/09/2026

Implementado sobre el estado y las acciones existentes. Este documento recoge los archivos y decisiones de esta entrega, sin atribuirle los cambios de dominio que ya estaban en el árbol de trabajo.

## Sistema compartido

- `src/styles/themeTokens.css`, `clubMaterialTokens.css`: crema, navy y acentos apagados. Bahnschrift (ya disponible), con Arial Narrow/Segoe UI de respaldo, evita una descarga y nuevas dependencias.
- `src/components/ClubUi.tsx`: PageTitle, Card, PrimaryButton y ScreenPreviewCard. Las tarjetas interactivas comparten la clase club-interactive-card.
- Se reutilizan SectionHeader, PlayerSection, CompactIndicator, AlertItem y StatusBar de PlayerUi. Los estados humanos conservan etiquetas y barras aproximadas.
- `src/styles/screenHeaders.css`, `clubUi.css`: títulos, superficies, foco, controles y ambiente nocturno comunes.
- `src/components/MiniTacticalBoard.tsx`: la misma miniatura de formación en Panel y Entrenamientos.
- `src/components/ClubEnvironment.tsx`: fondo de localización y miniatura, con imagen de respaldo si falla una carga.

## Pantallas y archivos

- `src/App.tsx`, `src/components/AppShell.tsx`, `src/App.css`, `src/main.tsx`: integración global del ambiente y materiales; teléfono superpuesto conservado. Se corrigieron claves React repetidas de los hermanos del modo DEV.
- `src/screens/ClubPanelScreen.tsx/.css`, `src/presentation/clubPanelPresentation.ts`: siete accesos completos, miniaturas con datos reales, resumen compacto, pendientes, teléfono y continuar. Se conservan los selectores y acciones del tutorial.
- `src/screens/StaffScreen.tsx/.css`: lista variable, detalle/despido y conversación existentes; presidente y presupuesto próximos, Sito con su detalle existente. El dominio no define una capacidad de plantilla del staff: no se inventa un número de vacantes ni una plaza obligatoria de portero.
- `src/screens/TrainingScreen.tsx/.css`: materiales crema, seis indicadores, táctica y microciclo; conserva planificación, guardado, ejecución, informes, desplegables y ficha de jugador.
- `src/screens/TeamScreen.tsx`, `src/styles/clubSquad.css`, `clubPlayerFile.css`: título, filtros y papel; tabla y ficha mantienen todos sus datos.
- `src/screens/DressingRoomScreen.tsx/.css`, `src/styles/clubScenes.css`: fondo sincronizado, bloques con jerarquía e información previa conservada.
- `src/screens/TacticsScreen.tsx`: título común; pizarra y workspace existentes.
- `src/components/CompetitionHeader.tsx`, `MatchFixtureHeader.tsx`, `TeamBadge.tsx`, `src/styles/competition.css`, `src/screens/NextMatchScreen.tsx/.css`, `ResultsScreen.tsx`, `ScorersScreen.tsx`, `MatchReportScreen.tsx`, `SanctionsScreen.tsx`: misma familia gráfica para liga, previa y actas.
- `src/screens/PlayerProfileScreen.tsx`, `PreMatchScreen.tsx`, `FriendlyCallUpScreen.tsx`, `MatchScreen.tsx`: títulos comunes. La previa oculta el título del workspace táctico embebido para evitar duplicarlo.
- `src/dev/devScenarios.ts`: escenarios reproducibles de luz de día (07:00) y noche (19:30), excluidos del build de producción.
- `src/styles/gameUi.css`: retirados estilos del dashboard anterior y superficies globales que tapaban los escenarios.

## Día y noche

`src/presentation/environment.ts` interpreta la hora civil de `GameState.temporal.currentDateTime`. Día de 07:00 a 19:29; noche de 19:30 a 06:59. No consulta el reloj del equipo, la zona horaria del navegador ni temporizadores. AppShell y las miniaturas reciben ese modo. La UI nocturna sigue siendo crema, más cálida, con sombra algo más marcada.

`src/data/clubEnvironments.ts` centraliza las parejas, sus respaldos y la asignación de pantalla a localización. Panel y clasificación comparten despacho; previa y acta comparten campo; perfil y plantilla comparten zona del entrenador. Tácticas conserva su escenario de pizarra, con los mismos tokens nocturnos.

## Assets

Las cinco parejas están disponibles: despacho, plantilla, campo, vestuario y staff. No quedan rutas pendientes ni placeholders de fondo.

Se conservan como variantes de día el despacho ilustrado, el contexto de la plantilla y el vestuario existentes; se conserva el campo nocturno existente. Assets añadidos en `public/assets/materials/`:

- `club-office-night.png`
- `squad-night.png`
- `training-day.png`
- `locker-room-night.png`
- `staff-day.png`
- `staff-night.png`

Generados con la skill imagegen y la herramienta de imágenes integrada. Instrucción común de las ediciones: conservar cámara, encuadre, proporción, arquitectura y objetos; cambiar solo iluminación, exterior y luces; sin personas nuevas, texto, carteles, logos ni lemas. El staff se creó como oficina/almacén municipal modesto, con escritorio viejo, archivo, tablero táctico sin texto y material deportivo. Su noche se editó a partir de su día. Son escenas ambientales, sin datos de juego incrustados.

## Estado y comportamiento

No cambian motores de entrenamiento/partido, atributos, convocatorias, finanzas, presupuestos, eventos o conversaciones. El Panel ahora lee la cohesión de la partida (antes leía la inicial), y deriva los pendientes de respuestas, sesiones por preparar/revisar y convocatoria oficial. La lista de staff y el presupuesto siguen sus modelos reales. No se añade persistencia, llamadas jugables, acciones nuevas de Sito ni una ruta de Mensajes.

## Verificación

Pruebas nuevas en `tests/clubEnvironment.test.mjs`: límites horarios, parejas/respaldo existentes, cambios en los datos del hub sin mutación. Se ejecutan junto a las pruebas previas. La comprobación en navegador cubre las ocho áreas principales a 1366×768, 1600×900 y 1920×1080, navegación del hub, teléfono, interacciones existentes y variantes nocturnas.

Resultado: **129/129 tests**, `npm run build`, `npm run lint` y `git diff --check`
correctos. Navegador: 24 comprobaciones de pantalla/resolución, ocho áreas en
modo nocturno y las interacciones descritas; cero errores de consola en la pasada
final. Se conserva el aviso de Vite de bundle de más de 500 kB. El runner de
pruebas emitió avisos de puerto HMR compartido entre sus servidores Vite; no
provocaron fallos. No se han añadido dependencias ni aleatoriedad.
