# Registro de decisiones

## Decisiones del flujo narrativo de entrenamiento

- Cada gol actualiza primero el marcador y abre una interrupción automática serializable. La UI presenta una celebración diferenciada, después ofrece mantener o entrar en la intervención táctica existente, y el evento se consume una sola vez al reanudar.

- Calidad General y calidad por posición permanecen como cálculos internos 0–100 y se presentan mediante una escala centralizada de 1–5 estrellas con medias estrellas. Los tooltips solo expresan estrellas.
- Forma, Felicidad, Condición, Cansancio y relación individual con el entrenador se muestran cualitativamente. Los atributos deportivos 1–20 y las estadísticas objetivas de partido siguen siendo numéricos.
- Cada jugador conserva en `PlayerSeasonStats` las valoraciones de los partidos en los que disputó minutos. Valoración media y Últimos 5 derivan del mismo histórico; no se reconstruyen valoraciones para apariciones anteriores sin registro.

- Los estados humanos, físicos y de familiaridad mantienen escala interna 0–100, pero se muestran principalmente mediante etiquetas cualitativas compartidas; la autoridad nunca se presenta como porcentaje.
- Las ausencias previstas pertenecen a la disponibilidad inicial. Una falta sin avisar parte de una probabilidad excepcional y solo aumenta con factores humanos o de personalidad ya modelados.
- `INCIDENCIAS` se reserva para hechos que alteran claramente la sesión. Observaciones rutinarias se narran aparte y una sesión sin incidencias es el resultado habitual válido.
- Tras completar la primera sesión se recuerda el plan de la segunda y se pregunta si se mantiene o modifica. `PLANNED` permanece editable y la resolución consume siempre sus valores actuales; solo `COMPLETED` queda bloqueada.

- La pantalla Entrenamiento solo edita planes y muestra resultados ya ocurridos. Nunca ejecuta una sesión.
- El checkpoint temporal resuelve asistencia y Staff reales, eventos y efectos mediante `resolveTrainingSession`; el resultado se guarda y no se recalcula al navegar.
- Previsiones y hechos reales permanecen separados. Las incidencias son una unión discriminada y una sesión sin incidencias es válida.
- La escena de sesión deriva cinco fases del resultado persistente. Su avance visual no forma parte de `GameState`.
- `GameState` conserva tanto `training` como `inboxMessages`; navegar, volver a abrir una sesión o cargar el mismo estado no vuelve a resolver efectos ni duplica informes.
- `getNextPendingGameEvent` prioriza onboarding, planificación incompleta y mensajes que requieren atención antes de delegar en el calendario. Un mensaje normal sin leer nunca bloquea `CONTINUAR`.
- El onboarding inicial enlaza Manolo, Staff, Táctica, plantilla, Estado del vestuario, Buzón y planificación de ambas sesiones. Tras la primera sesión muestra el informe y deja una parada para retocar la segunda.

## Decisiones de convocatoria

- Un partido de Liga exige una convocatoria anunciada de 11 a 18 jugadores. `PRE_MATCH` sigue siendo el checkpoint y `getNextPendingGameEvent` dirige a Próximo partido mientras falte la lista.
- La elegibilidad deriva del estado real: lesionado, sancionado, indisponible o `TRIAL` no son descartes técnicos. Los amistosos no aplican el límite oficial y mantienen disponibles los jugadores a prueba.
- `GameState.squadSelections` guarda la lista bloqueada por partido y `squadSelectionHistory` conserva un registro por jugador. Resolver de nuevo el mismo partido no reaplica reacciones ni mensajes.
- La reacción por descarte técnico combina uso previo, calidad, felicidad, autoridad, personalidad y racha de ausencias. Solo las reacciones relevantes producen un mensaje posterior.

## Decisiones de workspace táctico y sustituciones

- La posición ocupada se clasifica como preferida, compatible o improvisada. Preferida recibe solo un punto moderado en la valoración posicional; compatible no sufre penalización genérica; improvisada reduce únicamente atributos relevantes para el puesto.
- Las posiciones de banda son ampliamente intercambiables. Laterales, carrileros e interiores de ambos lados forman una familia compatible; ED/EI también pueden alternar extremo e interior. Las ponderaciones del puesto siguen produciendo medias diferentes.
- Táctica e intervención reutilizan `TacticalWorkspace`. Clic y drag & drop solicitan la misma operación de alineación y las validaciones futbolísticas permanecen en dominio.
- La propuesta del segundo entrenador es determinista y falible: combina conocimiento, observación, condición, perfil, seed e interés moderado por probar jugadores en pretemporada. Se previsualiza antes de aplicar.
- Liga y amistoso consultan una configuración única de sustituciones. Liga conserva tres interrupciones propias y ventana rival; el amistoso permite interrupciones libres y no ofrece esa ventana.
- La condición de partido se representa mediante cuatro segmentos y etiqueta accesible. Nota numérica, media posicional y ánimo permanecen separados.

## Decisiones de pretemporada y onboarding v1

- La partida empieza el 25 de agosto, antes de la Jornada 1. El onboarding es estado serializable de la partida y utiliza calendario, plantilla, entrenamientos, familiaridad y partidos reales.
- Manolo enlaza directamente con Staff, Táctica, plantilla, dos entrenamientos y el primer amistoso. El Panel permanece accesible, pero no es un paso obligatorio.
- La plantilla inicial distingue jugadores que continúan y jugadores `TRIAL`. Los jugadores a prueba entrenan, aparecen en Equipo y Táctica y pueden jugar amistosos; no tienen todavía cuota, compensación ni proceso de contratación.
- El calendario y el estado de partido distinguen `LEAGUE` y `FRIENDLY`. Un amistoso no da puntos, no avanza jornada, no resuelve otros resultados oficiales ni alimenta estadísticas y sanciones de liga.
- Las presentaciones consultan el Staff generado. La ausencia de segundo entrenador cambia el texto y nunca bloquea el flujo.

## Decisiones del motor de partido v1

- La reproducción visual solicita pasos incrementales al dominio. El cronómetro, la pausa y las velocidades Normal/Rápida nunca intervienen en la semilla ni cambian el resultado.
- La narración contextual interpreta acciones ya resueltas y no aumenta por sí misma tiros o goles. Eventos destacados y contexto tienen jerarquía visual diferente.
- Rendimiento, condición y ánimo conservan valores internos; sus etiquetas visibles son derivadas. El ánimo de partido no sobrescribe la felicidad persistente.
- El segundo entrenador muestra como máximo las observaciones actuales más relevantes, basadas en telemetría y sujetas a error, cooldown temático y disponibilidad real.
- El partido conserva un `MatchState` serializable y avanza mediante acciones deterministas hasta cortes lógicos; una intervención cambia solo el futuro.
- Las acciones se resuelven con atributos individuales y contexto de ruta/duelo. Las medias por posición quedan para selección y UI, no como resolución global.
- Formación e instrucciones existentes modifican ocupación, rutas, espacio, coberturas, volumen y coste físico; no conceden bonus fijos de ataque o defensa.
- Familiaridad, autoridad, felicidad, personalidad y cohesión alteran coordinación, adherencia, implicación, concentración y ayudas, sin modificar universalmente los atributos deportivos.
- El rival usa el mismo estado de equipo y marco de atributos mediante un adaptador determinista mientras su plantilla completa siga siendo simplificada.
- El resultado confirmado actualiza el calendario vivo y los eventos de gol vivos. Clasificación, Resultados y Goleadores derivan de esas mismas fuentes.
- El postpartido conecta minutos, goles, tarjetas, condición, cansancio, lesiones simples y cambios humanos moderados con la semana siguiente.

## Decisiones del ciclo semanal y calendario

- `CONTINUAR` avanza hasta el siguiente momento relevante, no un número fijo de días. Los días sin checkpoint se procesan sin devolver el control.
- El calendario oficial guardado en la partida es la fuente de verdad para fecha, jornada y próximo partido. La jornada deriva de partidos oficiales ya disputados.
- La semana ordinaria tiene entrenamientos el martes y el jueves a las 19:30. Cada sesión conserva identidad propia y solo se puede ejecutar al alcanzar su checkpoint.
- Los partidos se programan en sábado o domingo, con mayoría dominical y horarios deterministas apropiados para fútbol amateur.
- La disponibilidad del Staff se resuelve por actividad con semilla, fecha, disponibilidad, compromiso y fiabilidad. Solo los presentes aportan impacto; entrenar solo sigue siendo válido.
- Las solicitudes de Staff tardan entre dos y cinco días de forma determinista. Al resolverse crean una conversación pendiente con Manolo y no presentan candidatos silenciosamente.
- Los vencimientos de cuotas se procesan con el calendario del club, sin alimentar el presupuesto deportivo. La mayoría se paga automáticamente y los retrasos nuevos son minoritarios y reproducibles.
- Una conversación obligatoria y la previa de partido son checkpoints bloqueantes. El motor nunca avanza más allá de un partido oficial sin resolverlo.
- Los eventos temporales nacen principalmente del estado (solicitudes, cuotas y futuros sistemas médicos o de vestuario), no de una tirada diaria de anécdotas.

## Decisiones de cuotas, fisioterapia y conversaciones con Manolo

- Estado del vestuario muestra un resumen derivado de los mismos planes de cuota que Equipo: conteos generales, casos pendientes y presión actual de Manolo. No guarda un segundo estado ni muestra contabilidad del club.
- Los retrasos se clasifican como menores, relevantes o graves según vencimientos acumulados y decisiones explícitas existentes. Esta gravedad prepara recordatorios y conflictos, pero nunca bloquea automáticamente a un jugador.
- Los impagos son también un asunto social: en el futuro podrán afectar felicidad, cohesión, autoridad y relaciones. Los acuerdos conservan si son conocidos solo por el entrenador o también por el vestuario para no asumir conflictos públicos automáticos.
- En una plantilla normal de 4a Catalana lo habitual es que nadie cobre. La generación determinista produce aproximadamente un 92% de plantillas sin remunerados, un 7% con uno y un 1% con dos; las compensaciones son modestas, redondas y tienen contexto narrativo.
- Una exención o acuerdo especial es deliberadamente más frecuente que pagar a un jugador. Las diferencias conocidas por el grupo quedan preparadas como posible fuente de conflictos futuros.
- La cuota estándar es de 500 euros por temporada para todo jugador sujeto a cuota. Puede pagarse completa o a plazos; Equipo muestra estados narrativos como `Pagada`, `Al día` o los meses pendientes, no importes aportados.
- Las cuotas pertenecen a la economía general del club, controlada por Manolo, y nunca aumentan el presupuesto deportivo del entrenador. Este último solo paga entrenador, Staff y jugadores remunerados.
- Pueden existir acuerdos especiales, rebajas o exenciones. Los impagos no impiden jugar automáticamente: una restricción por deuda debe ser una decisión explícita futura del club o de Manolo.
- El plan de cuota conserva pagos y vencimientos pendientes, y queda preparado para aplazamientos, cambios de plazos, recordatorios, conflictos y negociación.
- Un contacto externo de fisioterapia presta sesiones a jugadores concretos. Normalmente cada jugador decide y paga su tratamiento; el gasto no consume presupuesto deportivo. Rechazo, alternativa, ayuda del club y recuperación sin tratamiento recomendado quedan modelados para el futuro.
- Un fisio permanente continúa siendo posible como miembro de Staff, pero es una incorporación excepcional y distinta de un contacto externo.
- `Hablar con Manolo` abre una `DialogueScene` contextual. Las opciones pueden depender del estado de partida y sustituyen el selector administrativo de candidatos.
- Pedir ayuda crea una solicitud de búsqueda pendiente; no presenta candidatos inmediatamente. La resolución por paso de días, el mensaje de Manolo y la presentación narrativa de candidatos quedan pendientes del ciclo semanal.
- Durante los primeros días Manolo permite hablar, pero corta peticiones de Staff hasta que se haya completado al menos un entrenamiento.

## Decisiones del sistema narrativo y nueva partida

- Durante la beta se juega siempre con el FC Poblenou. Manolo Escudero es el presidente fijo y Sito el encargado del campo fijo; el entrenador principal usa el nombre elegido por el jugador.
- La creación del entrenador forma parte de la conversación inicial y solo solicita el nombre. La edad del entrenador se elimina; el perfil se construirá gradualmente mediante evidencia de sus decisiones.
- Las conversaciones son escenas reutilizables definidas fuera de React como grafos de nodos tipados. Admiten narración, diálogo, elecciones, input, condiciones, efectos, saltos y final; la pantalla solo representa el nodo visible.
- Las escenas relevantes pueden ocupar temporalmente una pantalla propia. Esto reemplaza la decisión inicial que limitaba todas las conversaciones a un bloque del Panel del Club.
- Una nueva partida comienza con la introducción y no permite entrar al Panel hasta completarla. Su final conserva entrenador, expectativa, Staff y escena completada en el estado de partida, evitando que la introducción se repita durante esa sesión.
- La única condición de victoria de la beta es ascender a 3a Catalana. Ascenso directo y playoff cuentan igual como victoria; terminar la temporada sin ascender supone perder la partida, independientemente de expectativas o valoración presidencial.
- Las expectativas del presidente —como ocupar puestos de playoff o mantener el vestuario controlado— son parciales y no sustituyen el objetivo esencial de ascenso.
- El presupuesto deportivo mensual es una caja común para entrenador, staff y jugadores. Se genera de forma reproducible entre 400 y 700 euros, siempre en incrementos de 50 y con mayor frecuencia de valores centrales.
- La compensación mínima del entrenador es 150 euros con presupuestos de 400–600 y 200 euros con presupuestos de 650–700. La asignación inicial usa ese mínimo; una elección posterior queda preparada mediante validación de dominio.
- Los pagos mensuales de Staff consumen presupuesto; gratuidad, favores, pago presidencial y pago por asistencia no son gasto mensual fijo. Los pagos a jugadores consumen, pero sus cuotas quedan fuera del presupuesto deportivo.
- La edad numérica no forma parte del modelo de Staff ni se muestra. La edad de los jugadores se mantiene porque sí tiene consecuencias deportivas.
- Promesas, favores y evidencia del entrenador tienen modelos persistibles mínimos, pero sus mecánicas completas quedan pendientes.

## Decisiones iniciales

- La primera versión será una aplicación web local.
- Se utilizarán React y TypeScript.
- La interfaz y el motor estarán separados.
- La beta tendrá una única temporada.
- No se utilizará backend inicialmente.
- No se añadirá Tauri hasta que el prototipo sea estable.
- Primero se construirá una maqueta funcional, no el diseño visual definitivo.

## Decisiones del Hito 1

- El club provisional se llama FC Poblenou.
- Los nombres de jugadores y equipos serán ficticios y provisionales.
- La decisión inicial de mostrar 4-2-3-1 queda reemplazada por el estado actual
  de la pantalla: Tácticas abre en 4-4-2 y permite cambiar a las demás formaciones.
- Las ideas de juego disponibles serán:
  - Equilibrada.
  - Juego directo.
  - Posesión.
  - Repliegue y contraataque.
- La navegación será libre desde el panel del club.
- El menú principal servirá como entrada al prototipo.
- Los eventos y conversaciones aparecerán como un bloque dentro del panel
  del club, sin una pantalla independiente.
- La interfaz estará pensada primero para ordenador, pero deberá adaptarse
  razonablemente a pantallas pequeñas.
- El diseño visual será funcional y provisional.
- Se creará una carpeta src/domain para los tipos del juego, aunque todavía
  no contendrá lógica de simulación.

## Decisiones de la pantalla Equipo

- Un jugador puede tener una o varias posiciones. Cuando tenga varias, se
  mostrarán separadas por una barra, por ejemplo `LD / DFC`.
- La decisión inicial de mostrar una `Calidad` fija queda reemplazada: Equipo
  muestra, en este orden, Pos, Nombre, Calidad General, Forma, PJ,
  G, Edad, Personalidad, Felicidad y estado de Cuota.
- El antiguo importe de `Ingresos` ya no representa cuotas ni compensaciones en
  la UI. Ambos tienen estado financiero propio; solo las compensaciones con
  financiación `SPORTS_BUDGET` consumen presupuesto deportivo.
- La plantilla usa un único modelo compartido por Equipo y Tácticas; la calidad
  general y la mejor posición se derivan siempre de los atributos.
- Los jugadores usan 18 atributos en escala 1–20, posiciones principal y
  secundarias, pierna hábil, arquetipo y posibles rasgos. Ningún atributo generado
  puede valer 0.
- Cada posición tiene un rating teórico ponderado. En multposición, la Calidad
  General es el máximo rating entre posiciones naturales.
- La plantilla mock se genera de forma determinista con semillas fijas, objetivos
  aproximados, arquetipos y rasgos. No se guarda una calidad editable.
- Los porteros parten de rangos propios para sus atributos de campo. El ajuste de
  calidad solo modifica atributos ponderados y prioriza los de su arquetipo.
- La calidad de un portero pondera Paradas al 50%; Juego de pies POR al 10%;
  Juego aéreo POR y Mentalidad al 15% cada uno; y Comunicación al 10%.
- Juego de pies POR es independiente de Pases, Técnica y Regate.
- La generación concentra los atributos en valores medios y aplica topes blandos:
  el ajuste normal reparte mejoras y no crea valores 19–20, reservados a una
  probabilidad excepcional en fortalezas del arquetipo.
- Los arquetipos y rasgos orientan la distribución sin imponer valores rígidos.
  Dos jugadores del mismo perfil pueden tener atributos diferentes.
- La ficha del jugador se abre como un diálogo dentro de Equipo para mantener la
  navegación sin router y permitir volver a la tabla sin cambiar de pantalla.
- La ficha solo muestra el bloque de atributos de portería cuando `POR` forma
  parte de las posiciones naturales del jugador.
- Equipo y Tácticas reutilizan una única ficha de jugador. En el campo, la
  valoración se deriva de la posición táctica actual; en el banquillo se muestra
  la Calidad General derivada de sus posiciones naturales.
- La familiaridad posicional se deriva de la distancia mínima en un grafo de
  posiciones relacionadas. Penaliza temporalmente entre 0 y 3 puntos únicamente
  los atributos ponderados del puesto; `POR` permanece separado del resto.
- `calculatePositionRating` representa capacidad teórica sin familiaridad;
  `calculateTacticalRating` representa rendimiento actual con atributos efectivos.
  Ninguno se persiste en los datos mock.
- El aprendizaje progresivo de nuevas posiciones queda planificado. Todavía no
  existen entrenamiento, experiencia ni minutos que alteren la familiaridad.

## Decisiones de la pantalla Staff

- La calidad numérica del staff es interna. La pantalla muestra únicamente rol,
  nombre, carácter conocido, disponibilidad aproximada y coste; no existen
  vacantes obligatorias ni una valoración general visible.
- Staff estará disponible desde la navegación principal y desde su bloque en
  el Panel del Club.
- El primer entrenador representa al usuario, siempre existe y no tiene una
  calidad comparable a los NPC. Su perfil se irá definiendo mediante decisiones.
- Los NPC tienen un rol principal, pero sus capacidades internas son
  transversales: en el fútbol amateur todos pueden ayudar en varias tareas.
- Personalidad real y conocimiento del entrenador son datos distintos. Antes de
  conocerla, la interfaz usa indicios narrativos y muestra «Por conocer».
- Sito es el encargado del campo fijo. Siempre existe como personal del club
  separado; no se contrata, no se despide desde Staff y no consume presupuesto deportivo.
- Staff comparte el presupuesto deportivo mensual con entrenador y jugadores.
  Solo los acuerdos mensuales consumen disponible fijo; gratuidad, favores, pago
  presidencial y pago por asistencia no lo hacen.
- Las personas protegidas o impuestas no pueden abandonar silenciosamente el
  cuerpo técnico: la interfaz exige hablar antes con el presidente.
- La búsqueda de ayuda pasa por el presidente y devuelve candidatos narrativos
  sin atributos visibles. El retraso temporal y las fuentes dinámicas quedan
  pendientes de la integración futura con calendario y eventos.
- El impacto se calcula por áreas separadas (entrenamiento, grupo, recuperación,
  táctica, información y porteros), considerando capacidad, compromiso,
  fiabilidad y disponibilidad, sin un multiplicador universal.

## Decisiones de la pantalla Clasificación

- Los 12 clubes de la liga viven en un mock común identificado por `id`, preparado
  para reutilizarse en calendario, resultados, goleadores y sanciones.
- Los partidos disputados son la única fuente de verdad de la clasificación. No
  se persisten puntos, estadísticas clasificatorias ni rachas por jornada.
- La sección de liga muestra sus cuatro pestañas, aunque en esta fase únicamente
  Clasificación tiene contenido y navegación activa.
- La jornada actual del mock es la 10, coherente con los partidos jugados de la
  clasificación provisional. Las jornadas 11–22 se muestran desactivadas.
- El histórico de clasificación se reconstruye acumulando los resultados hasta
  la jornada consultada. Goleadores queda preparado mediante eventos acumulables
  y Sanciones mediante jornada de inicio y número de partidos.
- El desempate provisional se ordena por puntos, diferencia de goles y goles a
  favor; si persiste, se usa el identificador del equipo para un orden estable.
- Resultados y Clasificación comparten los mismos partidos, equipos, selector de
  jornada y navegación de pestañas. Resultados muestra exclusivamente los seis
  encuentros de la jornada consultada mediante la consulta de dominio común.
- Los eventos de gol se almacenan separados de los partidos y referencian partido,
  equipo y autor. Se generan desde los marcadores mock y se validan contra ellos.
- Goleadores acumula esos eventos hasta la jornada consultada. Los autores del FC
  Poblenou referencian la plantilla real; los rivales usan identidades mínimas.
- La jornada seleccionada de La Liga vive en `App.tsx` y se conserva al cambiar
  entre Resultados, Clasificación, Sanciones y Goleadores.
- Las sanciones tienen una fuente independiente y se consultan por vigencia, no
  de forma acumulativa. Jornada inicial y duración determinan las jornadas en las
  que el jugador no puede participar y los partidos que aún le quedan.

## Decisiones de la pantalla Entrenamiento

- La planificación semanal contiene dos sesiones (martes y jueves), con dos bloques cada una e intensidad Baja, Media o Alta aplicada a toda la sesión.
- Completo, Lúdico y Descanso ocupan los dos bloques. Entrenamiento «De mínimos» no es seleccionable: será un resultado futuro cuando asistan 12 jugadores o menos; el mínimo para una sesión normal será 13.
- Las variables generales e individuales del entrenamiento usan internamente una escala 0–100. Felicidad y calidad pueden representarse mediante etiquetas.
- La Familiaridad Táctica General se calculará en el futuro con un 80% de instrucciones y un 20% de formación. Cada opción táctica y cada formación podrán conservar su familiaridad 0–100.
- Existe una única familiaridad de Balón parado, independiente de la familiaridad táctica.
- Los bonus provisionales decimales por atributo, su decadencia, continuidad y consolidación permanente se procesan al cerrar la semana. El valor efectivo nunca supera 20 y el bonus tiene un máximo provisional de +2.
- La calidad de sesión pondera asistencia, autoridad, staff y estado del grupo. Solo los asistentes reciben efectos y con menos de 13 la sesión se resuelve De mínimos.
- La familiaridad táctica conserva valor actual y máximo histórico por opción y formación. Su memoria acelera la recuperación y limita la decadencia; Balón parado mantiene memoria independiente.
- Las doce personalidades beta se implementan mediante modificadores compartidos, no mediante ramas específicas por jugador. Afectan satisfacción con entrenamientos y autoridad individual.
- La felicidad individual es la media de relación con compañeros, tiempo de juego, satisfacción con entrenamientos y resultados. En esta fase solo entrenamiento y Lúdico actualizan componentes; partido y minutos quedan por conectar.
- El riesgo de lesión y de conflicto están calculados y encapsulados, pero todavía no generan lesiones médicas ni eventos narrativos.

## Decisiones de la pantalla Próximo partido

- El próximo partido es el primer encuentro con estado `scheduled` en el que participa el FC Poblenou, ordenado por jornada, fecha y hora. El calendario guarda esos datos y no existe un partido específico hardcodeado en la pantalla.
- El perfil estático de cada rival contiene únicamente su posición en la temporada anterior, formación habitual, comportamiento con y sin balón, un patrón observado opcional y debilidades colectivas que todavía no pueden deducirse de forma fiable.
- La posición y estadísticas actuales proceden de la clasificación calculada con partidos disputados. La dinámica se obtiene de sus últimos cinco resultados como máximo y los goles individuales se cuentan desde los eventos de gol anteriores al próximo encuentro.
- Los jugadores a vigilar se ordenan de forma determinista por goles y después por calidad derivada para su posición. Sus fortalezas y las debilidades individuales básicas se describen a partir de atributos; no se guardan listas destacadas por jornada.
- El scouting de esta fase es determinista y no introduce información falsa cuando faltan partidos, goles o campos opcionales. En una fase futura, la calidad del staff podrá modificar la cantidad y precisión del informe, e incluso introducir apreciaciones erróneas.

## Decisiones de la mini clasificación del Panel

- La tarjeta de La liga reutiliza la clasificación calculada desde los partidos disputados hasta la jornada actual; no guarda posiciones ni puntos duplicados.
- La mini tabla intenta centrar una ventana de cinco equipos alrededor del FC Poblenou. En los extremos desplaza la ventana para conservar cinco filas siempre que la competición tenga suficientes equipos.
- El acceso a la clasificación completa conserva la navegación por estado existente en `App.tsx`.

## Decisiones de las previsualizaciones del Panel

- Táctica y Entrenamiento reciben el mismo estado vivo que sus pantallas desde `App.tsx`; no existe un mock específico del Panel.
- Equipo muestra el total de la plantilla y las sanciones vigentes para la próxima jornada. Las lesiones y la disponibilidad completa no se muestran hasta que exista un sistema médico.
- El estado humano combina felicidad y autoridad derivadas del entrenamiento con la cohesión actual del club. Las etiquetas descriptivas se generan mediante un helper de dominio compartido.
- Buzón dispone de mensajes tipados y estados propios; los antiguos eventos del
  club no actúan como sustituto de un mensaje.
- Cada sesión distingue explícitamente `UNPLANNED`, `PLANNED` y `COMPLETED`. `PLANNED` conserva la instantánea táctica prevista pero sigue siendo editable; únicamente `COMPLETED` es inmutable.

## Decisiones de Estado del vestuario

- Cohesión, ánimo colectivo y autoridad usan escala interna 0–100, pero se muestran
  mediante categorías descriptivas. El ánimo deriva de la felicidad individual y
  la autoridad de los valores individuales existentes en Entrenamiento.
- La felicidad conserva sus cuatro componentes actuales. La relación individual
  con el entrenador y la influencia social quedan como valores separados: no se
  incorporan artificialmente al cálculo de felicidad.
- Los perfiles del vestuario referencian jugadores de la plantilla mediante
  `playerId`; no existe una segunda plantilla. Añaden únicamente rol de plantilla,
  relación con el entrenador, influencia, papel social y situación relevante.
- La cohesión, los asuntos actuales y los últimos cambios son mock determinista.
  Minutos, resultados, conversaciones y eventos todavía no los actualizan.
- La influencia prepara futuras voces y dinámicas sociales, pero en esta fase no
  crea grupos, amistades, conflictos ni efectos jugables.

## Decisiones de Buzón y expectativas

- Buzón es el canal para comunicar eventos y consecuencias procedentes del
  presidente, staff, jugadores, club y competición. Los mensajes pueden estar
  nuevos, leídos, pendientes de respuesta o resueltos.
- Buzón representa comunicaciones y cambios, no el estado permanente. Las
  expectativas y la confianza del presidente tienen una única fuente de verdad
  y se consultan en Estado del vestuario; los mensajes del presidente solo hacen
  referencia narrativa a ellas.
- Las respuestas solo cambian el estado local del mensaje en esta fase. No crean
  promesas ni modifican felicidad, relación, autoridad o confianza hasta que se
  implemente el motor de consecuencias y la persistencia.
- Clasificarse para el playoff puede ser una expectativa parcial de la directiva,
  pero no sustituye la condición final de ascender a 3a Catalana.
- El club también espera mantener un buen ambiente en el vestuario. La confianza
  del presidente existe como estado propio y se muestra mediante categorías, pero
  todavía no tiene una fórmula dinámica.
- Las evaluaciones son relativas a lo esperado, no al resultado aislado. La
  futura fórmula considerará clasificación, distancia al objetivo, últimos
  partidos, tendencia y momento de la temporada para evitar reacciones excesivas
  partido a partido.
- El flujo futuro es `expectativa → realidad → evaluación → reacción →
  consecuencias`. Por ejemplo: expectativa deportiva → resultados → evaluación
  del presidente → confianza; rol esperado → minutos reales → felicidad → mensaje
  del jugador.
- Los roles de plantilla ya preparados en Estado del vestuario representan el
  rol esperado. Su comparación con el uso real queda pendiente y no duplica el
  campo deportivo descriptivo `Player.role`.
- Confianza, evaluaciones y mensajes podrán alimentar autoridad, vestuario,
  advertencias y despido, pero esas cadenas todavía no están activas.
- Una evaluación inferior podrá reducir la confianza y, posteriormente, la
  autoridad y la tolerancia del vestuario; una evaluación superior podrá producir
  el efecto contrario. Esta relación queda preparada conceptualmente, sin aplicar
  modificadores automáticos en esta fase.

## Decisiones de la superficie táctica compartida

- Táctica y la intervención durante el partido comparten el mismo campo,
  geometría de formaciones, tarjetas de jugador, banquillo e instrucciones.
- La valoración visible de un titular corresponde al puesto que ocupa en la
  formación seleccionada; no modifica su calidad general ni sus posiciones
  naturales.
- Durante el partido, las recolocaciones, sustituciones e instrucciones se
  preparan en un borrador local. Solo `Confirmar cambios` los aplica de forma
  atómica al estado del partido; cancelar no deja efectos parciales.
- Un jugador sustituido puede volver a entrar; un expulsado no. El portero del
  once confirmado debe tener `POR` como posición natural.
- Las familiaridades se presentan mediante categorías cualitativas en esta
  superficie, aunque el dominio conserva sus valores internos en escala 0–100.

## Decisiones de interrupciones y continuidad del flujo

- Los cambios de jugadores son ilimitados dentro de una misma ventana. Cada
  equipo dispone de tres interrupciones propias; el descanso y aprovechar una
  interrupción rival no consumen ninguna.
- Un jugador sustituido puede volver a entrar posteriormente. Cada entrada y
  salida permanece registrada en el historial del partido.
- Intervenir para consultar o modificar la táctica no consume interrupción. La
  interrupción propia se contabiliza únicamente al confirmar al menos un cambio
  cuando no existe una ventana gratuita.
- El reloj visible conserva su instante oficial en `MatchState`. Pausa,
  velocidad e intervención no participan en la semilla ni adelantan acciones.
- El Panel continúa disponible, pero no es un paso obligatorio entre
  checkpoints. Panel, entrenamiento y escenas temporales reutilizan la misma
  acción contextual `CONTINUAR` para localizar el siguiente punto relevante.

## Decisiones de reproducción y observación rival

- La reproducción completa dura aproximadamente 2:46 en velocidad Normal y
  1:32 en Rápida si no hay cortes. La velocidad solo cambia la cadencia visual,
  se conserva al intervenir y no forma parte de `MatchState` ni de la semilla.
- Durante el partido puede consultarse el once rival actual en formato compacto
  y sobre el campo táctico. Solo se muestran formación, nombres, puestos,
  tarjetas, lesiones observables y sustituciones.
- La vista rival lee sus tácticas y alineación vigentes, por lo que refleja los
  cambios realizados durante el encuentro. Ratings, atributos, condición y
  estados humanos internos permanecen ocultos.

## Indicadores de jugador durante la intervención

- Las tarjetas propias diferencian la media para el puesto de la nota de partido.
  Esta última es una traducción visual a escala aproximada 4–10 del rendimiento
  continuo ya existente; no altera su cálculo.
- Condición y ánimo se representan mediante un corazón cualitativo y un grupo
  reducido de expresiones. El texto exacto sigue disponible en el detalle o la
  ayuda contextual, sin mostrar porcentajes.
- El detalle seleccionado muestra entre tres y cinco métricas según el puesto.
  Ninguno de estos indicadores internos se utiliza en las tarjetas rivales.
