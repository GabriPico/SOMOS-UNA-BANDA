import type { ClubKit, LeagueTeam } from './models'

/** Existing fictional crest palettes; kits and crests share one visual identity. */
const PALETTES = [['#174f7c', '#edc34d'], ['#ab283f', '#f5e5d2'], ['#287050', '#f4f2df'], ['#275ba5', '#ffffff'], ['#dfbd42', '#263548'], ['#693b77', '#f6e5c4']]
export function getClubPalette(teamId: string) {
  const index = [...teamId].reduce((sum, letter) => sum + letter.charCodeAt(0), 0) % PALETTES.length
  return teamId === 'fc-poblenou' ? PALETTES[0] : PALETTES[index]
}
export function getClubKits(team: LeagueTeam): { home: ClubKit; away: ClubKit } {
  if (team.kits) return team.kits
  const [primary, secondary] = getClubPalette(team.id)
  // Presentation defaults for fictional clubs, not sporting or historical facts.
  return {
    home: { shirt: primary, trim: '#ffffff', shorts: primary, socks: primary, pattern: 'stripes' },
    away: { shirt: '#ffffff', trim: secondary, shorts: primary, socks: '#ffffff', pattern: 'plain' },
  }
}
