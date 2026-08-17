import { useState } from 'react'
import { players } from '../data/mockData'
import type { StaffPerson } from '../domain/staff'
import { isRelevantTrainingIncident } from '../domain/trainingPresentation'
import type { FunctionalTrainingSession, TrainingSessionEvent } from '../domain/trainingTypes'
import './TrainingSessionEventScreen.css'

const playerName = (id: number) => players.find((player) => player.id === id)?.name ?? 'Un jugador'
function eventText(event: TrainingSessionEvent, staff: StaffPerson[]) {
  if (event.type === 'PLAYER_ABSENCE') return `${playerName(event.playerId)} ha faltado sin avisar.`
  if (event.type === 'PLAYER_LATE') return `${playerName(event.playerId)} llega ${event.minutes} minutos tarde.`
  if (event.type === 'PLAYER_DISCOMFORT') return `${playerName(event.playerId)} termina con molestias en el ${event.area}.`
  if (event.type === 'PLAYER_INJURY') return `${playerName(event.playerId)} sufre una lesión ${event.severity === 'SERIOUS' ? 'seria' : 'leve'}.`
  if (event.type === 'PLAYER_PERFORMANCE') return `${playerName(event.playerId)} ${event.level === 'GOOD' ? 'deja buenas sensaciones' : 'trabaja por debajo de su nivel habitual'}.`
  return event.note.replace(event.staffId, staff.find((member) => member.id === event.staffId)?.name ?? event.staffId)
}

type Props = { session: FunctionalTrainingSession; nextSession?: FunctionalTrainingSession; staff: StaffPerson[]; onContinue: () => void; onKeepNextPlan?: () => void; onModifyNextPlan?: () => void }

export function TrainingSessionEventScreen({ session, nextSession, staff, onContinue, onKeepNextPlan, onModifyNextPlan }: Props) {
  const [step, setStep] = useState(0)
  const result = session.result
  if (!result) return null
  const plannedAbsences = session.plannedAbsentPlayerIds ?? []
  const unplannedAbsences = (result.absentPlayerIds ?? []).filter((id) => !plannedAbsences.includes(id))
  const staffNames = (result.presentStaffIds ?? []).map((id) => staff.find((member) => member.id === id)?.name ?? id)
  const observations = (result.events ?? []).filter((event) => !isRelevantTrainingIncident(event))
  const incidents = (result.events ?? []).filter(isRelevantTrainingIncident)
  const availabilityNotes = plannedAbsences.map((id) => `${playerName(id)}: ${session.plannedAbsenceReasons?.[id] ?? 'había avisado de que no podía venir'}.`)
  const relevantChanges = [
    ...(result.appliedEffects && result.appliedEffects.teamFatigueDelta >= 8 ? ['El grupo ha terminado con más carga de la prevista.'] : []),
    ...incidents.filter((event) => event.type === 'PLAYER_DISCOMFORT' || event.type === 'PLAYER_INJURY').map((event) => eventText(event, staff)),
    ...unplannedAbsences.map((id) => `${playerName(id)} deberá explicar su ausencia.`),
  ]
  const phases = [
    { eyebrow: `${session.day.toUpperCase()} · 19:30`, title: 'Disponibilidad', body: <><p><strong>{result.attendees.length} jugadores disponibles.</strong></p>{availabilityNotes.map((note) => <p key={note}>{note}</p>)}<p>{staffNames.length ? `Staff presente: ${staffNames.join(', ')}.` : 'Hoy diriges la sesión sin ayudantes.'}</p></> },
    { eyebrow: 'BLOQUE 1', title: session.blocks[0], body: <p>El grupo comienza el trabajo de {session.blocks[0].toLowerCase()}. La intensidad es {session.intensity.toLowerCase()}.</p> },
    { eyebrow: 'BLOQUE 2', title: session.blocks[1], body: <p>{session.blocks[0] === session.blocks[1] ? 'La sesión continúa con el mismo contenido.' : `La segunda parte se dedica a ${session.blocks[1].toLowerCase()}.`}</p> },
    ...(observations.length ? [{ eyebrow: 'OBSERVACIONES', title: 'Sensaciones de la sesión', body: <>{observations.map((event, index) => <p key={`${event.type}-${index}`}>{eventText(event, staff)}</p>)}</> }] : []),
    { eyebrow: 'INCIDENCIAS', title: incidents.length ? 'Incidencias de la sesión' : 'Sin incidencias importantes', body: incidents.length ? <>{incidents.map((event, index) => <p key={`${event.type}-${index}`}>{eventText(event, staff)}</p>)}</> : <p>La sesión ha transcurrido sin incidencias importantes.</p> },
    { eyebrow: 'ENTRENAMIENTO COMPLETADO', title: result.qualityLabel ?? 'Sesión completada', body: <><p>{result.summary}</p>{result.effects.map((effect) => <p key={effect}>{effect}</p>)}<p><strong>Carga:</strong> {session.intensity} · <strong>Riesgo:</strong> {result.injuryRisk}</p></> },
    ...(nextSession ? [{ eyebrow: `DE CARA AL ${nextSession.day.toUpperCase()}`, title: 'Siguiente sesión', body: <><div className="next-session-changes">{relevantChanges.length ? relevantChanges.map((change) => <p key={change}>{change}</p>) : <p>No hay cambios que obliguen a revisar el plan.</p>}</div><div className="next-session-plan"><strong>{nextSession.day}</strong><span>Intensidad: {nextSession.intensity}</span><span>Bloque 1: {nextSession.blocks[0]}</span><span>Bloque 2: {nextSession.blocks[1]}</span></div><div className="training-plan-actions"><button className="primary-action" type="button" onClick={onKeepNextPlan}>MANTENER PLANIFICACIÓN</button><button type="button" onClick={onModifyNextPlan}>MODIFICAR ENTRENAMIENTO</button></div></> }] : []),
  ]
  const phase = phases[step]
  const isDecision = Boolean(nextSession) && step === phases.length - 1
  return <section className="training-event-screen"><article><span>{phase.eyebrow}</span><h2>{phase.title}</h2>{phase.body}{!isDecision && <button className="primary-action" type="button" onClick={() => step === phases.length - 1 ? onContinue() : setStep((value) => value + 1)}>CONTINUAR</button>}</article><nav aria-label="Progreso de la sesión">{phases.map((_, index) => <i key={index} className={index <= step ? 'is-complete' : ''}/>)}</nav></section>
}
