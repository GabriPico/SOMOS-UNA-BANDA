import { useEffect, useId, useRef, useState } from 'react'
import type { GameState } from '../domain/gameState'
import type { LeagueMatch } from '../domain/models'
import { OFFICIAL_SQUAD_MIN, OFFICIAL_SQUAD_MAX } from '../domain/squadSelection'
import { PinnedPaper } from './CorkBoard'
import { SquadSelectionSection } from './NextMatchSquadSelection'

export function NextMatchSquadPaper({ gameState, match, onAnnounce }: { gameState: GameState; match: LeagueMatch; onAnnounce: (playerIds: number[]) => string[] }) {
  const [open, setOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const announced = gameState.squadSelections[match.id]
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal()
    else if (!open && dialog.current?.open) dialog.current.close()
  }, [open])
  return <>
    <PinnedPaper title="Convocatoria" className="call-up-paper" rotation={0.7} color="green">
      <p>{announced ? `${announced.playerIds.length} jugadores · Lista anunciada` : `Lista de ${OFFICIAL_SQUAD_MIN} a ${OFFICIAL_SQUAD_MAX} jugadores`}</p>
      <button type="button" className="board-paper-link" onClick={() => setOpen(true)}>{announced ? 'Consultar convocatoria' : 'Preparar convocatoria'} →</button>
    </PinnedPaper>
    <dialog ref={dialog} className="squad-paper-dialog" aria-labelledby={titleId} onClose={() => setOpen(false)}>
      <PinnedPaper className="squad-paper-expanded" rotation={0}>
        <div className="squad-paper-dialog-heading"><h2 id={titleId}>Convocatoria</h2><button type="button" className="board-paper-link" onClick={() => setOpen(false)}>Cerrar ×</button></div>
        <SquadSelectionSection key={match.id} gameState={gameState} match={match} onAnnounce={onAnnounce} />
      </PinnedPaper>
    </dialog>
  </>
}
