import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import type { LineupSource } from '../domain/tacticalLineup'
import { PlayerPortrait } from './PlayerPortrait'
import type { TacticalCardPlayer } from './TacticalPlayerCard'

import { DragContext, sameSource, type Drag, type Feedback } from './tacticalDragContext'

function sourceAt(x: number, y: number): LineupSource | undefined {
  const element = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-lineup-source]')
  if (element?.dataset.lineupSource) return JSON.parse(element.dataset.lineupSource)
}

/** One pointer interaction for the pitch and list; the domain owns all moves. */
export function TacticalDrag({ children, onMove, feedback, getPlayer }: {
  children: ReactNode; onMove: (source: LineupSource, target: LineupSource) => void
  feedback: (source: LineupSource, target: LineupSource) => Feedback
  getPlayer: (source: LineupSource) => TacticalCardPlayer | undefined
}) {
  const [drag, setDrag] = useState<Drag | null>(null)
  const pending = useRef<{ source: LineupSource; x: number; y: number; pointerId: number; element: HTMLElement; active: boolean } | null>(null)
  const suppressClick = useRef(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!drag) return
    let frame: number
    const scroll = () => {
      const list = root.current?.querySelector('.lineup-list-scroll')
      const bounds = list?.getBoundingClientRect()
      if (list && bounds && drag.x >= bounds.left && drag.x <= bounds.right && drag.y >= bounds.top && drag.y <= bounds.bottom) {
        const amount = drag.y < bounds.top + 32 ? -8 : drag.y > bounds.bottom - 32 ? 8 : 0
        if (amount) list.scrollTop += amount
      }
      frame = requestAnimationFrame(scroll)
    }
    frame = requestAnimationFrame(scroll)
    const cancel = (event: KeyboardEvent) => { if (event.key === 'Escape') { pending.current = null; setDrag(null) } }
    window.addEventListener('keydown', cancel)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('keydown', cancel) }
  }, [drag])

  const start = (event: PointerEvent<HTMLDivElement>) => {
    suppressClick.current = false
    if (event.button !== 0 || !event.isPrimary) return
    const element = (event.target as HTMLElement).closest<HTMLElement>('[data-lineup-source]')
    if (!element?.dataset.lineupSource || element.dataset.dragDisabled === 'true') return
    const source: LineupSource = JSON.parse(element.dataset.lineupSource)
    if (!getPlayer(source)) return
    pending.current = { source, x: event.clientX, y: event.clientY, pointerId: event.pointerId, element, active: false }
  }
  const move = (event: PointerEvent<HTMLDivElement>) => {
    const state = pending.current
    if (!state || state.pointerId !== event.pointerId) return
    if (!state.active && Math.hypot(event.clientX - state.x, event.clientY - state.y) < 7) return
    if (!state.active) { state.active = true; state.element.setPointerCapture(event.pointerId) }
    event.preventDefault()
    suppressClick.current = true
    setDrag({ source: state.source, x: event.clientX, y: event.clientY, target: sourceAt(event.clientX, event.clientY) })
  }
  const finish = (event: PointerEvent<HTMLDivElement>, cancelled = false) => {
    const state = pending.current
    pending.current = null
    setDrag(null)
    if (!state?.active) return
    if (state.element.hasPointerCapture(event.pointerId)) state.element.releasePointerCapture(event.pointerId)
    const target = sourceAt(event.clientX, event.clientY)
    if (!cancelled && target && !sameSource(state.source, target)) onMove(state.source, target)
  }
  const player = drag && getPlayer(drag.source)
  return <DragContext.Provider value={{ drag, feedback }}><div ref={root} className={`tactics-visual-layout${drag ? ' is-dragging' : ''}`}
    onPointerDown={start} onPointerMove={move} onPointerUp={event => finish(event)} onPointerCancel={event => finish(event, true)}
    onClickCapture={event => {
      if (!suppressClick.current) return
      suppressClick.current = false
      // Touch drags may emit no trailing click; keep keyboard activation available.
      if (event.detail > 0) { event.preventDefault(); event.stopPropagation() }
    }}
    onDragStart={event => event.preventDefault()}>
    {children}
    {drag && player && <div className="tactical-drag-preview" style={{ left: Math.min(drag.x + 14, window.innerWidth - 194), top: Math.min(drag.y + 14, window.innerHeight - 66) }} aria-hidden="true">
      <PlayerPortrait player={player} /><div><strong>{player.name}</strong><small>{player.positions}</small></div>
    </div>}
  </div></DragContext.Provider>
}
