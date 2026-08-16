# Registro de decisiones

## Decisiones del sistema narrativo y nueva partida

- Durante la beta se juega siempre con el FC Poblenou y Manolo Escudero es su presidente fijo. Es un veterano del fútbol amateur, intervencionista y muy atento al dinero, pero no una caricatura mafiosa.
- La creación del entrenador forma parte de la conversación inicial y solo solicita nombre y edad. El perfil del entrenador se construirá gradualmente mediante evidencia de sus decisiones.
- Las conversaciones son escenas reutilizables definidas fuera de React como grafos de nodos tipados. Admiten narración, diálogo, elecciones, input, condiciones, efectos, saltos y final; la pantalla solo representa el nodo visible.
- Las escenas relevantes pueden ocupar temporalmente una pantalla propia. Esto reemplaza la decisión inicial que limitaba todas las conversaciones a un bloque del Panel del Club.
- Una nueva partida comienza con la introducción y no permite entrar al Panel hasta completarla. Su final conserva entrenador, expectativa, Staff y escena completada en el estado de partida, evitando que la introducción se repita durante esa sesión.
- El objetivo deportivo inicial concreto sigue siendo clasificarse para el playoff. El ascenso continúa siendo el objetivo global de la beta.
- El presupuesto conjunto mensual de entrenador y cuerpo técnico se genera de forma reproducible entre 400 y 700 euros. La compensación del primer entrenador supone como mínimo el 30%; los acuerdos no mensuales mantienen las reglas existentes de Staff.
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
  G, Edad, Personalidad, Felicidad e Ingresos.
- Los ingresos se expresan siempre desde el punto de vista del club: un importe
  positivo es dinero que el jugador paga al club, cero indica que no paga ni
  cobra y un importe negativo es dinero que el club paga al jugador.
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
- El encargado del campo siempre existe como personal del club separado; no se
  contrata, no se despide desde Staff y no consume presupuesto del cuerpo técnico.
- El presupuesto mensual incluye la compensación del entrenador, que en el mock
  inicial supone el 30%. Solo los acuerdos mensuales consumen disponible fijo;
  gratuidad, favores, pago presidencial y pago por asistencia no lo hacen.
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
- Mientras no exista un indicador explícito de planificación, la presencia de las sesiones semanales actuales se considera entrenamiento preparado.

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
- El objetivo deportivo inicial del club es clasificarse para el playoff. Es una
  expectativa de la directiva y no sustituye el objetivo global del juego de
  conseguir el ascenso.
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
