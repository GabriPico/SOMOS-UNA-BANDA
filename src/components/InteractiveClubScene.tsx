import { SceneHotspot } from './SceneHotspot'
import { TeamBadge } from './TeamBadge'
import { CLUB_PANEL_SCENE, CLUB_PANEL_SCENE_RATIO, CLUB_SCENE_HOTSPOTS, type ClubSceneDestination } from '../presentation/clubSceneHotspots'
import type { getClubPanelPresentation } from '../presentation/clubPanelPresentation'

type Props = {
  panel: ReturnType<typeof getClubPanelPresentation>
  actions: Record<ClubSceneDestination, () => void>
}

export function InteractiveClubScene({ panel, actions }: Props) {
  return <nav className="interactive-club-scene" aria-label="Áreas del club" style={{ aspectRatio: CLUB_PANEL_SCENE_RATIO }}>
    <img className="club-scene-background" src={CLUB_PANEL_SCENE} alt="" draggable={false} fetchPriority="high" />
    {CLUB_SCENE_HOTSPOTS.map(hotspot => <SceneHotspot key={hotspot.id} hotspot={hotspot} onActivate={actions[hotspot.id]}>
      {hotspot.id === 'next-match' && <span className="scene-fixture-paper">
        {panel.match ? <>
          <span className="scene-fixture-crests"><TeamBadge teamId={panel.match.homeTeamId} name={panel.home} /><span>vs</span><TeamBadge teamId={panel.match.awayTeamId} name={panel.away} /></span>
          <span className="scene-fixture-names">{panel.home}<br />vs {panel.away}</span>
          <span className="scene-fixture-date">{panel.fixtureTime}</span>
          <span className="scene-fixture-competition">{panel.match.competitionType === 'FRIENDLY' ? 'Amistoso · Pretemporada' : '4a Catalana'}</span>
        </> : <span className="scene-fixture-empty">Sin partido programado</span>}
      </span>}
      {hotspot.id === 'league' && <span className="scene-standings-paper">
        <span className="scene-standings-caption">4a Catalana <span>PTS</span></span>
        <span className="scene-standings-rows">{panel.standings.map(row => <span key={row.teamId} className={row.teamId === 'fc-poblenou' ? 'is-club' : undefined}><span>{row.position}</span><span>{row.name}</span><span>{row.points}</span></span>)}</span>
      </span>}
    </SceneHotspot>)}
  </nav>
}
