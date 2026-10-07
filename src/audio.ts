/**
 * 효과음 & BGM 재생
 * - 자동재생 브라우저 정책 대응: 첫 사용자 제스처에서 `unlockAudio()` 호출
 * - 음소거 상태는 localStorage에 영구 저장
 * - 재생 실패(차단/없는 파일)는 조용히 무시
 */

export type SfxName = 'pop' | 'chime' | 'fanfare'

declare global {
  interface Window {
    /** 개발 서버 전용 디버그 훅 */
    __chiikawaAudio?: {
      playSfx: (name: SfxName) => void
      isMuted: () => boolean
      setMuted: (value: boolean) => void
      bgm: () => {
        paused: boolean
        time: number
        src: string
        unlocked: boolean
      } | null
    }
  }
}

const MUTED_KEY = 'chiikawa-mbti-muted'
const SFX_VOLUME = 0.55
const BGM_VOLUME = 0.3

const BASE = import.meta.env.BASE_URL

const sfxCache = new Map<SfxName, HTMLAudioElement>()
let bgmEl: HTMLAudioElement | null = null
/** 첫 제스처 도달 여부 — 이전에는 BGM을 재생 시도하지 않는다 */
let unlocked = false

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTED_KEY) === '1'
  } catch {
    return false
  }
}

let muted = readMuted()

export function isMuted(): boolean {
  return muted
}

function sfxEl(name: SfxName): HTMLAudioElement | null {
  if (typeof Audio === 'undefined') return null
  let el = sfxCache.get(name)
  if (!el) {
    el = new Audio(`${BASE}audio/${name}.wav`)
    el.preload = 'auto'
    el.volume = SFX_VOLUME
    sfxCache.set(name, el)
  }
  return el
}

/** 효과음 재생 (같은 소리는 처음부터 다시) */
export function playSfx(name: SfxName): void {
  if (muted) return
  const el = sfxEl(name)
  if (!el) return
  try {
    el.currentTime = 0
    void el.play().catch(() => {})
  } catch {
    /* 재생 실패는 무시 */
  }
}

function bgm(): HTMLAudioElement | null {
  if (typeof Audio === 'undefined') return null
  if (!bgmEl) {
    bgmEl = new Audio(`${BASE}audio/bgm.wav`)
    bgmEl.loop = true
    bgmEl.preload = 'auto'
    bgmEl.volume = BGM_VOLUME
  }
  return bgmEl
}

/** 첫 상호작용(클릭/탭/키)에서 호출 — BGM을 시작한다 */
export function unlockAudio(): void {
  unlocked = true
  const el = bgm()
  if (!el || muted) return
  void el.play().catch(() => {})
}

export function setMuted(value: boolean): void {
  muted = value
  try {
    localStorage.setItem(MUTED_KEY, value ? '1' : '0')
  } catch {
    /* 저장 실패는 무시 */
  }
  if (value) {
    for (const el of sfxCache.values()) el.pause()
    bgmEl?.pause()
    return
  }
  if (unlocked) void bgmEl?.play().catch(() => {})
}

/** 상태를 반전하고 새 상태를 돌려준다 */
export function toggleMuted(): boolean {
  setMuted(!muted)
  return muted
}

/** 개발 서버에서만 노출 — 브라우저 검증용 */
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__chiikawaAudio = {
    playSfx,
    isMuted,
    setMuted,
    bgm: () =>
      bgmEl
        ? {
            paused: bgmEl.paused,
            time: bgmEl.currentTime,
            src: bgmEl.currentSrc || bgmEl.src,
            unlocked,
          }
        : null,
  }
}
