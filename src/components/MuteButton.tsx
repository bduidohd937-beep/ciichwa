import { useState } from 'react'
import { isMuted, toggleMuted } from '../audio'

/** 화면 우하단 고정 소리 토글 버튼 (전 화면 공통) */
export default function MuteButton() {
  const [muted, setMutedState] = useState(isMuted)

  const handleClick = () => {
    setMutedState(toggleMuted())
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={muted}
      aria-label={muted ? '소리 켜기' : '소리 끄기'}
      title={muted ? '소리 켜기' : '소리 끄기'}
      className="fixed right-4 bottom-4 z-50 grid h-11 w-11 place-items-center rounded-full border-2 border-ink/15 bg-white/90 text-lg shadow-[0_4px_14px_-6px_rgba(62,58,54,0.5)] transition hover:border-ink/40 hover:bg-white active:scale-95"
    >
      <span aria-hidden>{muted ? '🔇' : '🔊'}</span>
    </button>
  )
}
