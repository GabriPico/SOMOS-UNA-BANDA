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
- La formación inicial mostrada será 4-2-3-1.
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
- La pantalla Equipo mostrará, en este orden: Pos, Nombre, Calidad, Forma, PJ,
  G, Edad, Personalidad, Felicidad e Ingresos.
- Los ingresos se expresan siempre desde el punto de vista del club: un importe
  positivo es dinero que el jugador paga al club, cero indica que no paga ni
  cobra y un importe negativo es dinero que el club paga al jugador.
