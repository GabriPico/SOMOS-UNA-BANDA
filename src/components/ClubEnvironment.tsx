import { CLUB_ENVIRONMENTS, type ClubLocation } from '../data/clubEnvironments'
import type { EnvironmentMode } from '../presentation/environment'
export function ClubEnvironment({ location, mode, preview = false }: { location: ClubLocation; mode: EnvironmentMode; preview?: boolean }) {
  const asset = CLUB_ENVIRONMENTS[location]
  return <div className={preview ? 'club-environment-preview' : 'club-environment'} data-location={location} data-mode={mode} aria-hidden="true">
    <img key={`${location}-${mode}`} src={asset[mode]} alt="" onError={event => {
      if (!event.currentTarget.src.endsWith(asset.fallback)) event.currentTarget.src = asset.fallback
    }} />
  </div>
}
