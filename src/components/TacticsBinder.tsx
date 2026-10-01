import { useEffect, useRef, useState } from 'react'
import type { Formation } from '../domain/models'
import { FORMATION_SLOTS } from '../domain/matchTactics'
import { TacticalPlayerCard, TacticalPhysicalIndicators } from './TacticalPlayerCard'
import { PlayerPortrait } from './PlayerPortrait'
import type { TacticalPlayerView, TacticalSelection } from './TacticalWorkspace'

type Group = 'starters' | 'bench' | 'candidates'
type Suggestion = { player: TacticalPlayerView; reason: string }
const PAGE_SIZE = 8

export function TacticsBinder({ formation, starters, bench, candidates, selection, announced, onSelectField, onSelectReserve, onOpenPlayer, benchSuggestions, candidateSuggestions, onSubstitute, onCancelSubstitution }: {
  formation: Formation; starters: (TacticalPlayerView | undefined)[]; bench: TacticalPlayerView[]; candidates: TacticalPlayerView[]
  selection: TacticalSelection; announced: boolean; onSelectField: (slot: number) => void; onSelectReserve: (id: number) => void; onOpenPlayer?: (id: number) => void
  benchSuggestions: Suggestion[]; candidateSuggestions: Suggestion[]; onSubstitute: (id: number) => void; onCancelSubstitution: () => void
}) {
  const [group, setGroup] = useState<Group>('starters')
  const [requestedPage, setRequestedPage] = useState(0)
  const binderRef = useRef<HTMLElement>(null)
  const groups: { id: Group; label: string; count: number }[] = [
    { id: 'starters', label: 'Titulares', count: starters.filter(Boolean).length },
    { id: 'bench', label: 'Suplentes', count: bench.length },
    { id: 'candidates', label: announced ? 'No convocados' : 'Plantilla', count: candidates.length },
  ]
  const entries = group === 'starters'
    ? FORMATION_SLOTS[formation].map((position, slot) => ({ position, slot, player: starters[slot] }))
    : (group === 'bench' ? bench : candidates).map((player, index) => ({ position: group === 'bench' ? `S${index + 1}` : '+', slot: -1, player }))
  const pageCount = group === 'starters' ? 1 : Math.max(1, Math.ceil(entries.length / PAGE_SIZE))
  const page = Math.min(requestedPage, pageCount - 1)
  const pageEntries = group === 'starters' ? entries : entries.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const selectedSlot = selection?.group === 'field' ? selection.slot : undefined
  const selectedStarter = selectedSlot === undefined ? undefined : starters[selectedSlot]
  const selectedStarterId = selectedStarter?.id
  const suggestions = benchSuggestions.length ? benchSuggestions : candidateSuggestions
  const fromPlantilla = benchSuggestions.length === 0

  useEffect(() => {
    if (selectedStarterId !== undefined && window.matchMedia('(max-width: 720px)').matches) binderRef.current?.scrollIntoView({ block: 'center' })
  }, [selectedStarterId])

  return <aside className="tactics-binder" aria-label="Archivador de alineación" ref={binderRef}>
    <div className="tactics-binder-tabs" role="tablist" aria-label="Grupos de jugadores">
      {groups.map(item => <button key={item.id} type="button" role="tab" aria-selected={group === item.id}
        className={group === item.id ? 'is-active' : ''} onClick={() => { setGroup(item.id); setRequestedPage(0) }}>{item.label}<span>{item.count}</span></button>)}
    </div>
    <div className="tactics-binder-cover">
      <div className="tactics-binder-rings" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
      <div className="tactics-binder-sheet">
        <header><strong>{groups.find(item => item.id === group)?.label}</strong>{group !== 'starters' && <span>{page + 1} / {pageCount}</span>}</header>
        <div className="tactics-binder-pockets lineup-list-scroll">
          {pageEntries.map(({ player, position, slot }) => <div className="tactics-binder-pocket" key={slot >= 0 ? `field-${slot}` : player!.id}>
            {player ? <TacticalPlayerCard variant="album" player={player} position={slot >= 0 ? position : undefined} rowLabel={position}
              source={slot >= 0 ? { group: 'field', slot } : { group: 'reserve', playerId: player.id }}
              selected={slot >= 0 ? selection?.group === 'field' && selection.slot === slot : selection?.group === 'reserve' && selection.playerId === player.id}
              onSelect={() => slot >= 0 ? onSelectField(slot) : onSelectReserve(player.id)} onOpenPlayer={slot >= 0 ? undefined : onOpenPlayer} />
              : <button className="tactics-binder-empty" type="button" data-lineup-source={JSON.stringify({ group: 'field', slot })} onClick={() => onSelectField(slot)}>{position}<span>Sin jugador</span></button>}
          </div>)}
          {group === 'starters' && <div className="tactics-binder-pocket tactics-binder-pocket--spare" aria-hidden="true" />}
          {pageEntries.length === 0 && <p className="tactics-binder-note">{group === 'bench' ? (announced ? 'Sin suplentes convocados.' : 'Aún no hay suplentes asignados.') : 'No hay jugadores en este grupo.'}</p>}
        </div>
      </div>
      {selectedStarter && selectedSlot !== undefined && <section className="tactics-substitution-sheet" aria-label={`Sustituir a ${selectedStarter.name}`}>
        <header><div><small>CAMBIO EN EL ONCE · {FORMATION_SLOTS[formation][selectedSlot]}</small><h3>Sustituir a {selectedStarter.name}</h3></div><button type="button" onClick={onCancelSubstitution} aria-label="Cancelar sustitución">×</button></header>
        <div className="tactics-substitution-current"><PlayerPortrait player={selectedStarter} /><div><strong>{selectedStarter.name}</strong><span>{FORMATION_SLOTS[formation][selectedSlot]} · titular</span><TacticalPhysicalIndicators indicators={selectedStarter.cardIndicators} /></div></div>
        {onOpenPlayer && <button className="tactics-substitution-profile" type="button" onClick={() => onOpenPlayer(selectedStarter.id)}>Ver ficha completa →</button>}
        <p className="tactics-substitution-source">{fromPlantilla ? 'Sin suplentes disponibles · jugadores elegibles de la plantilla' : 'Suplentes disponibles, ordenados para este puesto'}</p>
        <div className="tactics-substitution-options">
          {suggestions.map(({ player, reason }, index) => <div className="tactics-substitution-entry" key={player.id}>
            <button type="button" className="tactics-substitution-option" onClick={() => onSubstitute(player.id)}>
              <PlayerPortrait player={player} /><span className="tactics-substitution-option-copy"><strong>{player.name}</strong><small>{player.primaryPosition} · {reason}</small>{index === 0 && <em>Recomendado</em>}</span><TacticalPhysicalIndicators indicators={player.cardIndicators} />
            </button>
            {onOpenPlayer && <button className="tactics-substitution-option-profile" type="button" onClick={() => onOpenPlayer(player.id)} aria-label={`Ver ficha completa de ${player.name}`}>Ficha</button>}
          </div>)}
          {suggestions.length === 0 && <p className="tactics-substitution-empty">{announced
            ? 'No hay suplentes elegibles para este puesto. Los no convocados se pueden consultar en su pestaña, pero no pueden entrar en este partido.'
            : 'No hay jugadores elegibles para este cambio. Consulta la plantilla y su disponibilidad.'}</p>}
        </div>
        <button className="tactics-substitution-cancel" type="button" onClick={onCancelSubstitution}>Cancelar</button>
      </section>}
    </div>
    {group !== 'starters' && <nav className="tactics-binder-pages" aria-label="Páginas del archivador">
      <button type="button" disabled={page === 0} onClick={() => setRequestedPage(page - 1)}>← Anterior</button>
      <span>Página {page + 1} de {pageCount}</span>
      <button type="button" disabled={page >= pageCount - 1} onClick={() => setRequestedPage(page + 1)}>Siguiente →</button>
    </nav>}
  </aside>
}
