import { useId, type CSSProperties, type ReactNode } from 'react'
import './CorkBoard.css'

export function CorkBoard({ children, className = '', label }: { children: ReactNode; className?: string; label: string }) {
  return <section className={`cork-board ${className}`} aria-label={label}>{children}</section>
}

export function PushPin({ color = 'blue', className = '' }: { color?: 'blue' | 'red' | 'green' | 'yellow'; className?: string }) {
  return <span aria-hidden="true" className={`push-pin push-pin--${color} ${className}`} />
}

export function PinnedPaper({ children, title, className = '', rotation = 0, color = 'blue', fastening = 'pins', ruled = false }: {
  children: ReactNode; title?: string; className?: string; rotation?: number
  color?: 'blue' | 'red' | 'green' | 'yellow'; fastening?: 'pins' | 'tape'; ruled?: boolean
}) {
  const headingId = useId()
  const style = { '--paper-rotation': `${rotation}deg` } as CSSProperties
  return <section className={`pinned-paper${ruled ? ' pinned-paper--ruled' : ''} ${className}`} style={style} aria-labelledby={title ? headingId : undefined}>
    {fastening === 'pins' ? <><PushPin color={color} className="paper-pin--left" /><PushPin color={color} className="paper-pin--right" /></> : <span className="paper-tape" aria-hidden="true" />}
    {title && <h3 id={headingId} className="pinned-paper-title">{title}</h3>}
    <div className="pinned-paper-content">{children}</div>
  </section>
}
