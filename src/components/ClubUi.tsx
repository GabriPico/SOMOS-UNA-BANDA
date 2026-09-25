import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { ManagementIcon, type ManagementIconName } from './ManagementIcon'
export function PageTitle({ title, subtitle, actions, className = '' }: { title: string; subtitle?: ReactNode; actions?: ReactNode; className?: string }) {
  return <header className={`page-title ${className}`}><div className="page-title-copy"><h2>{title}</h2>{subtitle && <div className="page-title-subtitle">{subtitle}</div>}</div>{actions && <div className="page-title-actions">{actions}</div>}</header>
}
export function Card({ children, className = '', ...props }: HTMLAttributes<HTMLElement>) {
  return <section {...props} className={`club-card ${className}`}>{children}</section>
}
export function PrimaryButton({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" {...props} className={`club-primary-button ${className}`}>{children}</button>
}
export function ScreenPreviewCard({ title, icon, preview, description, summary, className = '', ...props }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title' | 'children'> & { title: string; icon: ManagementIconName; preview: ReactNode; description: string; summary?: ReactNode }) {
  return <button type="button" {...props} className={`club-card club-interactive-card screen-preview-card ${className}`}>
    <span className="screen-preview-heading"><ManagementIcon name={icon} /><strong>{title}</strong></span>
    <span className="screen-preview-graphic" aria-hidden="true">{preview}</span>
    <span className="screen-preview-summary">{summary}</span>
    <span className="screen-preview-description">{description}</span>
    <span className="screen-preview-cta">Ver pantalla <ManagementIcon name="arrow" /></span>
  </button>
}
