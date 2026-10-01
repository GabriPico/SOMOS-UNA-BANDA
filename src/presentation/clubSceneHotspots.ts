/** Native 2:1 artwork and registered physical objects; no viewport/UI in the raster. */
export const CLUB_PANEL_SCENE_SIZE = { width: 1774, height: 887 }
const SCENE_SIZE = CLUB_PANEL_SCENE_SIZE
export const CLUB_PANEL_SCENE = '/assets/materials/club-panel-illustrated-wide.png'
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
  { id: 'squad', label: 'Equipo', bounds: [248, 223, 367, 242],
    outline: '6,2 100,0 100,19 93,21 92,28 100,54 95,60 91,56 91,99 70,99 70,59 68,99 47,99 47,59 45,99 25,99 25,59 23,98 5,98 6,57 0,54 3,43 9,29 6,20',
    contourSize: [367, 242], maskToContours: true,
    contours: [
      'M24 4 L365 0 L365 47 L23 45 Z',
      'M22 77 L39 63 Q55 81 68 64 L86 78 L103 127 L87 138 L81 131 L82 230 L24 228 L25 133 L11 139 L1 128 L10 94 Z',
      'M106 77 L122 64 Q139 82 152 65 L169 80 L187 130 L171 141 L164 134 L163 233 L103 232 L105 135 L90 139 L80 130 L91 96 Z',
      'M187 79 L204 66 Q220 84 233 67 L250 82 L268 132 L252 142 L244 135 L245 237 L185 236 L186 137 L171 142 L162 133 L173 98 Z',
      'M271 81 L287 68 Q304 86 317 69 L334 84 L353 135 L338 145 L329 138 L329 239 L269 237 L269 138 L254 144 L245 135 L257 100 Z',
    ] },
  { id: 'tactics', label: 'Tácticas', bounds: [626, 235, 185, 274], outline: '9,0 98,1 97,100 0,97 7,3' },
  { id: 'training', label: 'Entrenamientos', bounds: [826, 136, 230, 516],
    outline: '0,9 42,9 54,0 64,9 69,10 76,1 85,9 98,10 100,99 1,100',
    contourSize: [230, 516], maskToContours: true,
    contours: [
      'M124 2 L138 48 L145 55 L143 59 L151 62 L152 68 L103 69 L104 62 L110 59 L107 55 L112 49 Z',
      'M177 5 L189 50 L198 55 L195 60 L203 65 L201 70 L151 70 L152 63 L160 59 L157 54 L165 49 Z',
      'M51 77 L176 76 L175 114 L51 114 Z',
      'M43 66 L58 64 L65 80 L53 85 Z M165 64 L178 65 L171 81 L160 77 Z',
      'M28 143 L50 141 L49 181 L61 219 L56 236 L40 239 L31 230 L22 240 L12 231 L18 208 L13 188 L20 160 Z',
      'M57 142 L82 141 L81 184 L96 217 L91 237 L71 240 L60 230 L49 239 L44 224 L51 205 L47 184 Z',
      'M101 233 Q96 225 111 220 Q108 207 127 204 Q142 184 159 191 Q178 185 191 198 L199 211 L195 220 Q207 226 197 237 Z',
      'M103 310 Q101 300 119 296 Q128 274 149 280 Q174 270 190 289 L201 299 L199 310 Z',
      'M22 288 Q47 275 69 287 Q90 295 95 318 L96 340 Q69 357 20 341 L13 318 Z',
      'M105 311 L186 308 L192 320 L190 351 L103 351 L99 322 Z',
      'M31 400 Q52 391 72 408 Q87 430 75 450 Q51 471 29 451 Q17 429 31 400 Z',
      'M90 403 Q110 392 128 408 L122 420 L122 449 Q103 465 89 448 Q76 427 90 403 Z',
      'M142 388 L164 381 L190 383 L199 396 L199 417 L173 424 L144 418 Z',
      'M124 421 L202 420 L210 431 L207 488 L122 488 Z',
      // Open uprights and shelf edges, never an enclosing shelf-wide rectangle.
      'M9 50 L9 512 M219 50 L219 513 M13 239 L215 239 M13 355 L215 355 M13 495 L215 498',
    ] },
  { id: 'dressing-room', label: 'Vestuario', bounds: [1072, 103, 299, 546], outline: '20,1 83,0 83,9 98,10 100,99 0,100 1,10 20,10' },
  { id: 'next-match', label: 'Próximo partido', bounds: [1394, 166, 251, 176], outline: '1,1 100,0 100,99 0,100' },
  { id: 'league', label: 'Competición', bounds: [1422, 420, 138, 100], outline: '10,0 98,2 98,78 90,96 0,94 1,81 8,76' },
  { id: 'staff', label: 'Staff', bounds: [275, 597, 299, 179], outline: '0,19 6,14 6,8 24,4 32,1 83,2 96,8 96,16 100,27 100,95 93,100 1,87' },
]
export const CLUB_SCENE_HOTSPOTS: ClubSceneHotspot[] = ROOM_OBJECTS.map(({ bounds: [left, top, width, height], ...object }) => ({
  ...object, left: left / SCENE_SIZE.width * 100, top: top / SCENE_SIZE.height * 100,
  width: width / SCENE_SIZE.width * 100, height: height / SCENE_SIZE.height * 100,
}))
/** Complete object bounds allow cover cropping to be checked against the artwork's safe area. */
export const CLUB_PANEL_SAFE_AREA = {
  left: Math.min(...CLUB_SCENE_HOTSPOTS.map(object => object.left)) / 100,
  top: Math.min(...CLUB_SCENE_HOTSPOTS.map(object => object.top)) / 100,
  right: Math.max(...CLUB_SCENE_HOTSPOTS.map(object => object.left + object.width)) / 100,
  bottom: Math.max(...CLUB_SCENE_HOTSPOTS.map(object => object.top + object.height)) / 100,
}
