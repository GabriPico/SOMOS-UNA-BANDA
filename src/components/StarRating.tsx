import { formatQualityStars, getQualityStars } from '../domain/playerPresentation'

export function StarRating({ value, className }: { value: number; className?: string }) {
  const stars = getQualityStars(value)
  const label = `${stars.toLocaleString('es-ES')} estrellas`
  return <span className={className ? `star-rating ${className}` : 'star-rating'} aria-label={label} title={label}>{formatQualityStars(stars)}</span>
}
