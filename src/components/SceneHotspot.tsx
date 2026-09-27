import { useId, type CSSProperties, type ReactNode } from 'react'
import { CLUB_PANEL_SCENE, type ClubSceneHotspot } from '../presentation/clubSceneHotspots'

type Props = { hotspot: ClubSceneHotspot; onActivate: () => void; children: ReactNode }

/** A native button preserves Enter/Space activation and tab order without custom handlers. */
export function SceneHotspot({ hotspot, onActivate, children }: Props) {
  const maskId = useId()
  const [contourWidth, contourHeight] = hotspot.contourSize ?? [100, 100]
  const { id, label, left, top, width, height, outline } = hotspot
  const style = {
    left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%`,
    '--hotspot-clip': `polygon(${outline.split(' ').map(point => point.split(',').join('% ') + '%').join(', ')})`,
  } as CSSProperties
  return <button type="button" className={`scene-hotspot scene-hotspot--${id}`} style={style}
    data-panel-card={id} aria-label={id === 'dressing-room' ? 'Ir al Vestuario' : `Ir a ${label}`} onClick={onActivate}>
    <svg className="scene-hotspot-art" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {hotspot.maskToContours && <defs><mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
        <g transform={`scale(${100 / contourWidth} ${100 / contourHeight})`}>
          <g fill="white" stroke="white" strokeWidth="2">{hotspot.contours?.map((contour, index) => <path key={index} d={contour} />)}</g>
          {hotspot.occlusions?.map((occlusion, index) => <path key={index} d={occlusion} fill="black" />)}
        </g>
      </mask></defs>}
      <g mask={hotspot.maskToContours ? `url(#${maskId})` : undefined}>
      <svg x="0" y="0" width="100" height="100" viewBox={`${left} ${top} ${width} ${height}`} preserveAspectRatio="none">
        <image href={CLUB_PANEL_SCENE} width="100" height="100" preserveAspectRatio="none" />
      </svg>
      </g>
    </svg>
    <span className="scene-hotspot-content" aria-hidden="true">{children}</span>
    <svg className="scene-hotspot-outline" viewBox={`0 0 ${contourWidth} ${contourHeight}`} preserveAspectRatio="none" aria-hidden="true">
      {hotspot.occlusions && <defs><mask id={`${maskId}-outline`} maskUnits="userSpaceOnUse" x="0" y="0" width={contourWidth} height={contourHeight}>
        <rect width={contourWidth} height={contourHeight} fill="white" />
        {hotspot.occlusions.map((occlusion, index) => <path key={index} d={occlusion} fill="black" />)}
      </mask></defs>}
      <g mask={hotspot.occlusions ? `url(#${maskId}-outline)` : undefined}>
      {hotspot.contours ? hotspot.contours.map((contour, index) => <path key={index} d={contour} vectorEffect="non-scaling-stroke" />) : <polygon points={outline} vectorEffect="non-scaling-stroke" />}
      </g>
    </svg>
  </button>
}
