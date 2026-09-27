/** Registered coordinates of the user's new reference room, 1619 × 971. */
const SCENE_SIZE = { width: 1619, height: 971 }
export const CLUB_PANEL_SCENE = '/assets/materials/club-panel-reference.png'
export const CLUB_PANEL_SCENE_RATIO = `${SCENE_SIZE.width} / ${SCENE_SIZE.height}`

export type ClubSceneDestination = 'squad' | 'tactics' | 'training' | 'dressing-room' | 'next-match' | 'league' | 'staff'
export type ClubSceneHotspot = {
  id: ClubSceneDestination
  label: string
  left: number
  top: number
  width: number
  height: number
  outline: string
  contours?: string[]
  contourSize?: [number, number]
  occlusions?: string[]
  maskToContours?: boolean
}
type PaintedObject = Omit<ClubSceneHotspot, 'left' | 'top' | 'width' | 'height'> & { bounds: [number, number, number, number] }
const ROOM_OBJECTS: PaintedObject[] = [
  { id: 'squad', label: 'Equipo', bounds: [150, 253, 369, 255],
    outline: '6,2 98,0 99,23 89,24 88,35 99,63 95,69 91,65 90,99 70,99 69,66 68,100 47,100 47,66 45,99 25,99 25,66 23,98 5,98 6,65 0,62 7,42 15,25 6,24',
    contourSize: [369, 255],
    contours: [
      'M22 103 L43 89 Q59 107 73 90 L89 107 L103 155 L88 165 L81 159 L82 247 L24 244 L26 161 L13 165 L3 156 L12 120 Z',
      'M104 106 L121 89 Q137 108 151 92 L169 108 L181 157 L166 167 L160 161 L160 248 L99 247 L102 162 L87 165 L79 156 L90 118 Z',
      'M183 107 L201 91 Q217 110 231 93 L249 109 L261 159 L246 169 L240 162 L240 249 L180 248 L181 163 L167 167 L158 158 L170 120 Z',
      'M262 109 L281 94 Q297 111 311 95 L328 111 L346 162 L331 172 L323 164 L324 251 L260 250 L261 165 L247 171 L238 161 L251 123 Z',
    ] },
  { id: 'tactics', label: 'Tácticas', bounds: [521, 277, 184, 286], outline: '9,0 98,1 97,100 0,97 7,3' },
  { id: 'training', label: 'Entrenamientos', bounds: [716, 160, 226, 543],
    outline: '0,9 42,9 54,0 64,9 69,10 76,1 85,9 98,10 100,99 1,100',
    contourSize: [226, 543], maskToContours: true,
    contours: [
      'M121 2 L134 48 L141 54 L139 57 L146 60 L147 66 L97 68 L98 62 L105 59 L101 55 L107 50 Z',
      'M172 7 L184 49 L193 55 L191 59 L198 64 L196 69 L146 69 L147 62 L155 58 L152 54 L160 48 Z',
      'M20 79 L198 70 L197 153 L21 151 Z',
      'M33 76 L47 70 L53 82 L39 89 Z M182 72 L196 73 L190 87 L179 83 Z',
      'M32 154 L56 153 L55 205 L65 230 L59 247 L44 251 L35 244 L26 252 L16 245 L21 224 L15 206 L19 177 Z',
      'M59 154 L87 153 L86 203 L100 231 L96 249 L73 252 L63 246 L52 252 L45 240 L51 220 L46 199 Z',
      'M100 249 Q96 239 112 236 Q107 224 126 220 Q141 201 160 209 Q179 203 191 216 L201 226 L197 238 Q211 245 197 252 Z',
      'M109 323 Q103 313 122 309 Q129 289 151 295 Q175 286 188 304 L200 309 L199 326 Z',
      'M23 299 Q46 287 69 305 Q88 302 98 326 L101 356 L95 376 Q56 387 17 374 L13 352 L15 325 Z',
      'M106 330 L185 327 L191 337 L190 380 L103 380 L100 342 Z',
      'M31 439 Q48 427 69 437 Q88 450 80 472 Q76 491 55 492 Q32 490 26 473 Q19 452 31 439 Z',
      'M90 437 Q111 427 128 442 L121 451 L121 481 Q113 493 107 491 Q85 486 83 466 Q79 449 90 437 Z',
      'M138 410 L160 402 L188 404 L200 417 L199 438 L175 444 L153 441 L138 444 Z',
      'M124 443 L203 443 L209 455 L207 523 L122 523 Z',
      // Open uprights and shelf edges, never an enclosing shelf-wide rectangle.
      'M8 55 L8 537 M214 55 L214 537 M12 256 L210 256 M12 383 L210 383 M12 527 L210 529',
    ] },
  { id: 'dressing-room', label: 'Vestuario', bounds: [965, 118, 294, 594], outline: '16,1 83,0 83,10 100,11 100,99 0,100 1,10 16,10' },
  { id: 'next-match', label: 'Próximo partido', bounds: [1283, 191, 266, 187], outline: '1,1 100,0 100,99 0,100' },
  { id: 'league', label: 'Clasificación', bounds: [1283, 384, 266, 181], outline: '1,0 100,1 100,100 0,99' },
  { id: 'staff', label: 'Staff', bounds: [187, 660, 439, 229], outline: '0,1 64,7 72,76 100,78 95,89 72,100 9,87 2,61' },
]
export const CLUB_SCENE_HOTSPOTS: ClubSceneHotspot[] = ROOM_OBJECTS.map(({ bounds: [left, top, width, height], ...object }) => ({
  ...object, left: left / SCENE_SIZE.width * 100, top: top / SCENE_SIZE.height * 100,
  width: width / SCENE_SIZE.width * 100, height: height / SCENE_SIZE.height * 100,
}))
/** Framing clamps keep every complete object below the live HUD and inside the viewport. */
export const CLUB_PANEL_SAFE_AREA = {
  left: Math.min(...CLUB_SCENE_HOTSPOTS.map(object => object.left)) / 100,
  top: Math.min(...CLUB_SCENE_HOTSPOTS.map(object => object.top)) / 100,
  right: Math.max(...CLUB_SCENE_HOTSPOTS.map(object => object.left + object.width)) / 100,
  bottom: Math.max(...CLUB_SCENE_HOTSPOTS.map(object => object.top + object.height)) / 100,
}
