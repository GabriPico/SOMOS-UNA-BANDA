import { useEffect, useId, useRef, useState } from 'react'
import { ManagementIcon } from '../components/ManagementIcon'
import { SITO } from '../data/characters'
import { chooseMessageResponse, conversationNeedsResponse, countUnreadMessages, getUnreadCount, markConversationRead, messageNeedsResponse, sortConversationsByLatest } from '../domain/messages'
import type { ConversationMessage, MessageConversation } from '../domain/messages'
import type { Player } from '../domain/models'
import { STAFF_ROLE_LABELS, type StaffPerson } from '../domain/staff'

type Props = {
  conversations: MessageConversation[]
  selectedConversationId?: string
  focusedConversationId?: string
  focusedMessageId?: string
  coachName: string
  currentDateTime: string
  onConversationsChange: (items: MessageConversation[]) => void
  onResponseSelected?: (messageId: string, optionId: string) => void
  onConversationSelect: (id: string) => void
  onBack: () => void
  players: Player[]
  staffMembers: StaffPerson[]
  coachNameForParticipants: string
}

const listTime = (value: string) => new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
const hour = (value: string) => new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
const day = (value: string) => new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(value))
const initials = (name: string) => name.trim().split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()
const conversationName = (conversation: MessageConversation) => conversation.type === 'GROUP' ? 'Primer Equipo · FC Poblenou' : conversation.participantName

function roleLabel(conversation: MessageConversation, staff: StaffPerson[]) {
  if (conversation.type === 'GROUP') return 'Grupo del equipo'
  if (conversation.participantType === 'PRESIDENT') return 'Presidente'
  if (conversation.participantId === SITO.id) return SITO.role
  if (conversation.participantType === 'STAFF') {
    const person = staff.find(member => member.id === conversation.participantId)
    return person ? STAFF_ROLE_LABELS[person.role] : 'Staff deportivo'
  }
  return conversation.participantType === 'PLAYER' ? 'Jugador' : 'Club'
}

function ContactAvatar({ conversation }: { conversation: MessageConversation }) {
  return <span className={`conversation-avatar conversation-avatar--${conversation.participantType.toLowerCase()}`} aria-hidden="true">
    {conversation.type === 'GROUP' ? <ManagementIcon name="group" /> : initials(conversation.participantName)}
  </span>
}

function CallUpBubble({ message }: { message: ConversationMessage }) {
  const callUp = message.callUp
  if (!callUp) return <p>{message.text}</p>
  return <div className="call-up-content">
    <span className="call-up-competition">{callUp.competition}</span>
    <h4>{callUp.fixture}</h4>
    <p className="call-up-date">{callUp.date}</p>
    <p className="call-up-venue">{callUp.venue}</p>
    <dl><div><dt>Hora partido</dt><dd>{callUp.matchTime}</dd></div>{callUp.meetingTime && <div><dt>Convocatoria</dt><dd>{callUp.meetingTime}</dd></div>}</dl>
    <section><strong>Convocados</strong><ul>{callUp.playerNames.map(name => <li key={name}>{name}</li>)}</ul></section>
    {callUp.additionalText && <p>{callUp.additionalText}</p>}
    {callUp.encouragement && <b className="call-up-encouragement">{callUp.encouragement}</b>}
  </div>
}

export function InboxScreen({ conversations, selectedConversationId, focusedConversationId, focusedMessageId, coachName, currentDateTime, onConversationsChange, onResponseSelected, onConversationSelect, onBack, players, staffMembers, coachNameForParticipants }: Props) {
  const [selectedId, setSelectedId] = useState(focusedConversationId ?? selectedConversationId ?? sortConversationsByLatest(conversations)[0]?.id ?? '')
  const [showParticipants, setShowParticipants] = useState(false)
  const historyRef = useRef<HTMLDivElement>(null)
  const focusedMessageRef = useRef<HTMLDivElement>(null)
  const pendingMessageRef = useRef<HTMLDivElement>(null)
  const detailRef = useRef<HTMLElement>(null)
  const participantsId = useId()
  const composerHintId = useId()
  const chatHeadingId = useId()
  const selected = conversations.find(item => item.id === selectedId)
  const ordered = sortConversationsByLatest(conversations)
  const unread = selected ? getUnreadCount(selected) : 0
  const totalUnread = countUnreadMessages(conversations)
  const pendingMessage = selected?.messages.find(messageNeedsResponse)

  useEffect(() => {
    if (focusedConversationId) {
      setSelectedId(focusedConversationId)
      setShowParticipants(false)
    }
  }, [focusedConversationId])

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (focusedMessageId && selectedId === focusedConversationId && focusedMessageRef.current) {
        focusedMessageRef.current.scrollIntoView({ block: 'center' })
      } else {
        historyRef.current?.scrollTo({ top: historyRef.current.scrollHeight })
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [focusedMessageId, focusedConversationId, selectedId])

  useEffect(() => {
    if (selectedId && unread) onConversationsChange(markConversationRead(conversations, selectedId))
  }, [selectedId, unread, conversations, onConversationsChange])

  function open(id: string) {
    setSelectedId(id)
    onConversationSelect(id)
    setShowParticipants(false)
    if (conversations.find(item => item.id === id)?.messages.some(message => !message.read)) {
      onConversationsChange(markConversationRead(conversations, id))
    }
    // When the columns stack, opening a contact brings the phone into view.
    if (window.matchMedia('(max-width: 760px)').matches) {
      detailRef.current?.scrollIntoView({ block: 'start' })
      detailRef.current?.focus({ preventScroll: true })
    }
  }

  function respond(messageId: string, optionId: string) {
    if (!selected) return
    onConversationsChange(chooseMessageResponse(conversations, selected.id, messageId, optionId, coachName, currentDateTime))
    onResponseSelected?.(messageId, optionId)
    requestAnimationFrame(() => historyRef.current?.scrollTo({ top: historyRef.current.scrollHeight }))
  }

  function goToPendingResponse() {
    pendingMessageRef.current?.scrollIntoView({ block: 'center' })
    pendingMessageRef.current?.querySelector('button')?.focus({ preventScroll: true })
  }

  return <section className="inbox-screen">
    <header className="screen-header inbox-heading">
      <div className="inbox-title"><ManagementIcon name="mail" /><div><h2>Mensajes</h2><p>Club, cuerpo técnico y vestuario</p></div></div>
      <button className="screen-back-button" type="button" onClick={onBack}>← Panel del club</button>
    </header>
    <div className="inbox-layout">
      <section className="inbox-list club-sheet club-sheet--stacked club-sheet--taped" aria-label="Conversaciones">
        <header className="inbox-list-heading"><h3>Conversaciones</h3><span>{ordered.length}</span></header>
        <div className="inbox-conversations">
          {ordered.map(conversation => {
            const last = conversation.messages.at(-1)
            const count = getUnreadCount(conversation)
            const pending = conversationNeedsResponse(conversation)
            return <button type="button" key={conversation.id} className={`inbox-list-item${conversation.id === selectedId ? ' is-selected' : ''}${count ? ' is-unread' : ''}`} aria-pressed={conversation.id === selectedId} onClick={() => open(conversation.id)}>
              <ContactAvatar conversation={conversation} />
              <span className="conversation-row-content">
                <span className="conversation-row-heading"><strong>{conversationName(conversation)}</strong>{count > 0 && <b className="conversation-unread" aria-label={`${count} sin leer`}>{count}</b>}</span>
                <span className="conversation-role">{roleLabel(conversation, staffMembers)}</span>
                <span className="conversation-preview">{last?.senderType === 'COACH' ? 'Tú: ' : ''}{last?.type === 'CALL_UP' ? 'Convocatoria enviada' : last?.text ?? 'Sin mensajes'}</span>
                <span className="conversation-indicators">{last && <time dateTime={last.timestamp}>{listTime(last.timestamp)}</time>}{pending && <mark>Respuesta pendiente</mark>}</span>
              </span>
            </button>
          })}
          {ordered.length === 0 && <p className="inbox-list-empty">Todavía no hay conversaciones.</p>}
        </div>
        <footer className="inbox-list-footer">{totalUnread ? `${totalUnread} ${totalUnread === 1 ? 'mensaje sin leer' : 'mensajes sin leer'}` : 'No tienes mensajes sin leer'}</footer>
      </section>

      <div className="inbox-phone-stage">
        <div className="inbox-handheld">
          <img className="inbox-phone-hand" src="/assets/materials/club-phone-hand-shadow.png" alt="" aria-hidden="true" draggable={false} width={1024} height={1536} />
        <article className="inbox-phone" ref={detailRef} tabIndex={-1} aria-label="Móvil del entrenador">
          <div className="inbox-message-detail">
            <div className="phone-statusbar" aria-hidden="true">
              <time dateTime={currentDateTime}>{hour(currentDateTime)}</time>
              <svg className="phone-device-indicators" viewBox="0 0 48 14" fill="currentColor"><path d="M1 9h2v4H1zm4-3h2v7H5zm4-3h2v10H9zm4-3h2v13h-2z" /><path d="M19 4q5-5 10 0l-1.5 1.5q-3.5-3.5-7 0zm3 3q2-2 4 0l-2 3z" /><rect x="33" y="3" width="12" height="8" rx="2" fill="none" stroke="currentColor" /><path d="M46 5h2v4h-2zM35 5h8v4h-8z" /></svg>
            </div>
            <div className="phone-hardware" aria-hidden="true"><span /><i /></div>
            {selected ? <>
              <header className="conversation-header">
                <ContactAvatar conversation={selected} />
                <div className="conversation-contact"><h3 id={chatHeadingId}>{conversationName(selected)}</h3><p>{roleLabel(selected, staffMembers)}</p></div>
                {selected.type === 'GROUP' && <button type="button" className="conversation-participants-button" aria-label="Ver participantes" title="Ver participantes" aria-expanded={showParticipants} aria-controls={participantsId} onClick={() => setShowParticipants(value => !value)}><ManagementIcon name="group" /></button>}
              </header>
              {selected.type === 'GROUP' && showParticipants && <section className="participant-list" id={participantsId} aria-label="Participantes">
                <h4>Participantes</h4>
                <p><strong>Entrenador</strong> · {coachNameForParticipants || 'Míster'}</p>
                <p><strong>Staff</strong> · {staffMembers.map(member => member.name).join(' · ') || 'Sin miembros'}</p>
                <p><strong>Jugadores ({players.length})</strong> · {players.map(player => player.name).join(' · ') || 'Sin jugadores'}</p>
              </section>}
              <div className="message-history" ref={historyRef} role="log" aria-labelledby={chatHeadingId} tabIndex={0}>
                {selected.messages.length === 0 && <div className="conversation-empty"><ManagementIcon name="voices" /><p>Aún no hay mensajes en esta conversación.</p></div>}
                {selected.messages.map((message, index) => {
                  const previous = selected.messages[index - 1]
                  const newDay = !previous || previous.timestamp.slice(0, 10) !== message.timestamp.slice(0, 10)
                  const first = !previous || newDay || previous.senderId !== message.senderId || previous.senderType !== message.senderType
                  return <div className={`message-entry ${message.senderType === 'COACH' ? 'is-sent' : 'is-received'}`} ref={message.id === focusedMessageId ? focusedMessageRef : undefined} key={message.id}>
                    {newDay && <div className="message-day-separator">{day(message.timestamp)}</div>}
                    <div className={`message-bubble${message.type === 'CALL_UP' ? ' is-call-up' : ''}${first ? ' is-group-start' : ' is-group-follow'}`}>
                      {message.senderType !== 'COACH' && first && <strong className="message-author">{message.senderName}</strong>}
                      {message.type === 'CALL_UP' ? <CallUpBubble message={message} /> : <p>{message.text}</p>}
                      <time dateTime={message.timestamp}>{message.senderType === 'COACH' && <span className="message-sent-label">Tú · </span>}{hour(message.timestamp)}</time>
                      {message.reactions?.length ? <div className="message-reactions">{message.reactions.map(reaction => <span key={reaction.emoji}>{reaction.emoji} {reaction.count}</span>)}</div> : null}
                    </div>
                    {messageNeedsResponse(message) && <div className="message-responses" ref={message.id === pendingMessage?.id ? pendingMessageRef : undefined} role="group" aria-label="Respuestas disponibles">
                      <span>Tu respuesta</span>
                      {message.responseOptions?.map(option => <button type="button" key={option.id} onClick={() => respond(message.id, option.id)}>{option.label}<ManagementIcon name="arrow" /></button>)}
                    </div>}
                  </div>
                })}
              </div>
              <footer className="conversation-composer">
                <div className="conversation-input-row"><ManagementIcon name="voices" /><input aria-label="Respuesta del entrenador" aria-describedby={composerHintId} readOnly value={pendingMessage ? 'Elige tu respuesta en el chat' : 'No hay respuestas pendientes'} />{pendingMessage && <button type="button" onClick={goToPendingResponse} aria-label="Ir a la respuesta pendiente" title="Ir a la respuesta pendiente"><ManagementIcon name="arrow" /></button>}</div>
                <p id={composerHintId}>{pendingMessage ? 'Responde con una de las opciones del mensaje.' : 'Los mensajes llegan con la actividad del club.'}</p>
              </footer>
            </> : <div className="conversation-empty"><ManagementIcon name="mail" /><h3>Mensajes del club</h3><p>{ordered.length ? 'Selecciona una conversación para leerla.' : 'Las conversaciones aparecerán con la actividad del club.'}</p></div>}
            <div className="phone-bottom" aria-hidden="true"><span /></div>
          </div>
        </article>
        </div>
      </div>
    </div>
  </section>
}
