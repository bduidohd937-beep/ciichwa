import { useEffect, useRef, useState } from 'react'
import { AXIS_LABELS } from '../data/questions'
import {
  CHARACTERS,
  MBTI_TO_CHARACTER,
  type CharacterId,
} from '../data/characters'
import type { TestResult } from '../engine/scoring'
import { encodeResult } from '../engine/scoring'
import { playSfx } from '../audio'
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
      playSfx('pop')
      setCopyLabel('복사 완료! ✓')
    } catch {
      setCopyLabel('복사 실패 😥')
    }
  }

  /** 결과 카드를 PNG로 렌더링해 다운로드 */
  const downloadCard = async () => {
    const wrap = artWrapRef.current
    if (!wrap) return
    const img = wrap.querySelector('img')
    const svg = wrap.querySelector('svg')
    if (!img && !svg) return

    try {
      // 제목/이름에 쓰는 주아체가 준비될 때까지 대기
      if (document.fonts && document.fonts.load) {
        try {
          await document.fonts.load(
            '400 60px Jua',
            `나는 어떤 치이카와? ${character.name} ${result.type}`,
          )
        } catch {
          /* 폰트 로드 실패 시 기본 폰트로 그린다 */
        }
      }

      const W = 1080
      const H = 1350
      const canvas = document.createElement('canvas')
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const { bg, accent } = character.color
      const cx = W / 2
      const INK = '#3E3A36'
      const SOFT = '#7A736B'
      const MUTE = '#A09890'

      /** 네 갈래 반짝이 별 */
      const sparkle = (x: number, y: number, r: number, alpha: number) => {
        ctx.fillStyle = accent
        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.moveTo(x, y - r)
        ctx.quadraticCurveTo(x + r * 0.16, y - r * 0.16, x + r, y)
        ctx.quadraticCurveTo(x + r * 0.16, y + r * 0.16, x, y + r)
        ctx.quadraticCurveTo(x - r * 0.16, y + r * 0.16, x - r, y)
        ctx.quadraticCurveTo(x - r * 0.16, y - r * 0.16, x, y - r)
        ctx.closePath()
        ctx.fill()
        ctx.globalAlpha = 1
      }

      // 1) 바탕: 캐릭터 색에서 강조색으로 흐르는 프레임
      const outer = ctx.createLinearGradient(0, 0, W, H)
      outer.addColorStop(0, bg)
      outer.addColorStop(0.5, bg)
      outer.addColorStop(1, `${accent}D9`)
      ctx.fillStyle = outer
      ctx.fillRect(0, 0, W, H)

      // 2) 크림색 본문 패널 (드롭섀도 + 강조 테두리)
      ctx.save()
      ctx.shadowColor = 'rgba(62,58,54,0.30)'
      ctx.shadowBlur = 34
      ctx.shadowOffsetY = 12
      ctx.fillStyle = '#FFF6E9'
      ctx.beginPath()
      ctx.roundRect(36, 36, W - 72, H - 72, 56)
      ctx.fill()
      ctx.restore()
      ctx.strokeStyle = `${accent}99`
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.roundRect(50, 50, W - 100, H - 100, 44)
      ctx.stroke()

      ctx.textAlign = 'center'

      // 3) 상단 타이틀 알약
      ctx.font = '400 30px Jua, sans-serif'
      const pillText = '나는 어떤 치이카와?'
      const pillW = ctx.measureText(pillText).width + 76
      ctx.fillStyle = accent
      ctx.beginPath()
      ctx.roundRect(cx - pillW / 2, 76, pillW, 56, 28)
      ctx.fill()
      ctx.fillStyle = '#FFFDF6'
      ctx.fillText(pillText, cx, 115)

      // 4) 초상 발광 + 반짝이
      const cy = 372
      const halo = ctx.createRadialGradient(cx, cy, 30, cx, cy, 232)
      halo.addColorStop(0, `${accent}70`)
      halo.addColorStop(1, `${accent}00`)
      ctx.fillStyle = halo
      ctx.beginPath()
      ctx.arc(cx, cy, 232, 0, Math.PI * 2)
      ctx.fill()

      sparkle(214, 236, 22, 0.9)
      sparkle(866, 252, 16, 0.8)
      sparkle(232, 528, 14, 0.75)
      sparkle(854, 520, 22, 0.9)
      sparkle(156, 178, 8, 0.7)
      sparkle(924, 186, 8, 0.7)

      // 5) 초상: PNG는 그대로, SVG는 직렬화 후 그림 (그림자 포함)
      let drawable: CanvasImageSource
      let dw = 0
      let dh = 0
      if (img) {
        if (!img.complete || img.naturalWidth === 0) {
          await new Promise<void>((resolve, rejected) => {
            img.onload = () => resolve()
            img.onerror = () => rejected(new Error('img load failed'))
          })
        }
        drawable = img
        // 세로 440 기준 비율 유지
        const r = 440 / img.naturalHeight
        dw = img.naturalWidth * r
        dh = 440
      } else {
        const svgData = new XMLSerializer().serializeToString(svg!)
        const loaded = new Image()
        const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`
        await new Promise<void>((resolve, rejected) => {
          loaded.onload = () => resolve()
          loaded.onerror = () => rejected(new Error('svg load failed'))
          loaded.src = svgUrl
        })
        drawable = loaded
        dw = 440
        dh = 440
      }
      ctx.save()
      ctx.shadowColor = 'rgba(62,58,54,0.28)'
      ctx.shadowBlur = 26
      ctx.shadowOffsetY = 12
      ctx.drawImage(drawable, cx - dw / 2, cy - dh / 2, dw, dh)
      ctx.restore()

      // 6) 이름 · 원문명 · MBTI 배지
      ctx.fillStyle = INK
      ctx.font = '400 96px Jua, sans-serif'
      ctx.fillText(character.name, cx, 706)

      ctx.fillStyle = MUTE
      ctx.font = '500 26px sans-serif'
      ctx.fillText(character.nameJa, cx, 746)

      ctx.font = '400 44px Jua, sans-serif'
      const badgeW = ctx.measureText(result.type).width + 104
      ctx.fillStyle = accent
      ctx.beginPath()
      ctx.roundRect(cx - badgeW / 2, 768, badgeW, 60, 30)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'
      ctx.lineWidth = 4
      ctx.stroke()
      ctx.fillStyle = '#FFFFFF'
      ctx.fillText(result.type, cx, 813)

      // 7) 한줄 타이틀 + 성격 태그 칩
      ctx.fillStyle = INK
      ctx.font = '600 34px sans-serif'
      ctx.fillText(character.title, cx, 878)

      ctx.font = '700 26px sans-serif'
      const chips = character.traits.map((t) => `#${t}`)
      const chipPad = 18
      const chipGap = 12
      const chipW = chips.map((c) => ctx.measureText(c).width + chipPad * 2)
      const chipTotal =
        chipW.reduce((a, b) => a + b, 0) + chipGap * (chips.length - 1)
      let chipX = cx - chipTotal / 2
      chips.forEach((c, i) => {
        ctx.fillStyle = '#FFFFFF'
        ctx.beginPath()
        ctx.roundRect(chipX, 904, chipW[i], 44, 22)
        ctx.fill()
        ctx.strokeStyle = 'rgba(62,58,54,0.16)'
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fillStyle = SOFT
        ctx.fillText(c, chipX + chipW[i] / 2, 934)
        chipX += chipW[i] + chipGap
      })

      // 8) 점선 구분선 + 4축 성향 바
      ctx.save()
      ctx.setLineDash([8, 10])
      ctx.strokeStyle = 'rgba(62,58,54,0.18)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(140, 978)
      ctx.lineTo(W - 140, 978)
      ctx.stroke()
      ctx.restore()

      const barX = 132
      const barW = W - 264
      result.axes.forEach((axis, i) => {
        const [left, right] = AXIS_LABELS[axis.axis]
        const top = 1006 + i * 62
        const pct = axis.percent
        const color = AXIS_COLORS[axis.axis]

        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(barX + 11, top + 16, 9, 0, Math.PI * 2)
        ctx.fill()

        ctx.font = '600 26px sans-serif'
        ctx.fillStyle = SOFT
        ctx.textAlign = 'left'
        ctx.fillText(`${left} ${pct}%`, barX + 32, top + 25)
        ctx.textAlign = 'right'
        ctx.fillText(`${100 - pct}% ${right}`, barX + barW, top + 25)

        ctx.textAlign = 'center'
        ctx.fillStyle = '#F2E6D6'
        ctx.beginPath()
        ctx.roundRect(barX, top + 36, barW, 16, 8)
        ctx.fill()
        const fillW = (barW * pct) / 100
        if (fillW > 0) {
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.roundRect(barX, top + 36, fillW, 16, 8)
          ctx.fill()
        }
      })

      // 9) 푸터
      ctx.fillStyle = MUTE
      ctx.font = '500 26px sans-serif'
      ctx.fillText('나는 어떤 치이카와? · 16문항 성격 테스트', cx, 1284)

      const link = document.createElement('a')
      link.download = `나는-어떤-치이카와-${result.type}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      playSfx('chime')
    } catch {
      /* 카드 렌더 실패 시 다운로드하지 않는다 */
    }
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
        <div className="relative mt-2 w-44 sm:w-52">
          <div
            aria-hidden
            className="absolute inset-2 rounded-full opacity-40 blur-2xl"
            style={{ backgroundColor: character.color.accent }}
          />
          <CharacterArt
            id={result.characterId}
            className="relative h-auto w-full"
          />
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
