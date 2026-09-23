import { createContext, useContext } from 'react'
import type { LineupSource } from '../domain/tacticalLineup'

export type Feedback = 'primary' | 'secondary' | 'compatible' | 'warning' | 'invalid'
export type Drag = { source: LineupSource; x: number; y: number; target?: LineupSource }
export const sameSource = (a: LineupSource, b?: LineupSource) => b && a.group === b.group && (a.group === 'field' ? a.slot === (b as typeof a).slot : a.playerId === (b as typeof a).playerId)
export const DragContext = createContext<{ drag: Drag | null; feedback: (source: LineupSource, target: LineupSource) => Feedback } | null>(null)

export function useTacticalDrop(source: LineupSource) {
  const context = useContext(DragContext)
  const drag = context?.drag
  if (!drag) return ''
  if (sameSource(source, drag.source)) return ' is-drag-source'
  return ` drop-${context.feedback(drag.source, source)}${sameSource(source, drag.target) ? ' is-drop-hover' : ''}`
}

