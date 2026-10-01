import type { ScreenId } from '../domain/models'
import type { EnvironmentMode } from '../presentation/environment'
export type ClubLocation = 'club-office' | 'squad' | 'training' | 'locker-room' | 'staff'
type EnvironmentAsset = { day: string; night: string; fallback: string }
/** Replace individual variants here; the UI never constructs asset filenames. */
export const CLUB_ENVIRONMENTS: Record<ClubLocation, EnvironmentAsset> = {
  'club-office': { day: '/assets/materials/club-messages-office-illustrated.png', night: '/assets/materials/club-office-night.png', fallback: '/assets/materials/club-messages-office-illustrated.png' },
  squad: { day: '/assets/materials/club-squad-history-field.png', night: '/assets/materials/club-squad-history-field-night.png', fallback: '/assets/materials/club-squad-history-field.png' },
  training: { day: '/assets/materials/training-day.png', night: '/assets/materials/club-training-night-illustrated.png', fallback: '/assets/materials/club-training-night-illustrated.png' },
  'locker-room': { day: '/assets/materials/club-dressing-room-illustrated.png', night: '/assets/materials/club-dressing-room-illustrated-night.png', fallback: '/assets/materials/club-dressing-room-illustrated.png' },
  staff: { day: '/assets/materials/staff-day.png', night: '/assets/materials/staff-night.png', fallback: '/assets/materials/club-messages-office-illustrated.png' },
}
export function getClubLocation(screen: ScreenId | 'player-profile'): ClubLocation {
  if (screen === 'squad' || screen === 'player-profile') return 'squad'
  if (screen === 'training' || screen === 'next-match' || screen === 'post-match' || screen === 'match') return 'training'
  if (screen === 'dressing-room' || screen === 'pre-match' || screen === 'friendly-call-up') return 'locker-room'
  return screen === 'staff' ? 'staff' : 'club-office'
}
export const getEnvironmentAsset = (location: ClubLocation, mode: EnvironmentMode) => CLUB_ENVIRONMENTS[location][mode]
