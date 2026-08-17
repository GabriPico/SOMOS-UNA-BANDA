import { useState } from "react";
import { PlayerDetail } from "../components/PlayerDetail";
import { players } from "../data/mockData";
import {
  countMessagesRequiringResponse,
  countNewMessages,
  MESSAGE_STATUS_LABELS,
} from "../domain/inbox";
import type { InboxMessage } from "../domain/inbox";
import type { Player } from "../domain/models";
import "./InboxScreen.css";

type InboxScreenProps = {
  messages: InboxMessage[];
  focusedMessageId?: string;
  onMessagesChange: (messages: InboxMessage[]) => void;
  onBack: () => void;
};

export function InboxScreen({
  messages,
  focusedMessageId,
  onMessagesChange,
  onBack,
}: InboxScreenProps) {
  const [selectedMessageId, setSelectedMessageId] = useState(
    focusedMessageId ?? messages[0]?.id ?? "",
  );
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const selectedMessage = messages.find(
    (message) => message.id === selectedMessageId,
  );
  const newCount = countNewMessages(messages);
  const responseCount = countMessagesRequiringResponse(messages);

  function selectMessage(message: InboxMessage) {
    setSelectedMessageId(message.id);
    if (message.status === "new") {
      onMessagesChange(
        messages.map((item) =>
          item.id === message.id ? { ...item, status: "read" } : item,
        ),
      );
    }
  }

  function resolveMessage(messageId: string) {
    onMessagesChange(
      messages.map((message) =>
        message.id === messageId ? { ...message, status: "resolved" } : message,
      ),
    );
  }

  function openSenderPlayer(message: InboxMessage) {
    if (message.senderType !== "player" || typeof message.senderId !== "number")
      return;
    const player = players.find(
      (candidate) => candidate.id === message.senderId,
    );
    if (player) setSelectedPlayer(player);
  }

  return (
    <section className="inbox-screen">
      <header className="screen-header">
        <button className="screen-back-button" type="button" onClick={onBack}>
          ← Panel del club
        </button>
        <h2>Buzón</h2>
      </header>
      <p className="inbox-description">
        Mensajes del presidente, jugadores, staff y asuntos relacionados con el
        club.
      </p>
      <p className="inbox-counts">
        <strong>
          {newCount} {newCount === 1 ? "mensaje nuevo" : "mensajes nuevos"}
        </strong>
        <span>·</span>
        <strong>
          {responseCount}{" "}
          {responseCount === 1 ? "requiere respuesta" : "requieren respuesta"}
        </strong>
      </p>
      <div className="inbox-layout">
        <section className="inbox-list" aria-label="Lista de mensajes">
          <h3>Mensajes</h3>
          {messages.map((message) => (
            <button
              type="button"
              key={message.id}
              className={`inbox-list-item is-${message.status}${message.id === selectedMessageId ? " is-selected" : ""}`}
              aria-pressed={message.id === selectedMessageId}
              onClick={() => selectMessage(message)}
            >
              <span className="inbox-list-sender">
                {message.status === "new" && (
                  <b className="new-message-dot" aria-label="Nuevo">
                    ●
                  </b>
                )}
                {message.senderName}
              </span>
              <strong>{message.subject}</strong>
              <small>
                {message.matchday ? `Jornada ${message.matchday} · ` : ""}
                {MESSAGE_STATUS_LABELS[message.status]}
                {message.attention === "IMPORTANT"
                  ? " · Importante"
                  : message.attention === "REQUIRES_ATTENTION"
                    ? " · Requiere atención"
                    : ""}
              </small>
            </button>
          ))}
        </section>
        <article className="inbox-message-detail">
          <h3>Mensaje</h3>
          {selectedMessage ? (
            <>
              <p className="message-sender-type">
                De {selectedMessage.senderName}
              </p>
              <h4>{selectedMessage.subject}</h4>
              <p className="message-status-line">
                {selectedMessage.matchday
                  ? `Jornada ${selectedMessage.matchday} · `
                  : ""}
                {MESSAGE_STATUS_LABELS[selectedMessage.status]}
              </p>
              {selectedMessage.senderType === "player" && (
                <button
                  className="message-player-link"
                  type="button"
                  onClick={() => openSenderPlayer(selectedMessage)}
                >
                  Abrir ficha de {selectedMessage.senderName}
                </button>
              )}
              <p className="message-body">{selectedMessage.body}</p>
              {selectedMessage.responseOptions &&
                selectedMessage.status !== "resolved" && (
                  <div className="message-responses">
                    <h5>Tu respuesta</h5>
                    {selectedMessage.responseOptions.map((option) => (
                      <button
                        type="button"
                        key={option.id}
                        onClick={() => resolveMessage(selectedMessage.id)}
                      >
                        {option.label}
                      </button>
                    ))}
                    <small>
                      Esta respuesta solo resuelve el mensaje en la sesión
                      actual. Sus consecuencias se implementarán más adelante.
                    </small>
                  </div>
                )}
              {selectedMessage.status === "resolved" &&
                selectedMessage.responseOptions && (
                  <p className="message-resolved-note">
                    Conversación resuelta.
                  </p>
                )}
            </>
          ) : (
            <p>No hay mensajes disponibles.</p>
          )}
        </article>
      </div>
      {selectedPlayer && (
        <PlayerDetail
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </section>
  );
}
