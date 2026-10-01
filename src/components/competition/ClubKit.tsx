import { useId } from 'react'
import type { ClubKit as Kit } from '../../domain/models'

/** Vector kit shared by the directory and club sheet. Colors come from club identity. */
export function ClubKit({ kit, label }: { kit: Kit; label: string }) {
  const id = useId()
  return <svg className="federation-kit" viewBox="0 0 140 180" role="img" aria-label={label}>
    <defs><pattern id={id} width="22" height="10" patternUnits="userSpaceOnUse"><rect width="22" height="10" fill={kit.shirt} /><rect width="9" height="10" fill={kit.trim} /></pattern></defs>
    <path d="M45 12 25 20 8 44 24 58 38 42v64h64V42l14 16 16-14-17-24-20-8q-25 15-50 0Z" fill={kit.pattern === 'stripes' ? `url(#${id})` : kit.shirt} stroke="#162b4830" />
    <path d="M56 15q14 16 28 0" fill="none" stroke={kit.trim} strokeWidth="5" />
    <path d="M38 112h64l6 38H77l-7-26-7 26H32Z" fill={kit.shorts} stroke="#162b4830" />
    <path d="M38 114h64M35 146h28m15 0h27" stroke={kit.trim} strokeWidth="3" />
    <path d="M39 157h15v20H39Zm47 0h15v20H86Z" fill={kit.socks} stroke="#162b4830" />
    <path d="M39 158h15m32 0h15" stroke={kit.trim} strokeWidth="4" />
  </svg>
}
