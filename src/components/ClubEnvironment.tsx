import type { CSSProperties } from 'react'
import { CLUB_ENVIRONMENTS, type ClubLocation } from '../data/clubEnvironments'
import type { EnvironmentMode } from '../presentation/environment'
export function ClubEnvironment({ location, mode, preview = false }: { location: ClubLocation; mode: EnvironmentMode; preview?: boolean }) {
  const asset = CLUB_ENVIRONMENTS[location]
  return <span className={preview ? 'club-environment-preview' : 'club-environment'} data-location={location} data-mode={mode} aria-hidden="true" style={{ '--club-environment-image': `url("${asset[mode]}")` } as CSSProperties}>
    <img key={`${location}-${mode}`} src={asset[mode]} alt="" onError={event => {
      if (!event.currentTarget.src.endsWith(asset.fallback)) event.currentTarget.src = asset.fallback
    }} />
  </span>
}
