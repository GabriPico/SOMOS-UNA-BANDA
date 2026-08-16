import type { ActiveSanction, LeagueSanction, Player, RivalPlayer } from './models'

const USER_TEAM_ID = 'fc-poblenou'

export function getSanctionsForMatchday(sanctions: LeagueSanction[], matchday: number): ActiveSanction[] {
  return sanctions
    .filter((sanction) => matchday >= sanction.startMatchday && matchday < sanction.startMatchday + sanction.matches)
    .map((sanction) => ({ ...sanction, remainingMatches: sanction.startMatchday + sanction.matches - matchday }))
}

export function validateSanctionPlayers(sanctions: LeagueSanction[], clubPlayers: Player[], rivalPlayers: RivalPlayer[]): string[] {
  const playerTeams = new Map<number, string>()
  clubPlayers.forEach((player) => playerTeams.set(player.id, USER_TEAM_ID))
  rivalPlayers.forEach((player) => playerTeams.set(player.id, player.teamId))
  return sanctions
    .filter((sanction) => playerTeams.get(sanction.playerId) !== sanction.teamId)
    .map((sanction) => `Jugador o equipo incoherente en la sanción ${sanction.id}`)
}
