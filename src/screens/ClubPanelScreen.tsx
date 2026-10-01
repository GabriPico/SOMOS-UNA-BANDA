import './ClubPanelScreen.css'
import type { CSSProperties } from 'react'
import { OnboardingSpotlight } from '../components/OnboardingSpotlight'
import { InteractiveClubScene } from '../components/InteractiveClubScene'
import type { GameState } from '../domain/gameState'
import { getClubPanelPresentation } from '../presentation/clubPanelPresentation'
import { CLUB_PANEL_SCENE_RATIO } from '../presentation/clubSceneHotspots'

type Props = {
  gameState: GameState; currentMatchday: number
  onTourComplete: () => void; onContinue: () => void
  onOpenStaff: () => void; onOpenTeam: () => void; onOpenTactics: () => void
  onOpenTraining: () => void; onOpenLeague: () => void; onOpenNextMatch: () => void
  onOpenDressingRoom: () => void
}

const TOUR_STEPS = ['CLUB_PANEL_INTRO', 'CONTINUE_EXPLANATION', 'STAFF_HIGHLIGHT', 'MESSAGES_HIGHLIGHT', 'TEAM_HIGHLIGHT', 'TACTICS_HIGHLIGHT', 'TRAINING_HIGHLIGHT', 'LOCKER_ROOM_HIGHLIGHT', 'NEXT_MATCH_HIGHLIGHT', 'LEAGUE_HIGHLIGHT', 'FIRST_TRAINING_READY']

export function ClubPanelScreen({ gameState, currentMatchday, onTourComplete, onContinue, onOpenStaff, onOpenTeam, onOpenTactics, onOpenTraining, onOpenLeague, onOpenNextMatch, onOpenDressingRoom }: Props) {
  const { onboarding } = gameState
  const panel = getClubPanelPresentation(gameState, currentMatchday)
  const tourActive = TOUR_STEPS.includes(onboarding.active)
  const objective = PANEL_OBJECTIVES[onboarding.active as keyof typeof PANEL_OBJECTIVES]

  const sceneStyle = {
    '--scene-ratio': CLUB_PANEL_SCENE_RATIO,
  } as CSSProperties
  return <section className={'club-panel-screen' + (tourActive ? ' is-touring' : '')} aria-label="Panel del club" style={sceneStyle}>
    <InteractiveClubScene panel={panel} actions={{ squad: onOpenTeam, tactics: onOpenTactics, training: onOpenTraining, 'dressing-room': onOpenDressingRoom, 'next-match': onOpenNextMatch, league: onOpenLeague, staff: onOpenStaff }} />
    {objective && !tourActive && <aside className="panel-objective"><span>PRIMER DÍA</span><p>{objective}</p></aside>}
    {onboarding.active === 'CLUB_PANEL_INTRO' && <OnboardingSpotlight title="El Panel del club" text="Esta es nuestra base de operaciones. Las camisetas llevan al Equipo; la pizarra, a Tácticas; el material, a Entrenamientos. También encontrarás Staff, Vestuario, el próximo partido y el ordenador de Competición. El teléfono está abajo a la derecha y CONTINUAR hace avanzar el tiempo." actionLabel="SEGUIR" onAction={onTourComplete} />}
    {onboarding.active === 'CONTINUE_EXPLANATION' && <OnboardingSpotlight selectors={['.global-continue']} title="Avanzar el tiempo" text="CONTINUAR hará avanzar el calendario cuando hayamos terminado lo necesario. Ahora solo continuará este recorrido." />}
    {onboarding.active === 'STAFF_HIGHLIGHT' && <OnboardingSpotlight selectors={['[data-panel-card="staff"]']} title="Primero, el Staff" text="Primero vamos a ver quién tenemos echándonos una mano. Entra en Staff desde el archivador." />}
    {onboarding.active === 'MESSAGES_HIGHLIGHT' && <OnboardingSpotlight selectors={['.club-phone-dock']} title="Manolo ha escrito" text="Manolo ya te ha escrito. Abre el teléfono de abajo a la derecha y mira qué quiere." />}
    {onboarding.active === 'TEAM_HIGHLIGHT' && <OnboardingSpotlight selectors={['[data-panel-card="squad"]']} title="Conoce la plantilla" text="Primero tenemos que saber qué jugadores hay disponibles. Las camisetas llevan a Equipo." />}
    {onboarding.active === 'TACTICS_HIGHLIGHT' && <OnboardingSpotlight selectors={['[data-panel-card="tactics"]']} title="Prepara la táctica" text="Ahora que sabemos con qué contamos, vamos a decidir cómo queremos jugar. Entra desde la pizarra." />}
    {onboarding.active === 'TRAINING_HIGHLIGHT' && <OnboardingSpotlight selectors={['[data-panel-card="training"]']} title="Prepara la semana" text="Nos queda organizar los dos entrenamientos. Entra desde la estantería del material." />}
    {onboarding.active === 'LOCKER_ROOM_HIGHLIGHT' && <OnboardingSpotlight selectors={['[data-panel-card="dressing-room"]']} mode="EXPLAIN_ONLY" title="Estado del vestuario" text="La puerta del Vestuario lleva al ambiente, cohesión, felicidad, autoridad, relaciones, expectativas y conflictos. No entraremos ahora." actionLabel="CONTINUAR TUTORIAL" onAction={onContinue} />}
    {onboarding.active === 'NEXT_MATCH_HIGHLIGHT' && <OnboardingSpotlight selectors={['[data-panel-card="next-match"]']} mode="EXPLAIN_ONLY" title="Próximo partido" text="Este papel reúne rival, fecha, localía, la información disponible y el acceso a la previa. No entraremos ahora." actionLabel="CONTINUAR TUTORIAL" onAction={onContinue} />}
    {onboarding.active === 'LEAGUE_HIGHLIGHT' && <OnboardingSpotlight selectors={['[data-panel-card="league"]']} mode="EXPLAIN_ONLY" title="Competición" text="Desde el ordenador consultarás clasificación, resultados, calendario, sanciones, goleadores y equipaciones. Bueno, ya tenemos lo importante preparado. Ahora toca conocer a los jugadores de verdad." actionLabel="CONOCER A LA PLANTILLA" onAction={onContinue} />}
    {onboarding.active === 'FIRST_TRAINING_READY' && <OnboardingSpotlight title="Todo preparado" text="Pues venga. Empezamos." actionLabel="EMPEZAR ENTRENAMIENTO" onAction={onContinue} />}
  </section>
}

const PANEL_OBJECTIVES = {
  STAFF: 'Conoce a la gente del club. Entra en Staff desde el archivador.',
  INBOX: 'Manolo ya te ha escrito. Abre el teléfono de abajo a la derecha.',
  SQUAD: 'Primero, la plantilla. Entra en Equipo desde las camisetas.',
  TACTICS: 'Decide cómo queremos jugar. Entra en Tácticas desde la pizarra.',
  TRAINING_PLANNING: 'Prepara las dos sesiones desde la estantería de Entrenamientos.',
} as const
