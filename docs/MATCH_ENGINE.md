# Motor de partido v1

## Actualización de workspace, posiciones y cambios

Táctica e intervención comparten campo, tarjetas, banquillo, clic y drag & drop. La UI solicita un intercambio y el dominio valida once único y portero. La familiaridad posicional distingue preferida, compatible e improvisada: compatible no resta atributos; improvisada sí reduce los relevantes; preferida añade solo un punto al rating.

Las reglas proceden de `SubstitutionRules`. `LEAGUE` conserva tres interrupciones, descanso libre, reentrada y ventana rival. `FRIENDLY` permite interrupciones y cambios libres, reentrada y no ofrece aprovechar la ventana rival. Reentrar conserva el mismo `MatchPlayer`, incluidos minutos, rendimiento y telemetría.

La reproducción usa aproximadamente dos segundos por bloque de dos minutos en Normal y 1,1 segundos en Rápida. Ambas velocidades son exclusivamente presentación.

## Filosofía

El partido se procesa como una secuencia determinista de acciones contextuales. La formación ocupa zonas, las instrucciones cambian las rutas intentadas y el contexto de los duelos, y los atributos individuales resuelven las acciones. No existe una comparación única de medias generales ni un multiplicador universal de estado humano.

## Estado y fases

`MatchState` es serializable y conserva minuto, segundos oficiales visibles, fase, marcador, equipos, puestos, tácticas vigentes, estados individuales, eventos, estadísticas, sustituciones, ventanas y contador de secuencia. Las fases v1 son `PRE_MATCH`, `FIRST_HALF`, `HALF_TIME`, `SECOND_HALF`, `PAUSED_FOR_DECISION` y `FINISHED`.

El motor avanza automáticamente hasta un corte obligatorio: gol, descanso,
lesión relevante, expulsión, intervención solicitada o final. Cada gol conserva
una interrupción serializable con evento, autor y marcador anterior/posterior.
Tras su presentación se ofrece mantener todo o reutilizar la intervención
táctica existente. El id se marca como procesado al reanudar, por lo que volver
de Táctica nunca vuelve a resolver ni a presentar el mismo gol. Un cambio solo
modifica el futuro porque el estado ya procesado no se reconstruye.

## Sustituciones e interrupciones

Los cambios son ilimitados, admiten reentrada y se agrupan por ventanas. Cada
equipo puede abrir tres interrupciones propias. El descanso es una ventana libre
y una interrupción rival puede aprovecharse sin consumir una propia. El rival
abre sus ventanas mediante una decisión sencilla y determinista y ofrece al
usuario la oportunidad contextual de utilizarlas.

Una intervención exclusivamente táctica nunca consume interrupción. El contador
solo aumenta al confirmar uno o más cambios fuera de una ventana gratuita. El
historial conserva cada par entrada/salida aunque un jugador participe en varios
tramos.

## Rutas y duelos

Las rutas internas son banda izquierda, banda derecha, juego interior, directo a referencia, espacio, contraataque y balón parado. Sus pesos nacen de los puestos de la formación y de las instrucciones existentes. Una ruta que funciona puede repetirse algo más durante el mismo encuentro, con un límite pequeño.

Cada ruta selecciona atacantes y defensores por puesto y plantea un duelo de desborde, carrera al espacio, juego aéreo o salida. Cada clase usa atributos propios. La finalización enfrenta calidad de ocasión, Remate, Técnica y Mentalidad contra Paradas y Mentalidad del portero; `Paradas` conserva un peso dominante.

El bloque bajo reduce el espacio de carrera y mejora la posibilidad de cobertura. Una defensa alta expone más la Rapidez. Cohesión y familiaridad deciden la calidad de ayudas, pero no aumentan Entradas, Marcaje ni Rapidez.

## Táctica y estados humanos

- La familiaridad por formación y grupos de instrucciones afecta coordinación, sincronización y coberturas.
- La autoridad individual modifica la adherencia a la instrucción y la probabilidad de indisciplina táctica.
- La felicidad modifica concentración, esfuerzo y recuperación del error. Los modificadores de las personalidades beta amortiguan o agravan esa respuesta.
- La cohesión facilita ayudas, presión coordinada y segundas jugadas.
- Condición y cansancio evolucionan por minutos, Resistencia, ritmo, altura e intensidad de presión y presión tras pérdida. El deterioro se concentra en esfuerzos, precisión y concentración.

## Determinismo

Cada tirada deriva de la semilla de partida, partido, secuencia, minuto, sal y firma de las tácticas actuales. No se utiliza `Math.random()`. Cambiar una decisión altera la firma y, por tanto, el futuro, sin modificar los eventos anteriores.

## Segundo entrenador

Solo un segundo entrenador disponible puede producir observaciones. Detección, confianza y posibilidad de interpretación errónea dependen de Observación y Conocimiento futbolístico. El consejo representa información percibida, no la verdad interna del motor.

## Postpartido

Al confirmar el final se transforma el partido programado en disputado, se incorporan una sola vez sus eventos de gol y se actualizan estadísticas de jugadores, condición, cansancio, felicidad, autoridad, cohesión y lesiones simples. Clasificación, Resultados y Goleadores siguen derivando de partidos y eventos vivos. Después se prepara la semana siguiente y se libera el checkpoint de previa.

## Fuera de v1

Quedan fuera clima, árbitros y campos avanzados, charla compleja, instrucciones y marcajes individuales, asistencias, xG visible, diagnósticos médicos, prórroga, penaltis e IA rival sofisticada.

## Experiencia y reproducción del partido

La simulación avanza mediante `advanceMatchStep`. Cada paso resuelve dominio y actualiza el `MatchState`; la pantalla decide cuándo solicitar el siguiente. `advanceMatch` conserva el avance completo para pruebas y simulaciones sin interfaz.

El cronómetro interpola entre dos cortes, pero conserva en `MatchState` el segundo
oficial mostrado cuando se pausa, cambia la velocidad o entra en intervención.
Normal y Rápida cambian únicamente la cadencia real de reproducción. Ni esos
segundos, la velocidad ni el tiempo real participan en la semilla.

La calibración de reproducción usa aproximadamente 3,6 segundos reales por
bloque de dos minutos en Normal y 2 segundos en Rápida: unos 2:46 y 1:32 para
noventa minutos sin pausas. La selección de velocidad pertenece a la pantalla,
se conserva durante una intervención y nunca modifica el estado simulado.

La UI puede representar el dibujo rival actual utilizando su formación, once,
puestos y sucesos observables. No expone ratings, atributos, condición numérica,
ánimo ni telemetría interna. Las observaciones del segundo entrenador continúan
siendo interpretaciones falibles aunque utilicen esos emparejamientos visibles.

La narración distingue eventos destacados y contextuales. Los contextuales nacen de duelos, rutas, presión, progresiones, pérdidas, coberturas y cansancio ya resueltos; no crean ocasiones adicionales. La frecuencia de llegadas puede ajustarse separadamente de la conversión en gol.

El rendimiento continuo registra aportaciones apropiadas al rol, como duelos, juego aéreo, progresiones, recuperaciones, ocasiones, remates y paradas. La UI deriva las etiquetas `Muy bien`, `Bien`, `Correcto`, `Flojo` y `Mal`. Condición y cansancio se traducen igualmente a etiquetas aproximadas sin exponer decimales internos.

El estado anímico de partido es contextual y distinto de la felicidad persistente. Puede reflejar confianza, frustración, nervios, desconexión o motivación, pero no sustituye la felicidad al terminar el encuentro.

Las observaciones del segundo entrenador son interpretaciones falibles de telemetría real. Se priorizan temas concretos, se conservan tema y severidad y se evita repetirlos mediante cooldown salvo empeoramiento claro. Sin segundo disponible no se muestra análisis omnisciente equivalente.
