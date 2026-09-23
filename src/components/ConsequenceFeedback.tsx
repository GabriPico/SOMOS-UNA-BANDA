import { useCallback, useEffect, useState } from 'react'
import type { ConsequenceFeedback as FeedbackItem } from '../domain/consequences'
import './ConsequenceFeedback.css'

function ConsequenceToast({ item, onDismiss }: { item: FeedbackItem; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(item.id), 3600)
    return () => window.clearTimeout(timer)
  }, [item.id, onDismiss])
  return <article className={`consequence-toast is-${item.type.toLowerCase()}`} role="status">
    <span>{item.type === 'MEMORY' ? 'SE RECORDARÁ' : item.type === 'WARNING' ? 'ATENCIÓN' : 'CONSECUENCIA'}</span>
    <p>{item.text}</p>
  </article>
}

export function ConsequenceFeedback({ queue, onConsume, onDismiss }: { queue: FeedbackItem[]; onConsume: (ids: string[]) => void; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState<FeedbackItem[]>([])
  useEffect(() => {
    const visibleIds = new Set(visible.map((item) => item.id))
    const incoming = queue.filter((item) => item.status === 'READY' && !visibleIds.has(item.id)).slice(0, Math.max(0, 3 - visible.length))
    if (!incoming.length) return
    setVisible((current) => [...current, ...incoming.filter((item) => !current.some((shown) => shown.id === item.id))])
    onConsume(incoming.map((item) => item.id))
  }, [onConsume, queue, visible])
  const dismiss = useCallback((id: string) => { setVisible((current) => current.filter((item) => item.id !== id)); onDismiss(id) }, [onDismiss])
  return <aside className="consequence-feedback" aria-live="polite" aria-label="Consecuencias">{visible.map((item) => <ConsequenceToast key={item.id} item={item} onDismiss={dismiss} />)}</aside>
}
