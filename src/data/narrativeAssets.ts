import type { NarrativeBackgroundAsset, NarrativeBackgroundId, NarrativeCharacterAsset } from '../domain/narrative'

export const characterAssets: Record<string, NarrativeCharacterAsset> = {
  captain: { id: 'captain', name: 'CAPITÁN', portraits: {} },
  javi: { id: 'javi', name: 'JAVI', portraits: {} },
  'manolo-escudero': { id: 'manolo-escudero', name: 'MANOLO ESCUDERO', portraits: { NEUTRAL: '', HAPPY: '', ANGRY: '', WORRIED: '', SURPRISED: '' } },
  sito: { id: 'sito', name: 'SITO', portraits: {} },
}

export const backgroundAssets: Record<NarrativeBackgroundId, NarrativeBackgroundAsset> = {
  LOCKER_ROOM: { id: 'LOCKER_ROOM', label: 'VESTUARIO' },
  CLUB_OFFICE: { id: 'CLUB_OFFICE', label: 'OFICINA DEL CLUB' },
  FOOTBALL_FIELD: { id: 'FOOTBALL_FIELD', label: 'CAMPO DE FÚTBOL' },
  BENCH: { id: 'BENCH', label: 'BANQUILLO' },
  CORRIDOR: { id: 'CORRIDOR', label: 'PASILLO DE VESTUARIOS' },
  CLUB_ROOM: { id: 'CLUB_ROOM', label: 'DEPENDENCIAS DEL CLUB' },
}
