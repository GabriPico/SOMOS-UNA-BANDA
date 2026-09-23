import type { Formation, Player, PlayerPosition } from './models'
import { FORMATION_SLOTS } from './matchTactics'
import { calculateTacticalRating, getPositionFamiliarity } from './positionFamiliarity'

export type LineupPlayerScore = (player: Player, position: PlayerPosition, slot: number) => number

const familiarityCost = (player: Player, position: PlayerPosition) => {
  const familiarity = getPositionFamiliarity(player, position)
  if (familiarity === 'PREFERRED') return 0
  if (familiarity === 'COMPATIBLE') return 1_000_000
  return 1_000_000_000
}

/**
 * Asigna jugadores a los slots de forma global. La adecuación posicional es
 * lexicográficamente anterior a cualquier diferencia de valoración deportiva.
 */
export function selectLineupForFormation(
  players: Player[],
  formation: Formation,
  scorePlayer: LineupPlayerScore = (player, position) => calculateTacticalRating(player, position),
) {
  const slots = FORMATION_SLOTS[formation]
  if (players.length < slots.length) return []

  // Algoritmo húngaro rectangular: filas = slots, columnas = jugadores.
  const rowCount = slots.length
  const columnCount = players.length
  const potentialsByRow = Array(rowCount + 1).fill(0) as number[]
  const potentialsByColumn = Array(columnCount + 1).fill(0) as number[]
  const matchedRowByColumn = Array(columnCount + 1).fill(0) as number[]
  const previousColumn = Array(columnCount + 1).fill(0) as number[]

  for (let row = 1; row <= rowCount; row += 1) {
    matchedRowByColumn[0] = row
    let currentColumn = 0
    const minimum = Array(columnCount + 1).fill(Number.POSITIVE_INFINITY) as number[]
    const used = Array(columnCount + 1).fill(false) as boolean[]
    do {
      used[currentColumn] = true
      const currentRow = matchedRowByColumn[currentColumn]
      let delta = Number.POSITIVE_INFINITY
      let nextColumn = 0
      for (let column = 1; column <= columnCount; column += 1) {
        if (used[column]) continue
        const player = players[column - 1]
        const position = slots[currentRow - 1]
        const cost = familiarityCost(player, position) - scorePlayer(player, position, currentRow - 1)
        const reducedCost = cost - potentialsByRow[currentRow] - potentialsByColumn[column]
        if (reducedCost < minimum[column]) {
          minimum[column] = reducedCost
          previousColumn[column] = currentColumn
        }
        if (minimum[column] < delta || (minimum[column] === delta && column < nextColumn)) {
          delta = minimum[column]
          nextColumn = column
        }
      }
      for (let column = 0; column <= columnCount; column += 1) {
        if (used[column]) {
          potentialsByRow[matchedRowByColumn[column]] += delta
          potentialsByColumn[column] -= delta
        } else minimum[column] -= delta
      }
      currentColumn = nextColumn
    } while (matchedRowByColumn[currentColumn] !== 0)

    do {
      const nextColumn = previousColumn[currentColumn]
      matchedRowByColumn[currentColumn] = matchedRowByColumn[nextColumn]
      currentColumn = nextColumn
    } while (currentColumn !== 0)
  }

  const lineup = Array(rowCount).fill(0) as number[]
  for (let column = 1; column <= columnCount; column += 1) {
    const row = matchedRowByColumn[column]
    if (row > 0) lineup[row - 1] = players[column - 1].id
  }
  return lineup
}
