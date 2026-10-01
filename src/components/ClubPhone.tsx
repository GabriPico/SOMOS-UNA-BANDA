import { Activity, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import type { ClubCall, getPhoneGuide, PhoneSection } from '../domain/clubPhone'
import { conversationNeedsResponse, getUnreadCount, messageNeedsResponse, sortConversationsByLatest, type ConversationMessage, type MessageConversation } from '../domain/messages'
import type { Player } from '../domain/models'
import type { StaffPerson } from '../domain/staff'
import type { useClubPhone } from '../hooks/useClubPhone'
import { phoneBadge, phoneCallLabel, phoneContactName, phoneContactRole, phoneDay, phoneHour, phoneInitials, phoneListTime } from '../presentation/clubPhonePresentation'
import { ClubCrest } from './ClubCrest'
import { ManagementIcon } from './ManagementIcon'
import './ClubPhone.css'

type Props = {
  phone: ReturnType<typeof useClubPhone>
  conversations: MessageConversation[]
  calls: ClubCall[]
  currentDateTime: string
  staffMembers: StaffPerson[]
  players: Player[]
  coachName: string
  guide?: ReturnType<typeof getPhoneGuide>
  onOpen: () => void
  onContinue: () => void
  suspended: boolean
  competitionPortal: ReactNode
  canOpenCompetition: boolean
}

function PhoneIcon({ name }: { name: 'phone' | 'video' | 'up' | 'down' | 'back' }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === 'phone' ? <path d="m5 3 4 1 1 5-3 2a17 17 0 0 0 6 6l2-3 5 1 1 4c-1 5-8 2-12-2S1 4 5 3Z" /> : name === 'video' ? <><rect x="2" y="6" width="13" height="12" rx="2" /><path d="m15 10 7-4v12l-7-4" /></> : name === 'up' ? <path d="m6 15 6-6 6 6" /> : name === 'down' ? <path d="m6 9 6 6 6-6" /> : <path d="M20 12H4m7-7-7 7 7 7" />}
  </svg>
}

function Avatar({ contact }: { contact: Pick<MessageConversation, 'participantName' | 'participantType'> }) {
  return <span className={`club-phone-avatar club-phone-avatar--${contact.participantType.toLowerCase()}`} aria-hidden="true">{contact.participantType === 'GROUP' ? <ManagementIcon name="group" /> : phoneInitials(contact.participantName)}</span>
}

function CallUpBubble({ message }: { message: ConversationMessage }) {
  const callUp = message.callUp
  if (!callUp) return <p>{message.text}</p>
  return <div className="club-phone-callup">
    <small>{callUp.competition}</small><h4>{callUp.fixture}</h4>
    <p>{callUp.date}</p><p>{callUp.venue}</p>
    <dl><div><dt>Hora partido</dt><dd>{callUp.matchTime}</dd></div>{callUp.meetingTime && <div><dt>Convocatoria</dt><dd>{callUp.meetingTime}</dd></div>}</dl>
    <strong>Convocados</strong><ul>{callUp.playerNames.map(name => <li key={name}>{name}</li>)}</ul>
    {callUp.additionalText && <p>{callUp.additionalText}</p>}{callUp.encouragement && <strong>{callUp.encouragement}</strong>}
  </div>
}

export function ClubPhone({ phone, conversations, calls, currentDateTime, staffMembers, players, coachName, guide, onOpen, onContinue, suspended, competitionPortal, canOpenCompetition }: Props) {
  const panelId = useId()
  const headingId = useId()
  const hintId = useId()
  const dockRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const backRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const historyRef = useRef<HTMLDivElement>(null)
  const focusedMessageRef = useRef<HTMLDivElement>(null)
  const pendingMessageRef = useRef<HTMLDivElement>(null)
  const wasOpen = useRef(false)
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [selectedCallId, setSelectedCallId] = useState<string>()
  const selected = conversations.find(item => item.id === phone.selectedConversationId)
  const isFederation = phone.activePhoneSection === 'FCF'
  const pendingMessage = selected?.messages.find(messageNeedsResponse)
  const isOpen = phone.isPhoneOpen && !suspended
  const minimizePhone = phone.minimize
  const ordered = sortConversationsByLatest(conversations).filter(item => (phone.activePhoneSection !== 'UNREAD' || getUnreadCount(item) > 0) && `${phoneContactName(item)} ${item.participantName} ${item.messages.at(-1)?.text ?? ''}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
  const visibleCalls = [...calls].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).filter(call => `${phoneContactName(call)} ${call.participantName}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
  const canContinueGuide = guide?.canContinue && selected?.id === guide.conversationId

  useEffect(() => {
    if (isOpen) closeRef.current?.focus({ preventScroll: true })
    else if (wasOpen.current && !suspended) dockRef.current?.focus({ preventScroll: true })
    wasOpen.current = isOpen
  }, [isOpen, suspended])
  useEffect(() => {
    ;(backRef.current ?? closeRef.current)?.focus({ preventScroll: true })
  }, [selected?.id])
  useEffect(() => {
    if (!isOpen) return
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || !(event.target instanceof Node) || !panelRef.current?.contains(event.target)) return
      event.preventDefault()
      event.stopPropagation()
      minimizePhone()
    }
    const panel = panelRef.current
    panel?.addEventListener('keydown', escape)
    return () => panel?.removeEventListener('keydown', escape)
  }, [isOpen, minimizePhone])
  useEffect(() => {
    if (phone.focusedMessageId && focusedMessageRef.current && historyRef.current) {
      const history = historyRef.current
      history.scrollTop += focusedMessageRef.current.getBoundingClientRect().top - history.getBoundingClientRect().top - 16
    } else historyRef.current?.scrollTo({ top: historyRef.current.scrollHeight })
  }, [phone.selectedConversationId, phone.focusedMessageId, selected?.messages.length])

  function minimize() { phone.minimize() }
  function openConversation(id: string) { setShowParticipants(false); phone.selectConversation(id) }
  function selectSection(section: PhoneSection) { setShowParticipants(false); phone.selectSection(section) }
  function goToPendingResponse() {
    if (!pendingMessageRef.current || !historyRef.current) return
    historyRef.current.scrollTop += pendingMessageRef.current.getBoundingClientRect().top - historyRef.current.getBoundingClientRect().top - 16
    pendingMessageRef.current.querySelector('button')?.focus({ preventScroll: true })
  }

  return <aside className={`club-phone${isOpen ? ' is-open' : ''}`} hidden={suspended} aria-label="Teléfono del club">
    <button ref={dockRef} type="button" className="club-phone-dock" onClick={onOpen} aria-expanded={isOpen} aria-controls={panelId} inert={isOpen} tabIndex={isOpen ? -1 : 0}>
      <span className="club-phone-envelope"><ManagementIcon name="mail" />{phone.unreadCount > 0 && <span className="club-phone-badge club-phone-badge--red" aria-hidden="true">{phoneBadge(phone.unreadCount)}</span>}</span>
      <span>Mensajes</span><PhoneIcon name="up" />
      <span className="club-phone-sr" role="status">{phone.unreadCount ? `${phone.unreadCount} mensajes sin leer` : 'Sin mensajes pendientes'}</span>
    </button>
    <section ref={panelRef} id={panelId} className="club-phone-device" role="dialog" aria-modal="false" aria-label="Teléfono del FC Poblenou" inert={!isOpen} aria-hidden={!isOpen}>
      <div className="club-phone-status" aria-hidden="true"><time>{phoneHour(currentDateTime)}</time><span className="club-phone-speaker" /><span>▮▮▮ <span className="club-phone-battery" /></span></div>
      <header className="club-phone-header">
        {selected ? <><button ref={backRef} type="button" className="club-phone-icon-button" onClick={() => phone.selectConversation(undefined)} aria-label="Volver a conversaciones"><PhoneIcon name="back" /></button><Avatar contact={selected} /><div className="club-phone-heading"><h2 id={headingId}>{phoneContactName(selected)}</h2><p>{phoneContactRole(selected, staffMembers)}</p></div></> : <><ClubCrest /><div className="club-phone-heading"><h2 id={headingId}>FC POBLENOU</h2><p>Teléfono del club</p></div></>}
        {selected?.type === 'GROUP' ? <button type="button" className="club-phone-icon-button" aria-label="Ver participantes" aria-expanded={showParticipants} onClick={() => setShowParticipants(value => !value)}><ManagementIcon name="group" /></button> : !selected && !isFederation && <button type="button" className="club-phone-icon-button" aria-label="Buscar conversaciones o llamadas" aria-expanded={showSearch} onClick={() => { setShowSearch(value => !value); setSearch('') }}><ManagementIcon name="search" /></button>}
        <button ref={closeRef} type="button" className="club-phone-icon-button" onClick={minimize} aria-label="Minimizar teléfono" title="Minimizar teléfono (Escape)"><PhoneIcon name="down" /></button>
      </header>
      <nav className="club-phone-apps" aria-label="Aplicaciones del teléfono"><button type="button" aria-pressed={!isFederation} onClick={() => selectSection('ALL')}>Mensajes</button><button type="button" aria-pressed={isFederation} onClick={() => selectSection('FCF')} disabled={!canOpenCompetition} title={!canOpenCompetition ? 'Disponible al completar el recorrido inicial' : 'Consultar Competición dentro del teléfono'}><span aria-hidden="true">◉</span> FCF</button></nav>
      <Activity mode={isFederation ? 'visible' : 'hidden'}>{competitionPortal}</Activity>
      <Activity mode={isFederation ? 'hidden' : 'visible'}>
      {!selected && <>
        {showSearch && <label className="club-phone-search"><ManagementIcon name="search" /><input autoFocus value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar…" aria-label="Buscar conversaciones o llamadas" /></label>}
        <nav className="club-phone-filters" aria-label="Filtros del teléfono">{([['ALL', 'Todos'], ['UNREAD', 'No leídos'], ['CALLS', 'Llamadas']] as const).map(([section, label]) => <button type="button" key={section} aria-pressed={phone.activePhoneSection === section} onClick={() => selectSection(section)}>{label}</button>)}</nav>
        <div className="club-phone-list">
          {phone.activePhoneSection === 'CALLS' ? <>
            <div className="club-phone-list-caption"><strong>Recientes</strong>{calls.some(call => call.source === 'EXAMPLE') && <small>Historial de ejemplo</small>}</div>
            {visibleCalls.map(call => <div key={call.id}>
              <button type="button" className={`club-phone-row${call.status === 'MISSED' ? ' is-missed' : ''}`} onClick={() => setSelectedCallId(id => id === call.id ? undefined : call.id)} aria-expanded={selectedCallId === call.id} aria-label={`Detalles: ${phoneContactName(call)}, ${phoneCallLabel(call)}`}>
                <Avatar contact={call} /><span className="club-phone-row-content"><span className="club-phone-row-title"><strong>{phoneContactName(call)}</strong><time dateTime={call.timestamp}>{phoneListTime(call.timestamp, currentDateTime)}</time></span><span className="club-phone-preview"><span className="club-phone-call-direction">{call.direction === 'INCOMING' || call.status === 'MISSED' ? '↙' : '↗'}</span> {phoneCallLabel(call)}</span></span><span className="club-phone-call-icon"><PhoneIcon name={call.medium === 'VIDEO' ? 'video' : 'phone'} /></span>
              </button>
              {selectedCallId === call.id && <div className="club-phone-call-detail"><strong>{call.participantName}</strong><p>{phoneDay(call.timestamp)} · {phoneHour(call.timestamp)}</p><p>{phoneCallLabel(call)}</p><small>{call.source === 'EXAMPLE' ? 'Registro de ejemplo. Las llamadas todavía no están disponibles.' : 'Registro del club. No se pueden iniciar llamadas desde aquí.'}</small></div>}
            </div>)}
            {!visibleCalls.length && <p className="club-phone-empty">No hay llamadas{search ? ' que coincidan con la búsqueda' : ' registradas'}.</p>}
          </> : <>
            <div className="club-phone-list-caption"><strong>Conversaciones</strong><small>{ordered.length}</small></div>
            {ordered.map(conversation => {
              const last = conversation.messages.at(-1)
              const unread = getUnreadCount(conversation)
              return <button type="button" key={conversation.id} className={`club-phone-row${unread ? ' is-unread' : ''}`} onClick={() => openConversation(conversation.id)}>
                <Avatar contact={conversation} /><span className="club-phone-row-content"><span className="club-phone-row-title"><strong>{phoneContactName(conversation)}</strong>{last && <time dateTime={last.timestamp}>{phoneListTime(last.timestamp, currentDateTime)}</time>}</span><span className="club-phone-row-bottom"><span className="club-phone-preview">{last?.senderType === 'COACH' ? 'Tú: ' : ''}{last?.text ?? 'Aún no hay mensajes'}</span>{unread > 0 && <span className="club-phone-badge" aria-label={`${unread} mensajes sin leer`}>{phoneBadge(unread)}</span>}</span>{conversationNeedsResponse(conversation) && <small className="club-phone-pending-label">Respuesta pendiente</small>}</span>
              </button>
            })}
            {!ordered.length && <div className="club-phone-empty"><ManagementIcon name="mail" /><p>{search ? 'No hay conversaciones que coincidan.' : phone.activePhoneSection === 'UNREAD' ? 'Todo al día. No tienes mensajes sin leer.' : 'Las conversaciones aparecerán con la actividad del club.'}</p></div>}
          </>}
        </div>
        <nav className="club-phone-tabs" aria-label="Secciones del teléfono"><button type="button" aria-pressed={phone.activePhoneSection !== 'CALLS'} onClick={() => selectSection('ALL')}><ManagementIcon name="mail" />Mensajes</button><button type="button" aria-pressed={phone.activePhoneSection === 'CALLS'} onClick={() => selectSection('CALLS')}><PhoneIcon name="phone" />Llamadas</button></nav>
      </>}
      {selected && <>
        {showParticipants && <section className="club-phone-participants" aria-label="Participantes"><strong>Participantes</strong><p>Entrenador · {coachName || 'Míster'}</p><p>Staff · {staffMembers.map(member => member.name).join(' · ') || 'Sin miembros'}</p><p>Jugadores ({players.length}) · {players.map(player => player.name).join(' · ')}</p></section>}
        <div className="club-phone-history" ref={historyRef} role="log" aria-labelledby={headingId} tabIndex={0}>
          {!selected.messages.length && <p className="club-phone-empty">Aún no hay mensajes en esta conversación.</p>}
          {selected.messages.map((message, index) => {
            const previous = selected.messages[index - 1]
            const newDay = !previous || previous.timestamp.slice(0, 10) !== message.timestamp.slice(0, 10)
            return <div key={message.id} ref={message.id === phone.focusedMessageId ? focusedMessageRef : undefined} className={`club-phone-message${message.senderType === 'COACH' ? ' is-sent' : ''}`}>
              {newDay && <div className="club-phone-day">{phoneDay(message.timestamp)}</div>}
              <div className="club-phone-bubble">{message.senderType !== 'COACH' && <strong className="club-phone-author">{message.senderName}</strong>}{message.type === 'CALL_UP' ? <CallUpBubble message={message} /> : <p>{message.text}</p>}<time dateTime={message.timestamp}>{message.senderType === 'COACH' && 'Tú · '}{phoneHour(message.timestamp)}</time>{message.reactions?.length ? <div className="club-phone-reactions">{message.reactions.map(reaction => <span key={reaction.emoji}>{reaction.emoji} {reaction.count}</span>)}</div> : null}</div>
              {messageNeedsResponse(message) && <div className="club-phone-responses" ref={message.id === pendingMessage?.id ? pendingMessageRef : undefined} role="group" aria-label="Respuestas disponibles"><small>Tu respuesta</small>{message.responseOptions?.map(option => <button type="button" key={option.id} onClick={() => phone.respond(message.id, option.id)}>{option.label}<ManagementIcon name="arrow" /></button>)}</div>}
            </div>
          })}
          {guide && selected.id === guide.conversationId && <aside className="club-phone-guide"><strong>Guía del club</strong><p>{guide.text}</p></aside>}
        </div>
        <footer className="club-phone-composer"><div><input disabled placeholder="Escribe un mensaje…" aria-label="Mensaje del entrenador" aria-describedby={hintId} /><button type="button" className="club-phone-send" disabled={!pendingMessage} onClick={goToPendingResponse} aria-label={pendingMessage ? 'Ir a la respuesta pendiente' : 'Enviar mensaje (no disponible)'}><ManagementIcon name="arrow" /></button></div><p id={hintId}>{pendingMessage ? 'Elige una de las respuestas del chat.' : 'Las respuestas se habilitan cuando el club te consulta.'}</p>{guide && selected.id === guide.conversationId && <button type="button" className="club-phone-continue" disabled={!canContinueGuide} onClick={onContinue}>CONTINUAR <ManagementIcon name="arrow" /></button>}</footer>
      </>}
      </Activity>
      <div className="club-phone-home-indicator" aria-hidden="true" />
    </section>
  </aside>
}
