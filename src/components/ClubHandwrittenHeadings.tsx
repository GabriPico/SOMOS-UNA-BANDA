import { CLUB_HANDWRITTEN_HEADINGS, getHeadingPenStrokes } from '../presentation/clubHandwriting'
import { CLUB_PANEL_SCENE_SIZE } from '../presentation/clubSceneHotspots'

/** Bespoke pen paths keep the static lettering independent of installed fonts. */
export function ClubHandwrittenHeadings() {
  return <svg className="club-handwritten-headings" viewBox={`0 0 ${CLUB_PANEL_SCENE_SIZE.width} ${CLUB_PANEL_SCENE_SIZE.height}`} aria-hidden="true" focusable="false">
    {CLUB_HANDWRITTEN_HEADINGS.map(heading => {
      const line = getHeadingPenStrokes(heading.text)
      return <g key={heading.text} transform={`rotate(${heading.angle} ${heading.x} ${heading.y + heading.height})`}>
        <svg x={heading.x} y={heading.y} width={heading.width} height={heading.height} viewBox={`0 0 ${line.width} 32`} preserveAspectRatio="none" overflow="visible">
          <g fill="none" stroke={heading.ink} strokeLinecap="round" strokeLinejoin="round">
            {line.letters.map((letter, index) => <g key={index} transform={letter.transform}>
              {letter.strokes.map((stroke, gesture) => <g key={gesture}>
                <path d={stroke} strokeWidth={heading.weight * letter.pressure * (gesture === 0 ? 1 : .84)} opacity={gesture === 0 ? .94 : .87} />
                {/* Short ink overlaps mimic pressure changes within a gesture. */}
                <path d={stroke} pathLength="100" strokeDasharray="24 76" strokeDashoffset={-((index * 17 + gesture * 11) % 65)} strokeWidth={heading.weight * letter.pressure * 1.2} opacity=".24" />
              </g>)}
            </g>)}
          </g>
        </svg>
      </g>
    })}
  </svg>
}
