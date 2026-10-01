import { Activity, useLayoutEffect, useRef, useState } from 'react'
import type { CompetitionPortalData, CompetitionTab } from '../domain/competitionPortal'
import { getMatchReport } from '../domain/matchReport'
import type { GameState } from '../domain/gameState'
import type { Player, RivalPlayer } from '../domain/models'
import { MatchdaySelector } from './MatchdaySelector'
import { MatchReportScreen } from '../screens/MatchReportScreen'
import { CompetitionHeader } from './CompetitionHeader'
import { LeagueTabs } from './LeagueTabs'
import { StandingsTable, ScorersTable, SanctionsTable } from './competition/CompetitionTables'
import { CalendarView, ResultsView } from './competition/CompetitionFixtures'
import { ClubProfile, KitsView } from './competition/ClubProfile'
import '../styles/federationPortal.css'

type Destination = { kind: 'club' | 'match'; id: string }
type Props = {
  data: CompetitionPortalData; game: GameState; players: Player[]; rivals: RivalPlayer[]
  compact?: boolean; initialTab?: CompetitionTab; onBack?: () => void
  initialMatchday?: number; initialFriendly?: boolean
  onSelectionChange?: (tab: CompetitionTab, matchday: number, friendly: boolean) => void
}

/** Every navigation stays inside this portal, including the phone's club sheets and actas. */
export function CompetitionPortal({ data, game, players, rivals, compact = false, initialTab = 'standings', initialMatchday, initialFriendly = false, onBack, onSelectionChange }: Props) {
  const [tab, setTab] = useState(initialTab)
  const [matchday, setMatchday] = useState(initialMatchday && data.matchdays.includes(initialMatchday) ? initialMatchday : Math.max(1, data.currentMatchday))
  const [friendly, setFriendly] = useState(initialFriendly)
  const [history, setHistory] = useState<Destination[]>([])
  const root = useRef<HTMLElement>(null)
  const sourcePositions = useRef<{ scroll: number; window: number; focus: HTMLElement | null }[]>([])
  const restorePosition = useRef(false)
  const view = history.at(-1)

  useLayoutEffect(() => {
    if (restorePosition.current) {
      const position = sourcePositions.current.pop()
      if (position) {
        if (root.current) root.current.scrollTop = position.scroll
        if (!compact) window.scrollTo(0, position.window)
        position.focus?.focus({ preventScroll: true })
      }
      restorePosition.current = false
    } else if (view) {
      if (root.current) root.current.scrollTop = 0
      if (!compact) window.scrollTo(0, 0)
      root.current?.querySelector<HTMLElement>('.federation-breadcrumb button, .federation-report-back')?.focus({ preventScroll: true })
    }
  }, [view, compact])

  function open(kind: Destination['kind'], id: string) {
    if (view?.kind === kind && view.id === id) return
    sourcePositions.current.push({ scroll: root.current?.scrollTop ?? 0, window: window.scrollY, focus: document.activeElement instanceof HTMLElement ? document.activeElement : null })
    setHistory(previous => [...previous, { kind, id }])
  }
  function back() { restorePosition.current = true; setHistory(previous => previous.slice(0, -1)) }
  function select(nextTab = tab, nextMatchday = matchday, nextFriendly = friendly) {
    setTab(nextTab); setMatchday(nextMatchday); setFriendly(nextFriendly)
    onSelectionChange?.(nextTab, nextMatchday, nextFriendly)
  }
  const actions = { onOpenClub: (id: string) => open('club', id), onOpenMatch: (id: string) => open('match', id) }
  return <section ref={root} className={`federation-portal${compact ? ' federation-portal--compact' : ''}`} aria-label={compact ? 'FCF en el teléfono' : 'Competición'}>
    <CompetitionHeader data={data} compact={compact} onBack={onBack} />
    <Activity mode={view ? 'hidden' : 'visible'}><div className="federation-page">
      <LeagueTabs activeTab={tab} onSelect={next => select(next)} />
      {((tab === 'results' && !friendly) || tab === 'sanctions') && <MatchdaySelector currentMatchday={data.currentMatchday} selectedMatchday={matchday} totalMatchdays={data.matchdays.length} onSelect={next => select(tab, next)} allowFuture />}
      <div className="federation-tab-content" key={tab}>
        {tab === 'standings' && <StandingsTable data={data} onOpenClub={actions.onOpenClub} />}
        {tab === 'results' && <ResultsView data={data} matchday={matchday} friendly={friendly} onFriendlyChange={next => select(tab, matchday, next)} {...actions} />}
        {tab === 'calendar' && <CalendarView data={data} {...actions} />}
        {tab === 'sanctions' && <SanctionsTable data={data} matchday={matchday} onOpenClub={actions.onOpenClub} />}
        {tab === 'scorers' && <ScorersTable data={data} onOpenClub={actions.onOpenClub} />}
        {tab === 'kits' && <KitsView data={data} onOpenClub={actions.onOpenClub} />}
      </div>
    </div></Activity>
    {history.map((destination, index) => {
      const reportMatch = destination.kind === 'match' ? data.matches.find(match => match.id === destination.id) : undefined
      return <Activity key={`${index}:${destination.kind}:${destination.id}`} mode={index === history.length - 1 ? 'visible' : 'hidden'}><div className="federation-page">
      {destination.kind === 'club' && <ClubProfile data={data} clubId={destination.id} onBack={back} {...actions} />}
      {destination.kind === 'match' && reportMatch && <div className="federation-report"><button type="button" className="federation-back federation-report-back" onClick={back}>← Volver</button><MatchReportScreen embedded match={reportMatch} report={getMatchReport(reportMatch, game.matchReports, game.goalEvents, players, rivals)} onBack={back} onOpenClub={actions.onOpenClub} /></div>}
    </div></Activity>
    })}
  </section>
}
