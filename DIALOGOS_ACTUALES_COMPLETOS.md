# DIÁLOGOS ACTUALES COMPLETOS

Transcripción del contenido narrativo localizado en el juego. Los marcadores entre llaves —por ejemplo, `{nombre del entrenador}`— identifican valores que el juego inserta dinámicamente; el texto fijo que los rodea se conserva literalmente.

# PERSONAJES ACTUALES

## Manolo Escudero

- Rol: Presidente del club.
- Nombre mostrado en escenas: `MANOLO ESCUDERO`.
- No hay una personalidad formal definida en sus datos de personaje.

## Sito

- Rol: Encargado del campo.
- Descripción definida: "Lleva años encargándose del campo, las llaves, el material y los apaños que nunca llegan a hacerse del todo."
- Personalidad definida: `SERVICIAL`.

## Miquel Ferrer / entrenador

- Rol: Primer entrenador.
- Descripción definida: "Acabas de asumir el equipo. Tu manera de entrenar y gestionar el grupo se irá definiendo con tus decisiones."
- Personalidad: no definida todavía.

## Toni Casals — variante de segundo entrenador

- Rol: Segundo entrenador.
- Descripción definida: "Dejó de jugar hace poco y quiere empezar a entrenar sin alejarse del fútbol."
- Personalidad definida: `ENTUSIASTA`.

## Ramon Vidal — variante de segundo entrenador

- Rol: Segundo entrenador.
- Descripción definida: "Lleva media vida haciendo de todo en el club y sigue viniendo porque esta es su casa."
- Personalidad definida: `DESPISTADO`.

## Hugo Navarro — variante de segundo entrenador

- Rol: Segundo entrenador.
- Descripción definida: "Una lesión le apartó del campo el curso pasado. Ya entrenaba fútbol base y ha decidido seguir junto al equipo."
- Personalidad definida: `EXIGENTE`.

## Dani Serra — variante de segundo entrenador de confianza

- Rol: Segundo entrenador.
- Descripción definida: "Tu persona de máxima confianza profesional. Ha llegado antes para conocer el club y preparar vuestra entrada."
- Personalidad definida: `RESPONSABLE`.

## Manel Roca

- Rol: Delegado.
- Descripción definida: "Lleva toda la vida alrededor del equipo y el club lo considera parte de la casa."
- Personalidad definida: `RESPONSABLE`.

## Marta Solé

- Rol: Fisio candidata.
- Descripción definida: "Una fisioterapeuta vinculada de forma estable al club; un lujo poco habitual en la categoría."
- Personalidad definida: `RESPONSABLE`.

## Sergi Batlle

- Rol: Candidato a segundo entrenador.
- Descripción definida: "Lleva años viniendo a ver partidos de la zona y todavía juega algún torneo de veteranos."
- Personalidad definida: `EXIGENTE`.

## Jugadores que pueden intervenir

Las incidencias seleccionan jugadores de la plantilla real. El nombre depende de la partida. En la queja se selecciona un veterano; en la broma, un jugador compatible con la incidencia. Sus personalidades y descripciones son las definidas en la plantilla, pero la escena no fija una identidad única.

# ESCENA: Nueva partida — Primera reunión con Manolo

Lugar: OFICINA DEL CLUB.

Momento del juego: Inicio de una partida nueva.

NARRACIÓN:

"Manolo Escudero te ha citado en el campo antes del primer entrenamiento. La puerta de las oficinas está abierta. Dentro, un hombre repasa unas hojas con una calculadora que parece más vieja que el club."

MANOLO:

"—Soy Manolo Escudero, el presidente. Yo dirijo el club y fui quien decidió contratarte. Durante el año te marcaré los objetivos y veremos juntos si se están cumpliendo."

MANOLO:

"—Perdona… ¿cómo era tu nombre?"

ENTRADA DEL ENTRENADOR:

- Etiqueta: "Tu nombre"
- Placeholder: "Nombre del entrenador"

MANOLO:

"—Eso. {nombre del entrenador}."

MANOLO:

"—Aquí entrenamos dos días. El que trabaja llega cuando puede y alguno aparecerá cuando le dé la gana. No te vuelvas loco el primer martes."

MANOLO:

"—Te voy a ahorrar el discurso. Este año hay que subir a 3a Catalana."

ENTRENADOR — OPCIONES:

1. "Vamos a por el ascenso."
2. "¿Por playoff?"
3. "Primero quiero ver qué equipo tenemos."

### SI ELIGE 1

MANOLO:

"—Eso quería oír. Directo o por playoff, me da igual. A Tercera."

[CONSECUENCIA ACTUAL]

- Mejora pequeña de relación con Manolo.
- Aumento menor de autoridad general.
- Crea la memoria `MANAGER_SHARED_PROMOTION_AMBITION`.
- Crea el flag `manager_committed_to_promotion`.
- Registra +2 en audacia del entrenador.
- Feedback literal: "Manolo ha valorado tu ambición."
- Feedback literal: "Manolo recordará que asumiste el objetivo sin dudar."

### SI ELIGE 2

MANOLO:

"—Me da igual cómo. Directos, playoff, en el último minuto… pero a Tercera."

[CONSECUENCIA ACTUAL]

- No hay consecuencia persistente asociada a esta opción.

### SI ELIGE 3

MANOLO:

"—Míratelos. Luego subes con ellos. Directo o por playoff, eso ya es cosa tuya."

[CONSECUENCIA ACTUAL]

- Crea el flag `manager_wants_to_assess_squad`.
- Registra -1 en audacia del entrenador.

[Las ramas convergen aquí]

MANOLO:

"—Para el bloque deportivo hay {presupuesto deportivo mensual} euros al mes."

ENTRENADOR — OPCIONES:

1. "¿Para el cuerpo técnico?"
2. "Para todo el equipo."

### SI ELIGE 1

MANOLO:

"—Para los que cobran: jugadores, ayudantes y tú. Las cuotas van al club; esa caja la llevo yo."

### SI ELIGE 2

MANOLO:

"—Eso es. Jugadores, ayudantes y tú. Una sola caja."

[Las ramas convergen aquí]

MANOLO:

"—Y tú cóbrate algo. Menos de {compensación mínima del entrenador} al mes, no."

ENTRENADOR — OPCIONES:

1. "¿Por qué hay un mínimo?"
2. "De acuerdo."

### SI ELIGE 1

MANOLO:

"—Porque trabajar gratis queda muy bien hasta que llevas tres derrotas y llueve. Déjalo así."

### SI ELIGE 2

No hay respuesta adicional; continúa la conversación.

## VARIANTE — Segundo conectado joven

MANOLO:

"—{primer nombre del segundo} estará contigo. No cobra; yo debía un favor a su familia. Dale una oportunidad y procura que no rompa nada."

MANOLO:

"—Será tu segundo desde hoy. Habla con él al salir."

## VARIANTE — Segundo veterano del club

MANOLO:

"—Ramon será tu segundo. Lleva toda la vida por aquí: jugador, base, ayudante… No cobra y está encantado con seguir en su casa."

MANOLO:

"—Será tu segundo desde hoy. Habla con él al salir."

## VARIANTE — Segundo excapitán

MANOLO:

"—Hugo será tu segundo. Era el capitán hasta que la lesión le dejó fuera. Conoce al vestuario mejor que nadie y ya entrenaba en la base."

MANOLO:

"—Será tu segundo desde hoy. Habla con él al salir."

## VARIANTE — Segundo de confianza

MANOLO:

"—Me dijiste que venías con alguien de confianza… ¿cómo se llamaba?"

MANOLO:

"—Apúntamelo, que luego se me olvida."

ENTRADA DEL ENTRENADOR:

- Etiqueta: "Nombre de tu segundo entrenador"
- Placeholder: "Nombre del segundo"

MANOLO:

"—Eso, {nombre completo del segundo}. Ese lo has traído tú; el acuerdo es cosa vuestra."

[Las variantes convergen aquí]

MANOLO:

"—Bueno, ya sabes lo importante. {primer nombre del segundo} está por ahí. Ve con él."

ENTRENADOR — OPCIONES:

1. "¿Ahora?"
2. "Vamos."

### SI ELIGE 1

MANOLO:

"—¿Cuándo querías empezar?"

### SI ELIGE 2

No hay respuesta adicional.

NARRACIÓN FINAL:

"Fuera empieza a moverse el club."

# ESCENA: Presentación del segundo entrenador

Lugar: PASILLO DE VESTUARIOS.

Momento del juego: Inmediatamente después de la reunión inicial con Manolo.

## VARIANTE — Toni Casals / conectado joven

TONI:

"—Hola, míster. Soy yo… el segundo. También me estoy situando, pero haré lo que necesites."

TONI:

"—Vamos. Te enseño cómo está montado esto y luego nos ponemos con el equipo."

## VARIANTE — Ramon Vidal / veterano del club

RAMON:

"—Bienvenido. Soy Ramon. Por aquí he hecho casi de todo; si una puerta no abre, seguramente sé qué patada necesita."

RAMON:

"—Ven, que te enseño la casa. Luego nos ponemos con el equipo."

## VARIANTE — Hugo Navarro / excapitán

HUGO:

"—Soy Hugo. Hasta el año pasado estaba al otro lado del vestuario. Conozco bien al grupo y ya he trabajado con chavales de la base."

HUGO:

"—Vamos. Te pongo al día y después hablamos con los jugadores."

## VARIANTE — Segundo de confianza

SEGUNDO:

"—He venido antes. He estado viendo cómo funciona todo, hablando con la gente y mirando la plantilla. Te pongo al día."

SEGUNDO:

"—Vamos. Te enseño cómo está montado todo y luego nos ponemos con el equipo."

NARRACIÓN FINAL COMÚN:

"Tu segundo abre la puerta que da al campo. A partir de ahora será quien te acompañe por el club."

# ESCENA: Presentación presencial del staff

Lugar: DEPENDENCIAS DEL CLUB.

Momento del juego: Tutorial narrativo de Staff.

SEGUNDO ENTRENADOR:

"—A mí ya me conoces. Vamos con el resto de gente que mantiene esto en pie."

Por cada miembro del staff distinto del primer entrenador, el segundo, y el fisio:

SEGUNDO ENTRENADOR:

"—Este es {nombre}, nuestro {rol}. {descripción actual del miembro}"

### VARIANTE — El miembro es delegado

DELEGADO:

"—Yo llevo fichas, horarios y todo lo que alguien recuerda cinco minutos antes del partido. Llevo aquí bastante más que las porterías nuevas."

### VARIANTE — El miembro tiene cualquier otro rol incluido por la escena

MIEMBRO DEL STAFF:

"—Encantado, míster. Aquí todos acabamos echando una mano donde haga falta."

[La escena continúa con Sito]

SEGUNDO ENTRENADOR:

"—Y aquel es Sito. Se ocupa del campo, las instalaciones y de encontrar lo que los demás damos por perdido."

SITO:

"—Si necesitas llaves, material o que deje de gotear algo, me buscas. Lo de que deje de gotear no siempre lo garantizo."

### VARIANTE — Hay contacto de fisioterapia

SEGUNDO ENTRENADOR:

"—Fisio fijo no tenemos. Cuando haga falta, el club tira de {nombre del primer contacto de fisioterapia}, que viene por sesiones."

### VARIANTE — No hay contacto de fisioterapia

SEGUNDO ENTRENADOR:

"—Fisio fijo no tenemos. Si hace falta, el club busca a alguien por sesiones."

NARRACIÓN FINAL:

"Ya conoces a las personas que sostienen el día a día del club."

# ESCENA: Conocer a la plantilla

Lugar: VESTUARIO.

Momento del juego: Después de visitar Equipo y Tácticas, antes de las primeras palabras al grupo.

NARRACIÓN:

"Hasta ahora has visto nombres, posiciones y estados. Al cruzar esta puerta aparecen las personas: bromas, silencios, botas gastadas y tres jugadores a prueba algo apartados."

## VARIANTE — Segundo conectado joven

SEGUNDO:

"—Bueno… él es el nuevo míster. Mejor que os cuente él lo que quiere hacer."

## VARIANTE — Segundo veterano del club

SEGUNDO:

"—Venga, dejad un momento las botas. Os presento al nuevo míster; luego ya le explicáis quién llega siempre tarde."

## VARIANTE — Segundo excapitán

SEGUNDO:

"—Chavales, ya sabéis por qué estoy aquí. Él es el míster y vamos a estar con él. Escuchadle."

## VARIANTE — Segundo de confianza

SEGUNDO:

"—Ya hemos visto juntos cómo está el club. Ahora quiero que conozcáis a quien va a dirigir el equipo."

NARRACIÓN FINAL:

"Las conversaciones se apagan poco a poco. Todas las miradas terminan sobre ti."

# ESCENA: Charla inicial al vestuario

Lugar: VESTUARIO.

Momento del juego: Inmediatamente antes del primer entrenamiento.

NARRACIÓN:

"El grupo espera tus primeras palabras."

ENTRENADOR — OPCIONES:

1. "Quiero conoceros primero. Ya tendremos tiempo de hablar de objetivos."
2. "Estamos aquí para intentar subir. Quiero que lo tengamos claro desde hoy."
3. "Aquí nadie tiene el puesto asegurado. Os lo tendréis que ganar."
4. "Vamos a trabajar y a disfrutar. Si estamos juntos, llegarán las cosas."

### SI ELIGE 1

NARRACIÓN:

"Marc escucha sin mostrar demasiado. Uno de los jugadores a prueba parece respirar algo más tranquilo."

[CONSECUENCIA ACTUAL]

- Aumento menor de autoridad general.
- Cohesión del equipo +1.
- Crea el flag `first_training_talk_know`.
- Registra +2 en cercanía.
- Feedback literal: "Tus primeras palabras han dejado una buena impresión en el grupo."

### SI ELIGE 2

NARRACIÓN:

"Hugo asiente. Àlex mantiene la mirada fija, entre motivado y nervioso."

[CONSECUENCIA ACTUAL]

- Aumento menor de autoridad general.
- Crea el flag `first_training_talk_promotion`.
- Registra +2 en audacia.
- Feedback literal: "Tus primeras palabras han dejado una buena impresión en el grupo."

### SI ELIGE 3

NARRACIÓN:

"Los más competitivos parecen activarse. En el fondo, uno de los veteranos cruza los brazos."

[CONSECUENCIA ACTUAL]

- Aumento menor de autoridad general.
- Cohesión del equipo -1.
- Crea el flag `first_training_talk_earn`.
- Registra +2 en disciplina.
- Feedback literal: "El vestuario ha entendido que tomarás las decisiones."

### SI ELIGE 4

NARRACIÓN:

"Se oyen un par de asentimientos. La tensión de los nuevos baja un poco."

[CONSECUENCIA ACTUAL]

- Aumento menor de autoridad general.
- Cohesión del equipo +2.
- Crea el flag `first_training_talk_together`.
- Registra +1 en cercanía.
- Feedback literal: "Tus primeras palabras han dejado una buena impresión en el grupo."

NARRACIÓN FINAL COMÚN:

"Ya te has presentado al grupo. Fuera espera el primer entrenamiento."

# ESCENA: Presentación narrativa de un entrenamiento

Lugar: CAMPO DE FÚTBOL.

Momento del juego: Tras resolver una sesión. El contenido se construye a partir de la sesión, asistentes, staff, eventos, semilla y arquetipo del segundo.

## Narración común y variantes de datos

NARRACIÓN:

"{número de asistentes} jugadores disponibles. {ausencias previstas} {staff presente o ausencia de ayudantes}"

Cada ausencia prevista se expresa literalmente así:

"{nombre del jugador}: {motivo registrado}."

Si no hay motivo registrado:

"{nombre del jugador}: había avisado de que no podía venir."

Si hay staff presente:

"Staff presente: {nombres separados por coma}."

Si no hay staff presente:

"Hoy diriges la sesión sin ayudantes."

NARRACIÓN:

"El grupo comienza el trabajo de {primer bloque en minúsculas}. La intensidad es {intensidad en minúsculas}."

### VARIANTE — Los dos bloques son iguales

NARRACIÓN:

"La sesión continúa con el mismo contenido."

### VARIANTE — Los bloques son distintos

NARRACIÓN:

"La segunda parte se dedica a {segundo bloque en minúsculas}."

## Textos de eventos de entrenamiento

- Ausencia: "{nombre} ha faltado sin avisar."
- Retraso: "{nombre} llega {minutos} minutos tarde."
- Molestias: "{nombre} termina con molestias en el {zona}."
- Lesión seria: "{nombre} sufre una lesión seria."
- Lesión leve: "{nombre} sufre una lesión leve."
- Buen rendimiento: "{nombre} deja buenas sensaciones."
- Mal rendimiento: "{nombre} trabaja por debajo de su nivel habitual."
- Observación de staff: se muestra `event.note` sustituyendo el identificador de staff por su nombre.
- Sin incidencias: "La sesión ha transcurrido sin incidencias importantes."

RESUMEN NARRADO:

"{resumen de resultado} {efectos, separados por espacios} Carga: {intensidad}. Riesgo: {riesgo de lesión}."

CIERRE:

"{etiqueta de calidad de la sesión}"

Si no existe etiqueta:

"Sesión completada"

# DIÁLOGOS DEL SEGUNDO DURANTE ENTRENAMIENTOS

Todos estos textos pueden aparecer en la presentación narrativa de la sesión. Las selecciones entre alternativas se hacen de forma determinista mediante semilla.

## VARIANTE — Ramon Vidal / veterano del club

### Antes — primer entrenamiento

"Bueno, ya los has conocido. Ahora a ver si conseguimos que corran un poco, que hablar se les da muy bien."

### Antes — entrenamientos posteriores, alternativa 1

"Venga, que ya os conozco. Como vea a alguno escondiéndose detrás del último cono..."

### Antes — entrenamientos posteriores, alternativa 2

"Vamos, hombres. Los petos están fuera; que luego siempre aparece uno diciendo que no encuentra el suyo."

### Durante — hay jugador destacado/cargado/con mal rendimiento

"{primer nombre} hoy viene con el día torcido. A este se le nota enseguida; dale cinco minutos y veremos."

### Durante — no hay jugador seleccionado

"De ánimo los veo bien. Cuando empiezan a meterse pullas entre ellos es que ya han entrado en calor."

### Durante — carga alta

"Se nota el esfuerzo en las piernas... aunque las ganas de bromear no las pierden."

### Reacción a incidencia

"Venga, no empecemos a hacer una montaña. Primero vemos cómo está y luego seguimos."

### Final — primer entrenamiento

"Para ser el primer día, ni tan mal. Alguno mañana se acordará de ti, eso sí."

### Final — carga alta posterior

"Han acabado reventados, pero de ánimo los he visto bien."

### Final — sin carga alta posterior

"No ha estado mal. Han trabajado y todavía se van hablando entre ellos, que también cuenta."

## VARIANTE — Hugo Navarro / excapitán

### Antes — primer entrenamiento

"Bien. Ya te han escuchado. Ahora viene lo importante: a estos los vas a conocer entrenando."

### Antes — entrenamientos posteriores, alternativa 1

"Venga, ya habéis tenido suficiente charla. Ahora hacedle caso al míster."

### Antes — entrenamientos posteriores, alternativa 2

"Las bromas luego. El míster está listo y nosotros también. Vamos."

### Durante — jugador con mal rendimiento

"{primer nombre} está forzando las acciones porque hoy no le están saliendo. Yo lo vigilaría."

### Durante — jugador cansado

"{primer nombre} está dejando de llegar a tiempo cuando se alarga el ejercicio. Yo lo vigilaría."

### Durante — jugador con buen rendimiento

"{primer nombre} está respondiendo bien hoy. Yo lo vigilaría."

### Durante — sin jugador seleccionado

"El grupo ha entendido la tarea. Si alguno baja el ritmo, lo voy a cortar enseguida."

### Durante — carga alta

"Los últimos minutos estamos perdiendo intensidad. No confundamos exigir con alargar por alargar."

### Reacción a incidencia

"{primer nombre o «Él»} ya te ha dicho lo que piensa. Ahora que siga y luego hablamos con calma."

### Final — primer entrenamiento

"Bien. Has visto más o menos lo que hay. Hay dos o tres cosas que te comentaré luego."

### Final — carga alta posterior

"Ha estado bien, pero no te engañes: al final hemos perdido intensidad."

### Final — sin carga alta posterior

"Buena sesión. El grupo ha entendido lo que pedías y nadie se ha escondido."

### Reacción de autoridad preparada en datos

"El grupo corta la conversación y vuelve al ejercicio en cuanto interviene."

## VARIANTE — Dani Serra / segundo de confianza

### Antes — alternativa 1

"Está todo listo. He separado los grupos y he dejado el material preparado. Cuando quieras arrancamos."

### Antes — alternativa 2

"Ya están hechos los grupos y cada bloque tiene su espacio. Dame la señal y empezamos."

### Durante — calidad baja y carga alta

"El bloque de {bloques en minúsculas} no está dando la calidad que buscábamos. Al subir el ritmo perdemos precisión; se nota el esfuerzo acumulado."

### Durante — calidad baja sin carga alta

"El bloque de {bloques en minúsculas} no está dando la calidad que buscábamos. De momento no tocaría demasiado."

### Durante — calidad no baja y carga alta

"El bloque de {bloques en minúsculas} está funcionando. Al subir el ritmo perdemos precisión; se nota el esfuerzo acumulado."

### Durante — calidad no baja sin carga alta

"El bloque de {bloques en minúsculas} está funcionando. De momento no tocaría demasiado."

### Caso individual — mal rendimiento

"Me da la sensación de que {primer nombre} necesita una corrección corta, no más presión."

### Caso individual — cansancio

"Me da la sensación de que {primer nombre} está llegando justo a la segunda acción."

### Caso individual — buen rendimiento

"Me da la sensación de que {primer nombre} puede asumir algo más hoy."

### Reacción a incidencia

"Hay protesta, pero también carga real. Yo vigilaría cómo responde antes de tomar otra decisión."

### Final — primer entrenamiento

"Buena primera sesión. Hay cosas que ajustar, pero ya tenemos una referencia real del grupo."

### Final — sesión posterior, calidad baja y carga alta

"Sesión mejorable. El trabajo ha salido mejor que el tramo físico; mañana miraría cómo recuperan."

### Final — sesión posterior, calidad baja sin carga alta

"Sesión mejorable. La carga y la respuesta del grupo han quedado equilibradas."

### Final — sesión posterior, calidad no baja y carga alta

"Sesión útil. El trabajo ha salido mejor que el tramo físico; mañana miraría cómo recuperan."

### Final — sesión posterior, calidad no baja sin carga alta

"Sesión útil. La carga y la respuesta del grupo han quedado equilibradas."

## VARIANTE — Toni Casals / conectado joven

### Antes — alternativa 1

"Bueno... yo voy preparando los petos y eso. Si quieres que haga algo concreto, me dices."

### Antes — alternativa 2

"He dejado los conos por aquí. Creo que está todo... si necesitas otra cosa, avísame."

### Durante — hay jugador seleccionado

"Creo que a {primer nombre} le está costando un poco... aunque igual es cosa mía."

### Durante — no hay jugador seleccionado

"Parece que este ejercicio les está costando. ¿Quieres que les diga algo?"

### Durante — carga alta

"Los veo un poco cansados... al final les está costando seguir el ritmo."

### Reacción a incidencia

"No sé si debería decirle algo... Dime si quieres que intervenga."

### Final — primer entrenamiento

"Bueno... yo creo que no ha ido mal. Al final estaban bastante cansados."

### Final — sesión posterior, calidad baja y carga alta

"Yo creo que ha ido un poco justa... aunque al final estaban bastante cansados. Tú sabrás mejor."

### Final — sesión posterior, calidad baja sin carga alta

"Yo creo que ha ido un poco justa... Han terminado con buena cara. Tú sabrás mejor."

### Final — sesión posterior, calidad no baja y carga alta

"Yo creo que ha ido bien... aunque al final estaban bastante cansados. Tú sabrás mejor."

### Final — sesión posterior, calidad no baja sin carga alta

"Yo creo que ha ido bien... Han terminado con buena cara. Tú sabrás mejor."

### Reacción de autoridad preparada en datos

"Un par de jugadores responden que sí, pero el ritmo apenas cambia."

# ESCENA: Queja de un veterano tras el primer entrenamiento

Lugar: VESTUARIO.

Momento del juego: Tras el primer entrenamiento cuando se activa la incidencia reproducible.

NARRACIÓN:

"La sesión ha terminado. Mientras algunos jugadores recogen el material, uno de los veteranos se acerca. Hay varios compañeros lo bastante cerca para oír la conversación."

## VARIANTE — Intensidad alta y bloque Físico

VETERANO:

"Míster, una cosa. Aquí la gente viene después de currar. Entre el físico y la intensidad de hoy nos has reventado. Si esto sigue así, al próximo entreno van a venir cuatro."

## VARIANTE — Bloque Físico sin intensidad alta

VETERANO:

"Míster, una cosa. Aquí la gente viene después de currar. Hoy hemos corrido una barbaridad. Si metemos tanto físico cada día, al próximo entreno van a venir cuatro."

## VARIANTE — Sin bloque Físico

VETERANO:

"Míster, una cosa. Aquí la gente viene después de currar. La exigencia de hoy ha sido fuerte. Si apretamos así cada día, al próximo entreno van a venir cuatro."

ENTRENADOR — OPCIONES:

1. "Es el primer día. Necesitamos ponernos en forma."
2. "Vale. En el próximo entreno bajaremos un poco la carga."
3. "¿Qué propones tú?"
4. "El entrenamiento lo decido yo."

### SI ELIGE 1

NARRACIÓN FINAL:

"El veterano asiente sin demasiado entusiasmo. El mensaje ha quedado claro para todos."

[CONSECUENCIA ACTUAL]

- Autoridad del jugador hacia el entrenador +2.
- Felicidad del jugador -2.
- Crea el flag y hecho narrativo `coachDefendedTraining`.

### SI ELIGE 2

NARRACIÓN FINAL:

"El veterano da por bueno el compromiso. En el próximo entrenamiento recordará lo que acabas de decir."

[CONSECUENCIA ACTUAL]

- Autoridad del jugador hacia el entrenador -1.
- Felicidad del jugador +3.
- Crea `coachPromisedLowerLoad` y `veteranFeltListenedTo`.
- Crea la promesa `promise-lower-load-next-training`: "El entrenador prometió reducir la carga del siguiente entrenamiento."

### SI ELIGE 3

VETERANO:

"Un poco más de balón. Que bastante corremos ya durante el día."

ENTRENADOR — OPCIONES:

1. "Vale, en el próximo entreno metemos más balón."
2. "Lo tendré en cuenta."

#### SI ELIGE 3.1

NARRACIÓN FINAL:

"La respuesta rebaja la tensión. En la próxima sesión esperará ver ese balón."

[CONSECUENCIA ACTUAL]

- Felicidad del jugador +3.
- Crea `coachAskedVeteranOpinion`, `coachPromisedMoreBall` y `veteranFeltListenedTo`.
- Crea la promesa `promise-more-ball-next-training`: "El entrenador prometió incluir más balón en el siguiente entrenamiento."

#### SI ELIGE 3.2

NARRACIÓN FINAL:

"No has prometido nada, pero el veterano se marcha con la sensación de haber sido escuchado."

[CONSECUENCIA ACTUAL]

- Felicidad del jugador +1.
- Crea `coachAskedVeteranOpinion` y `veteranFeltListenedTo`.

### SI ELIGE 4

NARRACIÓN FINAL:

"La conversación se corta en seco. Nadie replica, aunque varios jugadores han oído el intercambio."

[CONSECUENCIA ACTUAL]

- Autoridad del jugador hacia el entrenador +4.
- Felicidad del jugador -4.
- Crea `coachShutVeteranDown`.

# ESCENA: Bromista del vestuario

Lugar: VESTUARIO.

Momento del juego: Incidencia posterior a un entrenamiento; puede aparecer después de la queja del veterano.

### VARIANTE — Después de la queja del veterano

NARRACIÓN:

"La conversación anterior termina y vuelves con el grupo para cerrar la sesión. Cuando retomas las últimas indicaciones, escuchas unas risas al fondo."

### VARIANTE — Sin queja inmediatamente anterior

NARRACIÓN:

"Estás terminando de explicar las últimas indicaciones cuando escuchas unas risas al fondo."

JUGADOR:

"El jugador acaba de hacer algún comentario a un compañero. Varios están más pendientes de él que de lo que estás diciendo."

ENTRENADOR — OPCIONES:

1. "¿Queréis compartirlo con todos?"
2. "Sonreír y seguir con la charla."
3. "Cuando termine yo, habláis vosotros."
4. "Ignorarlo y terminar."

### SI ELIGE 1

[CONSECUENCIA ACTUAL]

- Autoridad del jugador +2.
- Felicidad del jugador -1.
- Crea `coachModeratelyStoppedJoke`.

### SI ELIGE 2

[CONSECUENCIA ACTUAL]

- Autoridad del jugador -1.
- Felicidad del jugador +2.
- Crea `coachPlayedAlongWithJoke`.

### SI ELIGE 3

[CONSECUENCIA ACTUAL]

- Autoridad del jugador +3.
- Felicidad del jugador -3.
- Crea `coachStrictlyStoppedJoke`.

### SI ELIGE 4

[CONSECUENCIA ACTUAL]

- No cambia autoridad ni felicidad.
- Crea `coachIgnoredJoke`.

NARRACIÓN FINAL COMÚN:

"Terminas las indicaciones y el grupo vuelve a escucharte."

# ESCENA: Resolución de la promesa del segundo entrenamiento

Momento del juego: Al resolver la siguiente sesión tras prometer menos carga o más balón.

### VARIANTE — Promesa cumplida

NARRACIÓN:

"El veterano parece satisfecho con cómo ha ido la sesión. Has cumplido lo que hablasteis."

### VARIANTE — Promesa incumplida

NARRACIÓN:

"El veterano no dice nada hasta pasar junto a ti: «Menos carga, decías…». La promesa no se ha cumplido."

# ESCENA: Hablar con Manolo desde Staff

Lugar: OFICINA DEL CLUB.

MANOLO:

"—¿Qué pasa?"

## VARIANTE — No hay búsqueda de staff pendiente

ENTRENADOR — OPCIONES:

1. "Necesito a alguien que me eche una mano."
2. "Quería confirmar qué esperas del equipo."
3. "Nada, déjalo."

### SI ELIGE 1 Y TODAVÍA NO PUEDE PEDIR STAFF

MANOLO:

"—Llevas aquí dos días. Primero mira lo que tienes y termina algún entrenamiento."

### SI ELIGE 1 Y YA PUEDE PEDIR STAFF

MANOLO / PROMPT:

"—¿Qué necesitas?"

ENTRENADOR — OPCIONES:

1. "Un segundo entrenador."
2. "Un delegado."
3. "Alguien que ayude con el equipo."
4. "Nada, déjalo."

#### SI ELIGE 1, 2 O 3

MANOLO:

"—Vale. Preguntaré por ahí. Cuando sepa algo, ya te buscaré."

[CONSECUENCIA ACTUAL]

- Crea una solicitud de búsqueda del rol correspondiente.
- Crea uno de los flags `staff_search_requested_segundo_entrenador`, `staff_search_requested_delegado` o `staff_search_requested_any_help`.

### SI ELIGE CONFIRMAR EXPECTATIVAS

MANOLO:

"—Subir a 3a Catalana. Directos o por playoff. Eso no ha cambiado desde la última vez que hablamos."

## VARIANTE — Hay búsqueda de staff pendiente

ENTRENADOR — OPCIONES:

1. "¿Sabes algo de la persona que te pedí?"
2. "Quería confirmar qué esperas del equipo."
3. "Nada, déjalo."

### SI PREGUNTA POR LA BÚSQUEDA

MANOLO:

"—Estoy preguntando. Cuando tenga algo que enseñarte, te aviso. No me llames cada tarde."

NARRACIÓN FINAL COMÚN:

"La conversación termina."

# ESCENA: Resultado de búsqueda de staff

Lugar: OFICINA DEL CLUB.

### VARIANTE — Se encontró candidato

MANOLO:

"—He encontrado a alguien. Pásate por Staff y mira el perfil; luego hablamos con calma."

### VARIANTE — No se encontró candidato

MANOLO:

"—He preguntado, pero de momento no hay nadie que encaje. Seguiré atento."

[CONSECUENCIA ACTUAL]

- Limpia la conversación pendiente asociada a la solicitud.

NARRACIÓN FINAL:

"Manolo vuelve a mirar el móvil. El asunto queda anotado."

# MENSAJES / WHATSAPP

# Conversación inicial con Manolo Escudero

REMITENTE: Manolo Escudero.

ASUNTO LEGACY: "Antes del primer entrenamiento"

MENSAJE:

"Antes del primer entrenamiento quiero que veas bien qué plantilla tienes, dejes preparada la táctica y planifiques los dos entrenamientos de esta semana."

REMITENTE: Manolo Escudero.

ASUNTO LEGACY: "La semana"

MENSAJE:

"Después del primer entrenamiento podrás revisar la sesión del jueves si el equipo acaba demasiado cargado."

# Informes de entrenamiento — mensajes del segundo

## VARIANTE — Ramon Vidal / veterano del club

INFORME:

"{número de asistentes} han entrenado. {si hay jugador: «{primer nombre} me ha llamado la atención; ya sabes que a este se le nota todo en la cara.» / si no: «Al grupo lo he visto junto y con buen ambiente.»} {si hay incidencia: «Ha habido una incidencia y conviene preguntar mañana cómo sigue.» / si no: «Nada serio, míster.»}"

PREGUNTA:

"Para el jueves tenemos lo que dejamos preparado. ¿Lo mantenemos o quieres tocar algo?"

OPCIONES:

1. "Mantener la planificación"
2. "Modificar segunda sesión"

### SI ELIGE 1

ENTRENADOR:

"Mantengamos lo que teníamos preparado."

RAMON:

"Hecho. El jueves seguimos con eso."

### SI ELIGE 2

ENTRENADOR:

"Prefiero cambiarla."

RAMON:

"Vale, míster. Tócalo con calma y yo me encargo del material."

## VARIANTE — Hugo Navarro / excapitán

INFORME:

"{número de asistentes} disponibles. {si hay jugador: «{primer nombre} ha sido el caso a seguir: {se ha frustrado y ha acelerado demasiado / la carga le ha pasado factura al final / ha respondido bien al trabajo}.» / si no: «El vestuario ha respondido con seriedad.»} {si hay incidencia: «La incidencia ha cambiado el tono del tramo final.» / si no: «En {bloques en minúsculas} el equipo ha mantenido una respuesta reconocible.»}"

PREGUNTA:

"El jueves está preparado. ¿Mantenemos el plan o quieres revisarlo?"

### SI ELIGE 1

ENTRENADOR:

"Mantengamos lo que teníamos preparado."

HUGO:

"Bien. Yo me encargo de que entren enchufados desde el principio."

### SI ELIGE 2

ENTRENADOR:

"Prefiero cambiarla."

HUGO:

"Revísalo y déjalo guardado. El jueves lo aplicamos."

## VARIANTE — Dani Serra / segundo de confianza

INFORME:

"Resumen: {número de asistentes} jugadores. Trabajo: {etiqueta de calidad en minúsculas o «correcto»}. Carga: {«alta, con pérdida de precisión al final» / «controlada»}. {si hay jugador: «Caso individual: {primer nombre}, {con dificultades al ejecutar / cargado en el tramo final / con buena respuesta}.» / si no: «Sin un caso individual claro.»} {si hay incidencia: «La incidencia merece seguimiento antes del jueves.» / si no: «Sin incidencias relevantes.»}"

PREGUNTA:

"Para el jueves sigue listo el plan. ¿Lo mantenemos o quieres ajustar la segunda sesión?"

### SI ELIGE 1

ENTRENADOR:

"Mantengamos lo que teníamos preparado."

DANI:

"Perfecto. Lo dejo preparado y mañana comprobamos cómo llegan."

### SI ELIGE 2

ENTRENADOR:

"Prefiero cambiarla."

DANI:

"De acuerdo. Ajusta solo la segunda sesión y, cuando la guardes, preparo el resto."

## VARIANTE — Toni Casals / conectado joven

INFORME:

"{número de asistentes} jugadores han entrenado. {«Al final parecían cansados.» / «La carga parecía normal.»} {si hay incidencia: «Ha pasado una cosa durante la sesión que conviene revisar.» / si no: «No he visto nada grave.»}"

PREGUNTA:

"Para el jueves está lo que habíamos puesto. ¿Lo dejamos así o quieres cambiarlo?"

### SI ELIGE 1

ENTRENADOR:

"Mantengamos lo que teníamos preparado."

TONI:

"Vale, perfecto. Lo dejamos así."

### SI ELIGE 2

ENTRENADOR:

"Prefiero cambiarla."

TONI:

"Claro. Cuando lo cambies miro cómo queda."

## VARIANTE — Informe sin voz específica de segundo

El remitente es el miembro deportivo presente con mejor capacidad aplicable; si no existe, se muestra "Seguimiento deportivo".

El informe concatena una opción de cada bloque:

ASISTENCIA:

- "Ha venido casi todo el mundo"
- "De asistencia hemos estado bien"
- "Hoy hemos ido bastante justos de gente"

CALIDAD:

- "En general la sesión ha salido bastante bien."
- "Nos ha costado que la sesión cogiera ritmo."
- "La sesión ha sido correcta, sin grandes alardes."

CARGA:

- "Al final se ha notado el cansancio, pero han respondido."
- "Han terminado con bastante buena cara."
- "La carga ha quedado dentro de lo previsto."

INCIDENCIAS:

- "Eso sí, hemos tenido {una o más descripciones unidas por « y »}."
- "No ha habido nada serio que destacar."

Descripciones posibles:

- "una ausencia que ya estaba prevista"
- "una ausencia sin avisar"
- "un retraso"
- "unas molestias musculares"
- "una lesión durante la sesión"
- "un jugador especialmente fino"
- "un jugador por debajo de su nivel"
- "una observación del Staff"

PREGUNTA:

"Para el {día de la siguiente sesión en minúsculas} tenemos preparada la segunda sesión. ¿Quieres mantener lo que habíamos planificado o prefieres tocarla?"

### SI ELIGE MANTENER

ENTRENADOR:

"Mantengamos lo que teníamos preparado."

RESPUESTA:

"Perfecto. Seguimos con eso en la segunda sesión."

### SI ELIGE MODIFICAR

ENTRENADOR:

"Prefiero cambiarla."

RESPUESTA:

"Vale. Échale un vistazo antes de la sesión y déjala preparada."

# Informe médico tras entrenamiento

REMITENTE: El fisio presente.

### VARIANTE — Lesión seria

"La lesión necesita una valoración más completa. De momento no contaría con el jugador."

### VARIANTE — Molestia o lesión no seria

"Parece una sobrecarga leve. Conviene controlar su carga en la próxima sesión."

# Convocatoria enviada al grupo

REMITENTE: `{nombre del entrenador}` o "Míster" si no hay nombre.

### CABECERA — Amistoso

"Convocatoria para el amistoso contra {nombre del rival}."

### CABECERA — Liga

"Convocatoria para la jornada {jornada} contra {nombre del rival}."

CONTENIDO DE LA TARJETA:

- Competición amistosa: "AMISTOSO"
- Competición oficial: "LIGA · JORNADA {jornada}"
- Partido: "{equipo local} – {equipo visitante}"
- Fecha: `{día de la semana en minúscula}, {día} de {mes en minúscula}` según formato `es-ES`.
- Campo: `{campo del partido}` o "Campo por confirmar".
- Hora: `{hora del partido}`.
- Citación: `{hora de convocatoria}`.
- Convocados: nombres completos de todos los jugadores seleccionados.
- Texto adicional: "Traed las dos equipaciones."
- Ánimo: "Vamos equipo 💪"
- Reacciones configuradas en el primer amistoso: "👍 6", "💪 4", "❤️ 2".
- Reacciones configuradas en Liga: "👍 6", "💪 4".

# Mensaje por descarte técnico relevante

REMITENTE: Manolo Escudero.

### VARIANTE — Tercera o posterior omisión consecutiva

"{nombre completo del jugador} vuelve a quedarse fuera. Es la {número ordinal}.ª convocatoria consecutiva que se pierde por decisión técnica. Me ha preguntado si hay algún problema con él."

### VARIANTE — Jugador con papel importante

"{nombre completo del jugador} se queda fuera pese a venir teniendo un papel importante. Me ha preguntado si hay algún problema con él."

ENTRENADOR — OPCIONES:

1. "No pasa nada"
2. "Dile que necesito que venga"
3. "Hablaré yo con él"

[CONSECUENCIA ACTUAL]

- Elegir una opción registra localmente la respuesta en la conversación.
- Estas opciones no tienen `coachText` ni respuesta posterior específica: el mensaje enviado por el entrenador usa literalmente la etiqueta elegida.

# ESCENA PREPARTIDO

La preparación prepartido activa ofrece estas charlas del entrenador:

1. "Salid tranquilos y haced vuestro partido."
2. "Hoy quiero intensidad desde el primer minuto."
3. "Podemos ganar si hacemos lo que hemos trabajado."
4. "No quiero excusas: hay que salir a por ellos."

Tonos mostrados, respectivamente:

1. "Sereno"
2. "Intenso"
3. "Convencido"
4. "Exigente"

No hay respuesta posterior de jugadores implementada.

# PARTIDO — TEXTOS NARRATIVOS ACTIVOS

El partido no contiene una escena dialogada de descanso o postpartido. Sí muestra narración de eventos, observaciones del segundo y una interrupción interactiva tras cada gol.

## Eventos del motor

- Inicio: "0' Empieza el partido."
- Gol: "{minuto}' GOL — {equipo}. Marca {jugador}."
- Cambio: "{minuto}' Cambio en {equipo}: entra {jugador entrante} por {jugador saliente}."
- Lesión: "{minuto}' {jugador} no puede continuar por molestias."
- Aviso de cansancio: "{minuto}' {jugador} ya muestra bastante cansancio."
- Aviso de cansancio extremo: "{minuto}' {jugador} está llegando muy justo físicamente."
- Descanso: "45' DESCANSO — {equipo local} {goles local}-{goles visitante} {equipo visitante}."
- Final: "90' FINAL — {equipo local} {goles local}-{goles visitante} {equipo visitante}."

## Observaciones posibles del segundo entrenador

- "Están insistiendo mediante nuestra derecha. Vigilaría cómo estamos defendiendo esa zona."
- "Están insistiendo mediante nuestra izquierda. Vigilaría cómo estamos defendiendo esa zona."
- "Están insistiendo mediante el carril central. Vigilaría cómo estamos defendiendo esa zona."
- "Están insistiendo mediante el juego directo. Vigilaría cómo estamos defendiendo esa zona."
- "Están insistiendo mediante los balones a la espalda. Vigilaría cómo estamos defendiendo esa zona."
- "Están insistiendo mediante las transiciones. Vigilaría cómo estamos defendiendo esa zona."
- "Están insistiendo mediante el balón parado. Vigilaría cómo estamos defendiendo esa zona."
- "{jugador} está sufriendo bastante en sus duelos. Quizá necesite más ayuda."
- "{jugador} está ganando muchos balones por arriba. Seguir buscándolo tiene sentido."
- "{jugador} empieza a llegar tarde. Parece que el ritmo le está pasando factura."
- "Saltamos a presionar, pero las líneas no siempre acompañan. Nos están faltando distancias."
- Lectura errónea: "No lo tengo del todo claro, pero quizá estamos corriendo demasiado con el balón."
- Sufijo posible si la cohesión es menor de 45 y la lectura no es errónea: " Las ayudas están llegando tarde."

## Interrupción tras un gol

Contexto mostrado según marcador:

- "Empatáis el partido."
- "Os ponéis por delante."
- "Recortáis distancias."
- "Ampliáis la ventaja."
- "Os empatan."
- "El rival se pone por delante."
- "El rival recorta distancias."
- "El rival amplía la ventaja."

La interfaz ofrece mantener el planteamiento o abrir el workspace táctico existente. No hay respuesta de personaje.

# DESCANSO

Texto narrativo implementado:

"45' DESCANSO — {equipo local} {goles local}-{goles visitante} {equipo visitante}."

No existe actualmente una charla de vestuario dialogada en el descanso. El usuario puede intervenir tácticamente y reanudar.

# POSTPARTIDO

Texto narrativo implementado:

"90' FINAL — {equipo local} {goles local}-{goles visitante} {equipo visitante}."

La pantalla final muestra el marcador, destacados, jugadores con partido difícil e incidencias, pero no contiene diálogo de personajes. La aplicación de consecuencias postpartido modifica estado deportivo y humano sin emitir texto dialogado adicional.

# TEXTO ANTIGUO / NO UTILIZADO

## Escena: `manolo_objective`

Esta escena sigue registrada en `narrativeScenes`, pero el inicio activo usa `createNewGameIntroductionScene`, que ya integra esta conversación y continúa con presupuesto, compensación y segundo entrenador. No se encontró una entrada del flujo normal hacia `manolo_objective`.

MANOLO:

"—Te voy a ahorrar el discurso. Este año hay que subir a 3a Catalana."

ENTRENADOR — OPCIONES:

1. "Vamos a por el ascenso."
2. "¿Por playoff?"
3. "Primero quiero ver qué equipo tenemos."

### SI ELIGE 1

MANOLO:

"—Eso quería oír. Directo o por playoff, me da igual. A Tercera."

[CONSECUENCIA ACTUAL DE LA ESCENA ANTIGUA]

- Mejora pequeña de relación con Manolo.
- Aumento menor de autoridad general.
- Crea `MANAGER_SHARED_PROMOTION_AMBITION`.
- Crea `manager_committed_to_promotion`.
- Registra +2 en audacia.
- Feedback literal: "Manolo ha valorado tu ambición."
- Feedback literal: "Manolo recordará que asumiste el objetivo sin dudar."

### SI ELIGE 2

MANOLO:

"—Me da igual cómo. Directos, playoff, en el último minuto… pero a Tercera."

### SI ELIGE 3

MANOLO:

"—Míratelos. Luego subes con ellos. Directo o por playoff, eso ya es cosa tuya."

[CONSECUENCIA ACTUAL DE LA ESCENA ANTIGUA]

- Crea `manager_wants_to_assess_squad`.
- Registra -1 en audacia.

## Mensajes y conversaciones exclusivos de escenarios DEV

Estos textos existen en `src/dev/devScenarios.ts`, permanecen excluidos de producción y no forman parte del flujo jugable normal.

SITO:

"Para el jueves, ¿prefieres que saque el material antes?"

OPCIONES:

1. "Sí, déjalo preparado"
2. "No hace falta"

MARC SOLER:

"Míster, el jueves llegaré tarde."

OPCIÓN:

1. "Gracias por avisar"

ENTRENADOR:

"Gracias por avisar"

MANOLO:

"Marc lleva dos cuotas pendientes. ¿Qué hacemos con él?"

OPCIONES:

1. "Déjame hablar con él"
2. "Dale otra semana"

### SI ELIGE 1

MANOLO:

"Vale, habla con él y me cuentas."

### SI ELIGE 2

MANOLO:

"De acuerdo. Una semana más."

Otros mensajes DEV de Manolo:

"Cuando puedas me dices algo."

"Míster, luego te cuento cómo queda lo de las cuotas."

# FUENTES REVISADAS

- `src/App.tsx`
- `src/components/GoalInterruption.tsx`
- `src/components/NarrativePlayer.tsx`
- `src/data/characters.ts`
- `src/data/gameState.ts`
- `src/data/inboxData.ts`
- `src/data/narrativeAssets.ts`
- `src/data/narrativeSceneFactories.ts`
- `src/data/narrativeScenes.ts`
- `src/data/staffData.ts`
- `src/dev/devScenarios.ts`
- `src/domain/assistantPersonality.ts`
- `src/domain/callUpMessages.ts`
- `src/domain/gameFlow.ts`
- `src/domain/inbox.ts`
- `src/domain/matchEngine.ts`
- `src/domain/matchGoalInterruption.ts`
- `src/domain/messages.ts`
- `src/domain/narrative.ts`
- `src/domain/onboarding.ts`
- `src/domain/postMatch.ts`
- `src/domain/preMatch.ts`
- `src/domain/preseasonOnboarding.ts`
- `src/domain/squadSelection.ts`
- `src/domain/teamChat.ts`
- `src/domain/trainingPresentation.ts`
- `src/domain/trainingReports.ts`
- `src/screens/FriendlyCallUpScreen.tsx`
- `src/screens/InboxScreen.tsx`
- `src/screens/MatchScreen.tsx`
- `src/screens/PreMatchScreen.tsx`
- `src/screens/ResultsScreen.tsx`
- `docs/DECISIONS.md`
- `docs/GAME_DESIGN.md`
- `docs/NARRATIVE_BIBLE.md`
- `docs/ROADMAP.md`

# POSIBLES DIÁLOGOS NO INCLUIDOS

- Los textos puramente de tutorial, tours contextuales, botones, validaciones y descripciones de pantallas no se han mezclado con los diálogos, siguiendo el encargo.
- `event.note`, `result.summary` y `result.effects` del entrenamiento son campos dinámicos generados por la resolución de dominio. Se ha documentado exactamente cómo se insertan y se han enumerado los textos de evento que transforma la escena; su universo final también depende de los textos producidos por el motor de entrenamiento.
- La narración jugada a jugada del motor de partido se construye mediante combinaciones dinámicas de duelos, rutas, acciones, nombres y minutos. Se han incluido los textos narrativos estructurales, interrupciones y observaciones del segundo. Las frases deportivas combinatorias del relato de cada acción no se presentan como diálogos de personajes y no se han expandido en todas sus permutaciones.
- No se localizaron escenas dialogadas activas específicas de descanso, charla postpartido, postamistoso o Jornada 1 distintas de los textos del motor y de la preparación prepartido consignados arriba.
