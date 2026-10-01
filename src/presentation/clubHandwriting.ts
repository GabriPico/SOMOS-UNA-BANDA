/** Pen gestures for the physical scene headings, in a 24-unit writing line.
 * Open joins and alternate repeated letters are intentional, not font outlines.
 * All variation is fixed artwork: navigating never changes the handwriting. */
type PenLetter = { advance: number; strokes: string[][] }
const LETTERS: Record<string, PenLetter> = {
  T: { advance: 17, strokes: [['M1 3 Q8 2 16 3', 'M9 3 Q8 12 7 23']] },
  E: { advance: 15, strokes: [['M14 3 L4 4 Q3 12 2 23 L13 22', 'M4 12 L11 12']] },
  P: { advance: 15, strokes: [['M3 23 Q4 13 4 3 C18 0 18 14 4 13']] },
  C: { advance: 17, strokes: [['M16 5 C6 -1 0 9 2 18 Q5 27 15 21']] },
  S: { advance: 15, strokes: [['M14 5 C10 -1 1 3 3 9 C4 13 15 12 13 19 Q9 26 1 21']] },
  A: { advance: 16, strokes: [['M1 23 Q6 11 9 3 L15 24', 'M4 16 L12 15']] },
  I: { advance: 7, strokes: [['M4 3 Q3 12 3 23']] },
  M: { advance: 20, strokes: [['M1 23 L3 3 L10 16 L18 3 L18 24']] },
  N: { advance: 17, strokes: [['M2 23 L3 3 Q10 14 14 23 L15 2']] },
  O: { advance: 17, strokes: [['M9 3 C-1 1 -1 23 7 24 C19 26 22 1 9 3']] },
  R: { advance: 16, strokes: [['M2 24 L4 3 C18 0 19 14 4 13', 'M7 13 L15 24']] },
  a: { advance: 12, strokes: [
    ['M10 11 C3 7 -1 18 3 22 Q8 25 10 12 Q9 19 11 23'],
    ['M10 12 Q5 7 2 15 Q-1 23 5 23 Q9 23 10 12 L10 23'],
  ] },
  c: { advance: 11, strokes: [['M10 11 Q3 7 1 16 Q0 25 10 21']] },
  d: { advance: 13, strokes: [['M10 12 C3 7 -1 19 3 22 Q9 26 11 5 L12 1 Q9 16 11 23']] },
  e: { advance: 11, strokes: [
    ['M1 16 Q12 16 9 11 Q4 7 1 16 Q-1 25 10 21'],
    ['M1 17 Q13 14 8 10 C3 7 -2 22 4 23 L10 21'],
  ] },
  f: { advance: 10, strokes: [['M10 3 Q4 -1 4 8 L2 25', 'M0 12 L9 11']] },
  i: { advance: 6, strokes: [['M3 11 L2 23', 'M4 5 L4.4 5.3']] },
  l: { advance: 6, strokes: [['M4 2 Q2 15 2 22 L4 23']] },
  m: { advance: 19, strokes: [['M2 12 L1 23 Q3 9 8 11 Q11 12 8 23 Q11 8 16 12 Q18 15 16 23']] },
  n: { advance: 13, strokes: [
    ['M2 11 L1 23 Q4 8 9 11 Q12 13 10 23'],
    ['M1 23 L3 11 L2 17 Q8 6 10 13 L10 23'],
  ] },
  o: { advance: 12, strokes: [
    ['M8 10 C0 8 -1 22 5 23 C12 24 14 10 7 10'],
    ['M9 11 Q1 7 1 18 Q1 26 8 22 Q14 17 9 11'],
  ] },
  p: { advance: 13, strokes: [['M3 11 L1 30 M3 15 Q9 6 12 14 Q14 25 3 22']] },
  r: { advance: 10, strokes: [['M2 11 L1 23 M2 17 Q5 9 10 11']] },
  s: { advance: 10, strokes: [['M9 11 Q2 7 2 13 Q2 16 7 17 Q12 23 1 23']] },
  t: { advance: 9, strokes: [['M5 4 Q2 15 3 22 Q4 24 8 21', 'M0 12 L9 11']] },
  x: { advance: 12, strokes: [['M2 11 Q5 17 10 23', 'M10 10 Q6 17 1 23']] },
  ' ': { advance: 7, strokes: [[]] },
}
const ACCENTS: Record<string, string> = { á: 'a', ó: 'o', Á: 'A' }
const BASELINES = [0, 1.15, -.7, .6, -.9, 1.2, .15, -.5, .95, -.35, .75, -1, .3]
const TILTS = [-2.8, 3, -1.2, 4, -2.2, .8, 3.4, -2.6, 1.3, -1.7]

export function getHeadingPenStrokes(text: string) {
  let cursor = 2
  const letters = Array.from(text, (letter, index) => {
    const glyph = LETTERS[ACCENTS[letter] ?? letter]
    const strokes = [...glyph.strokes[index % glyph.strokes.length]]
    if (ACCENTS[letter]) strokes.push(letter === 'Á' ? 'M7 -2 L11 -6' : 'M5 6 L9 2')
    const result = {
      strokes,
      transform: `translate(${cursor} ${BASELINES[index % BASELINES.length]}) rotate(${TILTS[index % TILTS.length]} 5 17) scale(${index % 4 === 1 ? .96 : 1} ${index % 5 === 2 ? .94 : 1})`,
      pressure: [1, .88, 1.08, .95, 1.03][index % 5],
    }
    cursor += glyph.advance + [0, -.35, .5, -.1, .25][index % 5]
    return result
  })
  return { letters, width: cursor + 2 }
}

export const CLUB_HANDWRITTEN_HEADINGS = [
  { text: 'TÁCTICAS', x: 651, y: 250, width: 136, height: 32, angle: -.5, ink: '#203b52', weight: 2.35 },
  { text: 'ENTRENAMIENTOS', x: 883, y: 219, width: 113, height: 25, angle: -.5, ink: '#263e53', weight: 1.8 },
  { text: 'Próximo partido', x: 1434, y: 195, width: 167, height: 27, angle: -.4, ink: '#263d53', weight: 1.85 },
  { text: 'Staff', x: 442, y: 671, width: 42, height: 26, angle: -4, ink: '#423324', weight: 1.5 },
] as const
