import { useEffect } from 'react'
import './OnboardingSpotlight.css'

export type SpotlightMode = 'NAVIGATE_TO_TARGET' | 'EXPLAIN_ONLY'
type Props = { selectors?: string[]; title: string; text: string; mode?: SpotlightMode; actionLabel?: string; onAction?: () => void }

export function OnboardingSpotlight({ selectors = [], title, text, mode = 'NAVIGATE_TO_TARGET', actionLabel, onAction }: Props) {
  const selectorKey = selectors.join('|')
  useEffect(() => {
    const targets = selectorKey ? selectorKey.split('|').flatMap((selector) => [...document.querySelectorAll<HTMLElement>(selector)]) : []
    targets.forEach((target) => target.classList.add('onboarding-spotlight-target', mode === 'EXPLAIN_ONLY' ? 'is-explanation-only' : 'is-navigation-target'))
    return () => targets.forEach((target) => target.classList.remove('onboarding-spotlight-target', 'is-explanation-only', 'is-navigation-target'))
  }, [mode, selectorKey])

  return <div className={`onboarding-spotlight${selectors.length ? ' has-target' : ' no-target'}`} role="dialog" aria-modal="true" aria-label={title}>
    <div className="onboarding-spotlight-scrim" />
    <aside className="onboarding-spotlight-dialog">
      <span>PRIMER DÍA</span>
      <h2>{title}</h2>
      <p>{text}</p>
      {actionLabel && onAction && <button type="button" className="primary-action" onClick={onAction}>{actionLabel}</button>}
    </aside>
  </div>
}
