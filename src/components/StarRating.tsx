import { getQualityStars } from '../domain/playerPresentation'

export function RatingStars({ stars, className = '', label }: { stars: number; className?: string; label?: string }) {
  const description = `${label ? `${label}: ` : ''}${stars.toLocaleString('es-ES')} estrellas`
  return <span className={`star-rating ${className}`} role="img" aria-label={description} title={description}>
    <span className="rating-stars-track" aria-hidden="true">★★★★★<span className="rating-stars-fill" style={{ width: `${stars * 20}%` }}>★★★★★</span></span>
  </span>
}

export function StarRating({ value, className }: { value: number; className?: string }) {
  return <RatingStars stars={getQualityStars(value)} className={className} />
}
