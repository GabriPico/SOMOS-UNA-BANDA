/** Civil time of the game: never use the computer clock or its time zone. */
export type EnvironmentMode = 'day' | 'night'
export const ENVIRONMENT_TIMES = { dayStarts: 7 * 60, nightStarts: 19 * 60 + 30 } as const
export function getEnvironmentMode(gameDateTime: string): EnvironmentMode {
  const time = /T(\d{2}):(\d{2})/.exec(gameDateTime)
  if (!time) return 'day'
  const minute = Number(time[1]) * 60 + Number(time[2])
  return minute >= ENVIRONMENT_TIMES.dayStarts && minute < ENVIRONMENT_TIMES.nightStarts ? 'day' : 'night'
}
