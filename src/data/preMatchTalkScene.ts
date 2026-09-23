import { NARRATIVE_GROUP_CALL_MS, type NarrativeChoice, type NarrativeScene, type NarrativeText, type SceneNode } from '../domain/narrative'
import type { PrematchTalkContext, TalkBeat } from '../domain/preMatchTalkTypes'
import { attentionNarration, getPrematchClosing, mentionedInTalk, prematchSceneId, type TalkAttentionSignal } from '../domain/preMatchTalk'
import { getPrematchPlanTopics, hasUsefulPrematchScouting, topicMention } from '../domain/preMatchTalkTopics'
import { talkHash } from '../domain/preMatchTalkContext'
import { PREMATCH_CONTEXT_CHOICES, PREMATCH_OPENINGS } from './preMatchTalkLines'
import { getAssistantPlanLine, getContextNarration, getHuddleNarration, getPlanNarration, getRallyNarration, getRallyReaction, RALLY_CHOICES } from './preMatchTalkPresentation'
import { leagueTeams } from './mockData'

/** Natural decisions form one finite graph. The coach is the camera, never a speaker. */
export function createPrematchTalkScene(context: PrematchTalkContext): NarrativeScene {
  const sceneId = prematchSceneId(context.matchId)
  const nodes: Record<string, SceneNode> = {}
  const closing = getPrematchClosing(context)
  const closingNode = closing === 'EXIT' ? 'exit' : closing === 'RALLY' ? 'rally-choice' : 'league-closing'
  const effect = (id: string, data: Omit<TalkBeat, 'id'>, next: string) => {
    nodes[`${id}-effect`] = { id: `${id}-effect`, type: 'CONSEQUENCE', consequence: { source: sceneId, decisionId: id, prematchTalkBeat: { matchId: context.matchId, beat: { id, ...data } } }, next }
    return `${id}-effect`
  }
  const narration = (id: string, text: NarrativeText, next: string) => {
    nodes[id] = { id, type: 'NARRATION', text, next }
    return id
  }
  // Record the decision before presenting its narration, so resuming never loses it.
  const decision = (id: string, label: string, text: NarrativeText, next: string, data: Omit<TalkBeat, 'id'>): NarrativeChoice => ({
    id, text: label, next: effect(id, data, narration(id, text, next)),
  })
  const assistantSpeech = (id: string, text: string, next: string, data: Omit<TalkBeat, 'id'>) => {
    nodes[id] = { id, type: 'DIALOGUE', characterId: context.assistant!.id, expression: 'NEUTRAL', text, next }
    nodes[`${id}-enter`] = { id: `${id}-enter`, type: 'CHARACTER_ACTION', action: 'SHOW', characterId: context.assistant!.id, position: 'LEFT', next: effect(id, data, id) }
    return `${id}-enter`
  }
  const scouting = hasUsefulPrematchScouting(context)
  narration('opening', PREMATCH_OPENINGS[talkHash('opening', context.seed) % PREMATCH_OPENINGS.length], 'context-choice')
  nodes['context-choice'] = { id: 'context-choice', type: 'CHOICE', prompt: '¿Qué quieres transmitirles sobre el partido?', choices: PREMATCH_CONTEXT_CHOICES[context.primarySituation].map((option) =>
    decision(`context-${option.id}`, option.label, getContextNarration(option.intent), scouting ? 'scouting-choice' : 'plan-choice', { duration: 'MEDIUM', intent: option.intent, speaker: 'COACH', mentions: ['context', ...(option.mentions ?? [])] })) }

  // A report is offered only when there is real information. Listening is a decision.
  if (scouting && context.assistant) {
    const second = context.assistant
    const introduction = context.rival.analysisReason === 'PREVIOUS_MEETING' ? 'Estos ya los conocemos.' : context.rival.analysisReason === 'PERSONAL_KNOWLEDGE' ? 'A estos los conozco.' : 'De estos sí hemos podido mirar alguna cosa.'
    const qualifier = second.voice === 'PRAGMATIC' ? ' A ver si hoy vuelven a hacerlo.' : second.voice === 'ANALYTICAL' ? ' Es una referencia, habrá que comprobarla.' : second.voice === 'CAUTIOUS' ? ' Ojo, que hoy pueden cambiarlo.' : ' Mirad si hoy siguen igual.'
    const report = assistantSpeech('report', `${introduction} ${context.rival.facts[0].text}${qualifier}`, 'report-choice', { duration: 'MEDIUM', speaker: 'ASSISTANT', mentions: ['report', topicMention('rival')] })
    nodes['scouting-choice'] = { id: 'scouting-choice', type: 'CHOICE', prompt: `${second.name} trae una referencia concreta de ${context.rival.name}.`, choices: [
      { id: 'listen-report', text: 'Darle la palabra para que lo explique al equipo.', next: report },
      { id: 'skip-report', text: 'Centrar la charla en nuestro plan.', next: 'plan-choice' },
    ] }
    const response = context.rival.response
    nodes['report-choice'] = { id: 'report-choice', type: 'CHOICE', prompt: 'El vestuario espera qué importancia le das a esa información.', choices: [
      ...(response && context.plan[response.instruction] === response.value ? [decision('exploit', 'Destacar esa ventaja dentro del plan preparado.', 'Señalas la oportunidad dentro de lo que ya tenéis previsto, sin pedir que fuercen la jugada.', 'plan-choice', { duration: 'SHORT', speaker: 'COACH', intent: 'FOCUS', mentions: ['exploit-report'] })] : []),
      decision('keep', 'Mantener el foco en nuestro juego.', 'Recoges la referencia y vuelves a poner el acento en vuestro partido.', 'plan-choice', { duration: 'SHORT', speaker: 'COACH', intent: 'FOCUS', mentions: ['keep-plan'] }),
      decision('observe', 'Pedir que comprueben primero cómo sale el rival.', 'Dejas la información como una referencia que confirmar sobre el campo. Varias cabezas asienten.', 'plan-choice', { duration: 'SHORT', speaker: 'COACH', intent: 'CALM', mentions: ['observe-report'] }),
      { id: 'report-more', text: 'Pedir al segundo que concrete lo observado para todos.', next: effect('report-more', { duration: 'SHORT', speaker: 'COACH', mentions: ['report-detail-requested'] }, 'report-detail-enter'), condition: { type: 'PREMATCH_NOT_MENTIONED', matchId: context.matchId, mention: 'report-detail-requested' } },
    ] }
    const extra = context.rival.facts[1]?.text ?? 'Esa es la única referencia que tenemos. No hemos visto suficiente para asegurar más cosas.'
    assistantSpeech('report-detail', `${extra} ${second.voice === 'PRAGMATIC' ? 'Que una cosa es lo visto y otra lo que nos encontremos hoy.' : 'No sabemos si van a repetirlo. Tendremos que mirar cómo salen.'}`, 'report-choice', { duration: 'LONG', speaker: 'ASSISTANT', mentions: ['report-detail'] })
  }

  const planTopics = getPrematchPlanTopics(context)
  const trained = getPrematchPlanTopics(context, true)
  const planChoices = [decision('plan-coach', 'Explicar brevemente el plan.', getPlanNarration(context), 'plan-attention', { duration: 'MEDIUM', speaker: 'COACH', intent: 'FOCUS', mentions: ['plan', ...planTopics.map((topic) => topicMention(topic.id))] })]
  if (context.assistant) {
    const delivery = context.assistant.planDelivery
    const next = assistantSpeech('plan-assistant', getAssistantPlanLine(context), 'plan-attention', { duration: delivery === 'RAMBLING' ? 'LONG' : 'MEDIUM', speaker: 'ASSISTANT', intent: 'SIMPLIFY', delivery, mentions: ['plan', ...planTopics.map((topic) => topicMention(topic.id))] })
    planChoices.push({ id: 'plan-assistant', text: `Ceder el repaso del plan a ${context.assistant.name}.`, next })
  }
  if (trained.length) planChoices.push(decision('plan-trained', 'Recordar solo lo trabajado.', getPlanNarration(context, true), 'plan-attention', { duration: 'SHORT', speaker: 'COACH', intent: 'SIMPLIFY', mentions: ['plan', ...trained.map((topic) => topicMention(topic.id))] }))
  planChoices.push({ id: 'plan-skip', text: 'No añadir más indicaciones.', next: effect('plan-skip', { duration: 'SHORT', speaker: 'OBSERVATION', mentions: ['plan'] }, 'plan-attention') })
  nodes['plan-choice'] = { id: 'plan-choice', type: 'CHOICE', prompt: '¿Cómo quieres repasar el plan antes de salir?', choices: planChoices }

  const attentionCheck = (prefix: string, next: string) => {
    const signals: TalkAttentionSignal[] = ['IMPATIENT', 'DISTRACTED', 'ENGAGED']
    signals.forEach((signal, index) => {
      const id = `${prefix}-${signal}`
      const check = index === 0 ? prefix : `${prefix}-check-${signal}`
      nodes[check] = { id: check, type: 'CONDITION', condition: { type: 'PREMATCH_ATTENTION', matchId: context.matchId, signal }, then: id, otherwise: index < signals.length - 1 ? `${prefix}-check-${signals[index + 1]}` : next }
      narration(id, (game) => attentionNarration(game.preMatchPreparations[context.matchId].talk!), effect(id, { duration: 'SHORT', speaker: 'OBSERVATION', mentions: [`attention:${signal}`] }, next))
    })
  }
  attentionCheck('plan-attention', closingNode)
  nodes.end = { id: 'end', type: 'END', autoComplete: true, result: { destination: `PREMATCH_COMPLETE:${context.matchId}` } }
  if (closing === 'EXIT') {
    narration('exit', 'Las botas empiezan a sonar hacia la puerta. Salís al campo.', effect('finish', { duration: 'SHORT', speaker: 'OBSERVATION', mentions: ['closing'] }, 'end'))
  } else {
    if (closing === 'RALLY') {
      nodes['rally-choice'] = { id: 'rally-choice', type: 'CHOICE', prompt: '¿Qué enfoque quieres darle a las últimas palabras?', choices: RALLY_CHOICES.map((option) =>
        decision(`rally-${option.id}`, option.label, getRallyNarration(context, option.intent), 'rally-attention', { duration: context.importance >= 3 ? 'LONG' : 'MEDIUM', speaker: 'COACH', intent: option.intent, mentions: ['rally'] })) }
      attentionCheck('rally-attention', 'rally-reaction')
      narration('rally-reaction', (game) => getRallyReaction(game.preMatchPreparations[context.matchId].talk!), 'huddle')
    } else {
      narration('league-closing', context.primarySituation === 'LEAGUE_DEBUT'
        ? 'Terminas de reunir al equipo. Se acabaron las pruebas: ahora sí hay puntos en juego. El vestuario se queda un instante en silencio.'
        : 'Reúnes al equipo una última vez y recuerdas los puntos que hay en juego. Es un cierre corto; las miradas ya van hacia la puerta.', effect('league-closing', { duration: 'SHORT', speaker: 'COACH', mentions: ['ritual'] }, 'huddle'))
    }
    const leader = context.huddleLeader
    narration('huddle', (game) => `${getHuddleNarration(game.preMatchPreparations[context.matchId].talk!)}${leader ? ` ${leader.name} extiende la mano hacia el centro.` : ' Las manos se juntan en el centro.'}`, leader ? 'leader-enter' : 'chant-call')
    if (leader) {
      nodes['leader-enter'] = { id: 'leader-enter', type: 'CHARACTER_ACTION', characterId: leader.id, action: 'SHOW', position: 'CENTER', next: 'leader-call' }
      nodes['leader-call'] = { id: 'leader-call', type: 'DIALOGUE', characterId: leader.id, expression: 'NEUTRAL', text: '¡Venga, todos aquí!', next: 'chant-call' }
    }
    const teamName = context.teamName ?? leagueTeams.find((team) => team.id === 'fc-poblenou')!.name
    nodes['chant-call'] = { id: 'chant-call', type: 'GROUP_CALL', emphasis: 'CALL', text: '¡UNA, DOS Y TRES...!', durationMs: NARRATIVE_GROUP_CALL_MS.CALL, next: 'chant-response' }
    nodes['chant-response'] = { id: 'chant-response', type: 'GROUP_CALL', emphasis: 'RESPONSE', text: `¡¡${teamName.toLocaleUpperCase('es-ES')}!!`, durationMs: NARRATIVE_GROUP_CALL_MS.RESPONSE, next: effect('finish', { duration: 'SHORT', speaker: 'OBSERVATION', mentions: ['closing', 'chant'] }, 'end') }
  }
  return {
    id: sceneId, version: 3, backgroundId: 'LOCKER_ROOM', startNodeId: 'opening', persistProgress: true,
    pointOfView: { characterId: context.coachId, label: 'MÍSTER' }, nodes,
    resumeNodeId: (game) => {
      const talk = game.preMatchPreparations[context.matchId]?.talk
      if (!talk) return 'opening'
      if (talk.completed || mentionedInTalk(talk, 'closing')) return 'end'
      if (mentionedInTalk(talk, 'rally')) return 'rally-reaction'
      if (mentionedInTalk(talk, 'plan')) return closingNode
      return talk.beats.length ? 'plan-choice' : 'opening'
    },
  }
}
