import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './ContextualTour.css'

export type ContextualTourStep = { selector: string; title: string; text: string; placement?: 'target' | 'viewport' }

type Props = {
  steps: readonly ContextualTourStep[]
  step: number
  onStepChange: (step: number) => void
  onComplete: () => void
  skipLabel?: string
}

export function ContextualTour({ steps, step, onStepChange, onComplete, skipLabel = 'SALTAR INTRODUCCIÓN' }: Props) {
  const safeStep = Math.min(Math.max(0, step), steps.length - 1)
  const item = steps[safeStep]
  const tooltipRef = useRef<HTMLElement>(null)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)

  useLayoutEffect(() => {
    const target = document.querySelector<HTMLElement>(item.selector)
    if (!target) return
    document.querySelectorAll('.contextual-tour-highlight').forEach((element) => element.classList.remove('contextual-tour-highlight'))
    target.classList.add('contextual-tour-highlight')
    setPosition(null)
    if (item.placement !== 'viewport') target.scrollIntoView({ behavior: 'smooth', block: 'center' })

    let frame = 0
    const measurePosition = () => {
      const tooltip = tooltipRef.current
      if (!tooltip) return
      const targetRect = target.getBoundingClientRect()
      const tooltipRect = tooltip.getBoundingClientRect()
      const viewportMargin = 16
      const elementGap = 16
      const viewportPosition = {
        top: Math.max(viewportMargin, (window.innerHeight - tooltipRect.height) / 2),
        left: Math.max(viewportMargin, (window.innerWidth - tooltipRect.width) / 2),
      }
      if (item.placement === 'viewport' || targetRect.bottom <= 0 || targetRect.top >= window.innerHeight || targetRect.right <= 0 || targetRect.left >= window.innerWidth) {
        setPosition(viewportPosition)
        return
      }
      const centeredLeft = Math.min(window.innerWidth - viewportMargin - tooltipRect.width, Math.max(viewportMargin, targetRect.left + (targetRect.width - tooltipRect.width) / 2))
      const centeredTop = Math.min(window.innerHeight - viewportMargin - tooltipRect.height, Math.max(viewportMargin, targetRect.top + (targetRect.height - tooltipRect.height) / 2))
      const candidates = [
        { top: targetRect.bottom + elementGap, left: centeredLeft },
        { top: targetRect.top - elementGap - tooltipRect.height, left: centeredLeft },
        { top: centeredTop, left: targetRect.right + elementGap },
        { top: centeredTop, left: targetRect.left - elementGap - tooltipRect.width },
      ]
      setPosition(candidates.find(({ top, left }) => top >= viewportMargin && left >= viewportMargin && top + tooltipRect.height <= window.innerHeight - viewportMargin && left + tooltipRect.width <= window.innerWidth - viewportMargin) ?? viewportPosition)
    }
    const updatePosition = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measurePosition)
    }
    const resizeObserver = new ResizeObserver(updatePosition)
    resizeObserver.observe(target)
    if (tooltipRef.current) resizeObserver.observe(tooltipRef.current)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    measurePosition()
    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
      target.classList.remove('contextual-tour-highlight')
    }
  }, [item.selector, item.placement])

  return createPortal(<div className="contextual-tour-layer" role="dialog" aria-modal="true" aria-label={`Introducción: ${item.title}`}>
    <div className="contextual-tour-scrim" />
    <aside ref={tooltipRef} className="contextual-tour-tooltip" style={position ? { top: position.top, left: position.left } : { visibility: 'hidden' }}>
      <small>{safeStep + 1} / {steps.length}</small>
      <h2>{item.title}</h2>
      <p>{item.text}</p>
      <div><button type="button" className="contextual-tour-skip" onClick={onComplete}>{skipLabel}</button><button type="button" className="primary-action" onClick={() => safeStep === steps.length - 1 ? onComplete() : onStepChange(safeStep + 1)}>{safeStep === steps.length - 1 ? 'TERMINAR' : 'SIGUIENTE'}</button></div>
    </aside>
  </div>, document.body)
}
