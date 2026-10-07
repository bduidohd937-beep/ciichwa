import { useEffect, useRef, useState } from 'react'
import { AXIS_LABELS } from '../data/questions'
import {
  CHARACTERS,
  MBTI_TO_CHARACTER,
  type CharacterId,
} from '../data/characters'
import type { TestResult } from '../engine/scoring'
import { encodeResult } from '../engine/scoring'
import CharacterArt from './CharacterArt'

interface Props {
  result: TestResult
  shared: boolean
  onRestart: () => void
}

const AXIS_COLORS: Record<string, string> = {
  EI: '#7EC8F0',
  SN: '#A8E6CF',
  TF: '#FFB3A7',
  JP: '#CDB4DB',
}

export default function Result({ result, shared, onRestart }: Props) {
  const character = CHARACTERS[result.characterId]
  const [copyLabel, setCopyLabel] = useState('링크 복사')
  const artWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (copyLabel === '링크 복사') return
    const t = setTimeout(() => setCopyLabel('링크 복사'), 2000)
    return () => clearTimeout(t)
  }, [copyLabel])

  const shareUrl = () => {
    const { origin, pathname } = window.location
    // 축 점수까지 담아 그래프 수치가 그대로 복원되도록 한다
    return `${origin}${pathname}?r=${encodeResult(result)}`
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl())
      setCopyLabel('복사 완료! ✓')
    } catch {
      setCopyLabel('복사 실패 😥')
    }
  }

  /** 결과 카드를 PNG로 렌더링해 다운로드 */
  const downloadCard = async () => {
    const wrap = artWrapRef.current
    const svg = wrap?.querySelector('svg')
    if (!svg) return

    const W = 1080
    const H = 1350
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 배경
    ctx.fillStyle = character.color.bg
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#FFF6E9'
    ctx.beginPath()
    ctx.roundRect(40, 40, W - 80, H - 80, 48)
    ctx.fill()

    // 캐릭터 SVG → 이미지
    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('svg load failed'))
      img.src = svgUrl
    })
    ctx.drawImage(img, W / 2 - 260, 150, 520, 520)

    ctx.textAlign = 'center'
    ctx.fillStyle = '#7A736B'
    ctx.font = '600 40px sans-serif'
    ctx.fillText('나는 어떤 치이카와?', W / 2, 110)

    ctx.fillStyle = '#3E3A36'
    ctx.font = '700 96px sans-serif'
    ctx.fillText(character.name, W / 2, 760)

    // MBTI 배지
    ctx.font = '700 48px sans-serif'
    const badgeText = result.type
    const badgeW = ctx.measureText(badgeText).width + 80
    ctx.fillStyle = character.color.accent
    ctx.beginPath()
    ctx.roundRect(W / 2 - badgeW / 2, 800, badgeW, 84, 42)
    ctx.fill()
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(badgeText, W / 2, 858)

    // 태그라인
    ctx.fillStyle = '#3E3A36'
    ctx.font = '500 44px sans-serif'
    ctx.fillText(character.tagline, W / 2, 960)

    // 축 요약
    ctx.font = '600 36px sans-serif'
    let y = 1050
    for (const axis of result.axes) {
      const [left, right] = AXIS_LABELS[axis.axis]
      const a = axis.percent
      ctx.fillStyle = '#7A736B'
      ctx.fillText(`${left} ${a}% · ${100 - a}% ${right}`, W / 2, y)
      y += 60
    }

    ctx.font = '500 34px sans-serif'
    ctx.fillStyle = '#A09890'
    ctx.fillText('나는 어떤 치이카와? · 16문항 성격 테스트', W / 2, H - 90)

    const link = document.createElement('a')
    link.download = `나는-어떤-치이카와-${result.type}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const friendIds = character.friends.filter(
    (id): id is CharacterId => id in CHARACTERS,
  )

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-5 pt-8 pb-14">
      {shared && (
        <div className="mb-4 rounded-2xl border-2 border-honey bg-honey/20 px-4 py-3 text-sm font-medium">
          친구가 공유한 결과를 보고 있어요 👀 나도 바로 테스트해볼까요?
        </div>
      )}

      <div
        ref={artWrapRef}
        className="animate-pop flex flex-col items-center rounded-[2rem] border-2 border-ink/10 bg-white p-6 text-center shadow-[0_14px_40px_-20px_rgba(62,58,54,0.5)]"
        style={{ backgroundColor: character.color.bg }}
      >
        <p className="text-sm font-semibold tracking-wide text-ink-soft">
          나와 닮은 친구는
        </p>
        <div className="mt-2 w-44 sm:w-52">
          <CharacterArt id={result.characterId} className="h-auto w-full" />
        </div>
        <h1 className="mt-1 text-3xl sm:text-4xl">{character.name}</h1>
        <p className="text-sm text-ink-soft">{character.nameJa}</p>

        <span
          className="mt-3 rounded-full px-5 py-2 font-display text-lg text-white"
          style={{ backgroundColor: character.color.accent }}
        >
          {result.type}
        </span>
        <p className="mt-3 text-base font-semibold sm:text-lg">{character.title}</p>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {character.traits.map((t) => (
            <span
              key={t}
              className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-ink-soft ring-1 ring-ink/10"
            >
              #{t}
            </span>
          ))}
        </div>
      </div>

      {/* 4축 그래프 */}
      <section className="mt-6 rounded-3xl border-2 border-ink/10 bg-white p-5 sm:p-6">
        <h2 className="text-lg">나의 성향 그래프</h2>
        <div className="mt-4 flex flex-col gap-4">
          {result.axes.map((axis) => {
            const [left, right] = AXIS_LABELS[axis.axis]
            // scoreAxis().percent는 이미 왼쪽(첫) 글자 기준 퍼센트
            const leftPct = axis.percent
            const color = AXIS_COLORS[axis.axis]
            return (
              <div key={axis.axis}>
                <div className="flex justify-between text-sm font-semibold text-ink-soft">
                  <span>
                    {left} {leftPct}%
                  </span>
                  <span>
                    {100 - leftPct}% {right}
                  </span>
                </div>
                <div className="mt-1.5 flex h-3.5 overflow-hidden rounded-full bg-cream-dark">
                  <div
                    className="bar-fill h-full"
                    style={{ width: `${leftPct}%`, backgroundColor: color }}
                  />
                  <div className="h-full flex-1 bg-cream-dark" />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 해석 */}
      <section className="mt-6 rounded-3xl border-2 border-ink/10 bg-white p-5 sm:p-6">
        <h2 className="text-lg">이런 사람이에요</h2>
        <div className="mt-3 flex flex-col gap-3 text-[15px] leading-relaxed text-ink/90">
          {character.description.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* 케미 */}
      {friendIds.length > 0 && (
        <section className="mt-6 rounded-3xl border-2 border-ink/10 bg-white p-5 sm:p-6">
          <h2 className="text-lg">이 캐릭터랑 케미가 잘 맞아요</h2>
          <div className="mt-3 flex gap-4">
            {friendIds.map((id) => (
              <div
                key={id}
                className="flex flex-1 flex-col items-center rounded-2xl p-3"
                style={{ backgroundColor: CHARACTERS[id].color.bg }}
              >
                <CharacterArt id={id} className="h-auto w-20" />
                <p className="mt-1 text-sm font-bold">{CHARACTERS[id].name}</p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {CHARACTERS[id].tagline}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 공유 */}
      <section className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={downloadCard}
          className="rounded-full bg-ink px-6 py-4 font-display text-lg text-cream shadow-[0_6px_0_0_rgba(62,58,54,0.25)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
        >
          결과 카드 이미지 받기 📥
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={copyLink}
            className="flex-1 rounded-full border-2 border-ink/20 bg-white px-4 py-3 text-sm font-bold transition hover:border-ink/50"
          >
            {copyLabel}
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="flex-1 rounded-full border-2 border-ink/20 bg-white px-4 py-3 text-sm font-bold transition hover:border-ink/50"
          >
            다시 테스트하기
          </button>
        </div>
        <p className="text-center text-xs text-ink-soft/80">
          MBTI {result.type} · {MBTI_TO_CHARACTER[result.type] === result.characterId ? character.name : ''}
        </p>
      </section>
    </div>
  )
}
