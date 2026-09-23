export type StatusTone = 'positive' | 'neutral' | 'warning' | 'negative' | 'info'

// Visual translation of existing labels. No new domain thresholds or effects.
const statusTones: Readonly<Record<string, StatusTone>> = {
  'Muy alta': 'positive', Alta: 'positive', Excelente: 'positive', Bueno: 'positive',
  Respetada: 'positive', 'Muy respetada': 'positive', Aceptada: 'info',
  'Muy buena': 'positive', Buena: 'positive', 'Muy feliz': 'positive', Feliz: 'positive',
  'Muy contento': 'positive', Contento: 'positive',
  'Te respeta': 'positive', 'Te respeta mucho': 'positive',
  Normal: 'neutral', Neutral: 'neutral', Conforme: 'neutral',
  Baja: 'warning', Malo: 'warning', Mala: 'warning', Cuestionada: 'warning',
  Descontento: 'warning', 'Te cuestiona': 'warning',
  'Muy baja': 'negative', 'Muy malo': 'negative', 'Muy mala': 'negative',
  'Muy cuestionada': 'negative', 'Muy descontento': 'negative', 'Te cuestiona mucho': 'negative',
}

export const getManagementStatusTone = (label: string): StatusTone => statusTones[label] ?? 'neutral'

/** All status bars share the same coarse 0–100 scale; never expose exact state. */
export function getApproximateStatusLevel(level: number) {
  return Number.isFinite(level) ? Math.round(Math.max(0, Math.min(100, level)) / 10) * 10 : 0
}
