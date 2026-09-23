export type ManagementIconName = 'group' | 'mood' | 'authority' | 'alert' | 'positive' | 'voices' | 'fees' | 'history' | 'players' | 'home' | 'tactics' | 'training' | 'mail' | 'calendar' | 'trophy' | 'staff' | 'search' | 'sun' | 'moon' | 'arrow' | 'settings' | 'ball' | 'transition'

export function ManagementIcon({ name }: { name: ManagementIconName }) {
  const paths = {
    settings: <><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="3" fill="var(--ui-surface)" /><circle cx="16" cy="17" r="3" fill="var(--ui-surface)" /></>,
    ball: <><circle cx="12" cy="12" r="9" /><path d="m12 7 5 4-2 5H9l-2-5 5-4ZM12 7V3M17 11l4-2M15 16l2 4M9 16l-2 4M7 11 3 9" /></>,
    transition: <><path d="M3 10a9 9 0 0 1 15-5l3 3M21 3v5h-5M21 14A9 9 0 0 1 6 19l-3-3M3 21v-5h5" /></>,
    home: <><path d="m2 11 10-9 10 9M5 9v12h5v-7h4v7h5V9" /></>,
    tactics: <><rect x="3" y="3" width="18" height="18" rx="1" /><path d="M12 3v18M3 12h18" /><circle cx="12" cy="12" r="4" /></>,
    training: <><circle cx="15" cy="4" r="2" /><path d="m5 10 5-3 5 4 5-3M11 8l-3 7 6 3 1 4M8 15l-5 6M13 10l-1 4 6 1" /></>,
    mail: <><rect x="2" y="5" width="20" height="15" rx="1" /><path d="m2 6 10 8L22 6" /></>,
    calendar: <><rect x="3" y="5" width="18" height="17" rx="2" /><path d="M7 2v6M17 2v6M3 11h18M7 15h2M15 15h2M7 18h2" /></>,
    trophy: <><path d="M7 3h10v6a5 5 0 0 1-10 0V3ZM7 5H3v3a5 5 0 0 0 5 5M17 5h4v3a5 5 0 0 1-5 5M12 14v6M7 22h10M9 20h6" /></>,
    staff: <><circle cx="9" cy="6" r="3" /><path d="M2 21v-3a7 7 0 0 1 14 0v3M17 3a3 3 0 0 1 0 6M19 13a5 5 0 0 1 3 5v3" /></>,
    search: <><circle cx="10" cy="10" r="7" /><path d="m15 15 7 7" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 1v2M12 21v2M1 12h2M21 12h2M4 4l2 2M18 18l2 2M4 20l2-2M18 6l2-2" /></>,
    moon: <path d="M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12Z" />,
    arrow: <path d="M3 12h18m-7-7 7 7-7 7" />,
    group: <><circle cx="12" cy="7" r="3" /><path d="M6 21v-3a6 6 0 0 1 12 0v3M4 5a3 3 0 0 0 0 6M2 19v-2a4 4 0 0 1 2-3.5M20 5a3 3 0 0 1 0 6m2 8v-2a4 4 0 0 0-2-3.5" /></>,
    mood: <><circle cx="12" cy="12" r="9" /><path d="M8 9h.01M16 9h.01M8 15q4 4 8 0" /></>,
    authority: <><path d="m12 2 8 3v6c0 5-4 9-8 11-4-2-8-6-8-11V5l8-3Z" /><path d="m8 12 3 3 5-6" /></>,
    alert: <><circle cx="12" cy="12" r="9" /><path d="M12 7v6m0 4h.01" /></>,
    positive: <><path d="m3 17 6-6 4 3 7-9m-6 0h6v6" /></>,
    voices: <><path d="M4 4h16v12H9l-5 4V4Z" /><path d="M8 8h8M8 12h5" /></>,
    fees: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 4 16 4 16 0V5M4 10c0 4 16 4 16 0M4 15c0 4 16 4 16 0" /></>,
    history: <><path d="M4 8a9 9 0 1 1-1 7M3 3v6h6M12 7v5l4 2" /></>,
    players: <><path d="m8 3-5 3 2 5 3-1v11h8V10l3 1 2-5-5-3a4 4 0 0 1-8 0Z" /></>,
  }
  return <svg className="management-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
