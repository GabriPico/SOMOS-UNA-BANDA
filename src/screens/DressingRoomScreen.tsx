import { useState } from 'react'
import { PlayerDetail } from '../components/PlayerDetail'
import { initialDressingRoomState } from '../data/dressingRoomData'
import { players } from '../data/mockData'
import {
  getAuthorityDescription, getAuthorityLabel, getCoachRelationshipLabel,
  getCohesionDescription, getCohesionLabel, getDressingRoomHappinessLabel,
  getDressingRoomSummary, getInfluenceLabel, getMoodDescription, getMoodLabel,
} from '../domain/humanState'
import type { Player } from '../domain/models'
import { EXPECTATION_ASSESSMENT_LABELS, getPresidentTrustLabel } from '../domain/inbox'
import type { ClubExpectationsState } from '../domain/inbox'
import { getPlayerHappiness, getTeamAuthority, getTeamHappiness } from '../domain/trainingEngine'
import type { TrainingGameState } from '../domain/trainingTypes'
import type { PlayerClubCompensation, PlayerFeePlan } from '../domain/playerFinance'
import { getPlayerFeeLabel, getTeamFeeSummary, TEAM_FEE_ASSESSMENT_LABELS } from '../domain/playerFinance'
import './DressingRoomScreen.css'

type DressingRoomScreenProps = { cohesion: number; trainingState: TrainingGameState; expectations: ClubExpectationsState; playerFees: Record<number, PlayerFeePlan>; playerCompensations: Record<number, PlayerClubCompensation>; onBack: () => void }

export function DressingRoomScreen({ cohesion, trainingState, expectations, playerFees, playerCompensations, onBack }: DressingRoomScreenProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const mood = getTeamHappiness(trainingState)
  const authority = getTeamAuthority(trainingState)
  const playerById = new Map(players.map((player) => [player.id, player]))
  const unhappyPlayers = Object.values(trainingState.players).filter((state) => getPlayerHappiness(state) < 58).length
  const influentialPlayers = initialDressingRoomState.players
    .filter((profile) => profile.socialRole && profile.influence >= 65)
    .sort((a, b) => b.influence - a.influence)
    .slice(0, 4)
  const feeSummary = getTeamFeeSummary(playerFees, playerCompensations)

  return <section className="dressing-room-screen">
    <header className="screen-header">
      <button className="screen-back-button" type="button" onClick={onBack}>← Panel del club</button>
      <h2>Estado del vestuario</h2>
    </header>
    <p className="dressing-room-description">{getDressingRoomSummary(cohesion, mood, authority, unhappyPlayers)}</p>

    <section className="dressing-room-summary" aria-label="Resumen del vestuario">
      <article><h3>Cohesión</h3><strong>{getCohesionLabel(cohesion)}</strong><p>{getCohesionDescription(cohesion)}</p></article>
      <article><h3>Ánimo</h3><strong>{getMoodLabel(mood)}</strong><p>{getMoodDescription(mood)}</p></article>
      <article><h3>Autoridad</h3><strong>{getAuthorityLabel(authority)}</strong><p>{getAuthorityDescription(authority)}</p></article>
    </section>

    <section className="dressing-room-section">
      <h3>Situación actual</h3>
      <div className="dressing-room-issues">{initialDressingRoomState.issues.map((issue) => <article className={`dressing-room-issue is-${issue.severity}`} key={issue.id}><strong>{issue.title}</strong><p>{issue.description}</p></article>)}</div>
    </section>

    <section className="dressing-room-section dressing-room-fees">
      <h3>Cuotas del equipo</h3>
      <strong className={`dressing-room-fee-assessment is-${feeSummary.severity?.toLowerCase() ?? 'clear'}`}>{TEAM_FEE_ASSESSMENT_LABELS[feeSummary.assessment]}</strong>
      <div className="dressing-room-fee-counts">
        <span><b>{feeSummary.counts.upToDate}</b> al día o pagada</span><span><b>{feeSummary.counts.pending}</b> pendientes</span><span><b>{feeSummary.counts.specialAgreement}</b> acuerdo especial</span><span><b>{feeSummary.counts.exempt}</b> {feeSummary.counts.exempt === 1 ? 'exento' : 'exentos'}</span>{feeSummary.counts.paidByClub > 0 && <span><b>{feeSummary.counts.paidByClub}</b> cobra del club</span>}
      </div>
      {feeSummary.attention.length > 0 && <div className="dressing-room-fee-attention"><h4>Requieren atención</h4>{feeSummary.attention.map((issue) => { const player = playerById.get(issue.playerId); return player && <button type="button" key={issue.playerId} onClick={() => setSelectedPlayer(player)}><strong>{player.name}</strong><span>{getPlayerFeeLabel(playerFees[issue.playerId])}</span></button> })}</div>}
      <p className="dressing-room-fee-pressure"><b>Manolo</b>{feeSummary.manoloPressure}</p>
    </section>

    <section className="dressing-room-section">
      <h3>Jugadores</h3>
      <div className="dressing-room-table-wrapper"><table className="dressing-room-table" aria-label="Estado humano de los jugadores">
        <thead><tr><th scope="col">Jugador</th><th scope="col">Rol</th><th scope="col">Felicidad</th><th scope="col">Relación contigo</th><th scope="col">Situación</th></tr></thead>
        <tbody>{initialDressingRoomState.players.map((profile) => {
          const player = playerById.get(profile.playerId)
          const humanState = trainingState.players[profile.playerId]
          if (!player || !humanState) return null
          return <tr key={profile.playerId} tabIndex={0} onClick={() => setSelectedPlayer(player)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedPlayer(player) } }}>
            <td><button className="player-name-button" type="button">{player.name}</button></td><td>{profile.squadRole}</td><td>{getDressingRoomHappinessLabel(getPlayerHappiness(humanState))}</td><td>{getCoachRelationshipLabel(profile.coachRelationship)}</td><td>{profile.situation ?? '—'}</td>
          </tr>
        })}</tbody>
      </table></div>
    </section>

    <section className="dressing-room-section">
      <h3>Voces del vestuario</h3>
      <div className="dressing-room-voices">{influentialPlayers.map((profile) => {
        const player = playerById.get(profile.playerId)
        return player && <article key={profile.playerId}><strong>{player.name}</strong><span>{profile.socialRole}</span><small>{getInfluenceLabel(profile.influence)}</small></article>
      })}</div>
    </section>

    <section className="dressing-room-section dressing-room-expectations">
      <h3>Expectativas del club</h3>
      <p className="dressing-room-section-description">El presidente valora tu trabajo en función de lo que esperaba del equipo al inicio de la temporada.</p>
      <div className="dressing-room-president-trust"><span>Confianza del presidente</span><strong>{getPresidentTrustLabel(expectations.presidentTrust)}</strong></div>
      <div className="dressing-room-expectation-list">{expectations.expectations.map((expectation) => <article key={expectation.id}><h4>{expectation.title}</h4><dl><div><dt>Objetivo</dt><dd>{expectation.objective}</dd></div><div><dt>Evaluación actual</dt><dd>{EXPECTATION_ASSESSMENT_LABELS[expectation.assessment]}</dd></div></dl></article>)}</div>
    </section>

    <section className="dressing-room-section">
      <h3>Últimos cambios</h3>
      <ul className="dressing-room-changes">{initialDressingRoomState.changes.map((change) => <li className={`is-${change.direction}`} key={change.id}><span aria-hidden="true">{change.direction === 'positive' ? '↑' : change.direction === 'negative' ? '↓' : '–'}</span>{change.text}</li>)}</ul>
    </section>
    {selectedPlayer && <PlayerDetail player={selectedPlayer} trainingState={trainingState.players[selectedPlayer.id]} playerFee={playerFees[selectedPlayer.id]} playerCompensation={playerCompensations[selectedPlayer.id]} onClose={() => setSelectedPlayer(null)} />}
  </section>
}
