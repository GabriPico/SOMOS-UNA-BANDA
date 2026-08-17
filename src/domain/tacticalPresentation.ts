export function familiarityLabel(value: number) {
  return value >= 80 ? 'Muy alta' : value >= 65 ? 'Alta' : value >= 45 ? 'Media' : value >= 25 ? 'Baja' : 'Muy baja'
}

export function matchPerformancePresentation(value: number) {
  const score = value >= 59 ? 8 + (value - 59) * .08 : value >= 54 ? 7 + (value - 54) * .2 : value >= 47 ? 6.5 + (value - 47) / 14 : value >= 42 ? 6 + (value - 42) * .1 : 5.9 - (42 - value) * .08
  const rounded = Math.max(4, Math.min(10, score))
  return { score: rounded.toFixed(1), label: rounded >= 8 ? 'Excelente' : rounded >= 7 ? 'Bien' : rounded >= 6.5 ? 'Correcto' : rounded >= 6 ? 'Flojo' : 'Mal' }
}

export function conditionPresentation(label: string) {
  return { label, level: ({ Fresco: 4, Bien: 3, 'Cansándose': 2, Cansado: 1, 'Muy cansado': 0 } as Record<string,number>)[label] ?? 2 }
}

export function moodPresentation(mood: string, label: string) {
  const icon = mood === 'CONFIDENT' ? '🙂' : mood === 'MOTIVATED' ? '🔥' : mood === 'FRUSTRATED' ? '😠' : mood === 'NERVOUS' || mood === 'DISCONNECTED' ? '😟' : '😐'
  return { icon, label: label === '—' ? 'Neutral' : label }
}
