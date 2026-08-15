# Registro de decisiones

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

- La pantalla Staff mostrará, en este orden: Rol, Nombre, Calidad y
  Personalidad.
- Staff estará disponible desde la navegación principal y desde su bloque en
  el Panel del Club.

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
