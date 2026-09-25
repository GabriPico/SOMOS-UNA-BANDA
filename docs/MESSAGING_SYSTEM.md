# Teléfono del club

Mensajes es un teléfono global montado una sola vez en `AppShell`. La barra
inferior derecha abre una interfaz superpuesta sin cambiar la pantalla, su estado
local, desplazamiento o URL. No hay página de Mensajes ni entrada en el sidebar.
La tarjeta del Panel abre el mismo teléfono.

## Estado y lectura

- `GameState.conversations` conserva el historial existente, las convocatorias,
  reacciones, respuestas elegidas y el estado `read` de cada mensaje.
- `GameState.selectedConversationId` es la única selección de conversación.
- `GameState.calls` conserva un historial serializable independiente.
- `useClubPhone`, montado en `App`, conserva `isPhoneOpen`, `activePhoneSection`
  (`ALL`, `UNREAD`, `CALLS`) y el mensaje al que debe llevar un acceso contextual.
- `unreadCount` se deriva con `countUnreadMessages`; nunca se guarda por separado.

Abrir la lista o el historial de llamadas no marca mensajes como leídos. Se leen
al entrar en su conversación. Los mensajes recibidos con el teléfono minimizado,
en otro hilo o durante una escena narrativa permanecen pendientes. Una llegada
normal no abre el teléfono. Minimizar conserva la conversación y la sección.
Los filtros, búsqueda y scroll pertenecen a la presentación del teléfono.

Los destinatarios y mensajes reales se reutilizan. Los avatares muestran iniciales
o el icono de grupo; no se inventan retratos ni contactos de mensajería.

## Entrega desde otros sistemas

La API pura `addMessage` de `src/domain/messages.ts` recibe el historial y devuelve
el nuevo historial. El módulo que resuelve el evento actualiza `GameState`:

```ts
const conversations = addMessage(state.conversations, {
  id: 'tutorial-tactics-mentalidad', // ID estable del evento: evita duplicados
  conversationId: 'conversation-tutorial',
  participant: {
    participantId: 'tutorial', participantName: 'Tutorial',
    participantType: 'CLUB', type: 'DIRECT',
  },
  sender: { type: 'SYSTEM', id: 'tutorial', name: 'Tutorial' },
  body: 'Puedes cambiar la mentalidad desde Tácticas.',
  timestamp: state.temporal.currentDateTime,
})
return { ...state, conversations }
```

`participant` solo es necesario para un hilo nuevo; su ID debe corresponder con
`conversationIdForParticipant`. El tiempo procede del juego, no del reloj real.
En React se usa una actualización funcional de `setGameState` para no perder
entregas simultáneas. La API no cambia la navegación ni abre el teléfono.
`appendConversationMessages` sigue disponible para los generadores existentes y
las convocatorias estructuradas: ambas entradas usan el mismo historial.

## Respuestas, tutorial y compatibilidad

`respondFromPhone` reutiliza `chooseMessageResponse` y registra una respuesta una
sola vez. Conserva las decisiones reales de mantener o revisar la segunda sesión.
El campo de texto permanece deshabilitado; las opciones disponibles aparecen en
el chat. Su botón de flecha lleva a la respuesta pendiente.

Los antiguos destinos `inbox` de onboarding, checkpoints y escenarios DEV son
comandos compatibles que abren el teléfono. El estado de pantalla excluye `inbox`.
`getPhoneAttentionTarget` localiza el presidente, informe, convocatoria o respuesta
pendiente. La ayuda del onboarding aparece dentro de la conversación; su acción
CONTINUAR conserva los hitos existentes. Cerrar el teléfono no completa un hito.
Las escenas narrativas presenciales siguen usando su propio motor; mientras están
activas, el teléfono se oculta y no marca mensajes como leídos.

## Llamadas y límites

No existía telefonía. `data/clubCalls.ts` crea un historial **de ejemplo**, indicado
en la UI, con identidades del club, fechas anteriores al inicio y sin consecuencias.
Se inicializa al hidratar si falta `calls`; respeta un historial guardado o vacío.
El modelo distingue entrante/saliente, completada/perdida, voz/vídeo y duración.
Cada fila muestra detalles, sin simular una llamada al pulsarla.

Quedan preparados los registros de llamadas reales y los tutoriales enviados como
mensajes; no hay telefonía ni escritura libre. La persistencia a disco sigue
pendiente en el proyecto. No se añaden dependencias ni aleatoriedad.

## Presentación y verificación

UI oscura, acento verde, badge rojo exterior, panel de 390 × 700 px como máximo,
limitado al viewport y al espacio de la barra DEV. Los estilos se limitan a
`club-phone`; no cambian otras pantallas. Animaciones de 200 ms, movimiento reducido,
controles reales, foco visible, cierre por chevron y Escape desde el teléfono.
El panel cerrado es `inert` y no participa en la navegación de teclado.

Eliminados `InboxScreen.tsx`, `InboxScreen.css`, su import y selectores compartidos
obsoletos. Los recursos gráficos previos se conservan como archivos del usuario,
sin referencias en el nuevo teléfono. `domain/inbox.ts` sigue siendo necesario
para expectativas y migración del buzón legado; no es una segunda UI.

Tests de dominio: entrega sin duplicados, lectura, réplicas, decisiones de
entrenamiento, destinos de tutorial y restauración del historial de llamadas.
Revisión en Chrome aislado: apertura/cierre, navegación, filtros, contador,
respuestas, convocatorias, tutorial y tamaños 1920×1080, 1366×768, 1024×768,
390×844, 320×568 y 844×390.
