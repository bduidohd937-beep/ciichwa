import { useState } from 'react'
import { CHARACTERS, type CharacterId } from '../data/characters'

interface Props {
  id: CharacterId
  className?: string
}

const INK = '#3E3A36'

/**
 * 캐릭터 초상 — 추출한 PNG가 있으면 이미지를 쓰고,
 * 없거나 로드 실패 시 직접 그린 SVG로 폴백합니다.
 */
export default function CharacterArt({ id, className }: Props) {
  const [imgFailed, setImgFailed] = useState(false)
  const image = CHARACTERS[id].image
  const wrapClass = className ? `${className} art-bob` : 'art-bob'

  if (image && !imgFailed) {
    return (
      <img
        src={image}
        alt={CHARACTERS[id].name}
        className={wrapClass}
        loading="lazy"
        onError={() => setImgFailed(true)}
      />
    )
  }

  return <SvgArt id={id} className={className} />
}

function SvgArt({ id, className }: Props) {
  const base = {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 200 200',
    width: 200,
    height: 200,
    className: className ? `${className} art-bob` : 'art-bob',
    role: 'img' as const,
    'aria-label': CHARACTERS[id].name,
  }
  const g = {
    stroke: INK,
    strokeWidth: 4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (id) {
    case 'chiikawa':
      return (
        <svg {...base} aria-label="치이카와">
          <g {...g}>
            <path d="M66 62 C58 44 62 30 76 32 C86 33 91 43 92 54" fill="#FFFFFF" />
            <path d="M134 62 C142 44 138 30 124 32 C114 33 109 43 108 54" fill="#FFFFFF" />
            <ellipse cx="100" cy="112" rx="62" ry="58" fill="#FFFFFF" />
            <g className="blink">
              <circle cx="82" cy="106" r="6" fill={INK} stroke="none" />
              <circle cx="118" cy="106" r="6" fill={INK} stroke="none" />
            </g>
            <path d="M92 124 q8 8 16 0" fill="none" />
            <ellipse cx="64" cy="124" rx="10" ry="6" fill="#FFC9BC" stroke="none" />
            <ellipse cx="136" cy="124" rx="10" ry="6" fill="#FFC9BC" stroke="none" />
          </g>
        </svg>
      )

    case 'hachiware':
      return (
        <svg {...base} aria-label="하치와레">
          <g {...g}>
            <path d="M62 58 L54 24 L86 42 Z" fill="#FFFFFF" />
            <path d="M138 58 L146 24 L114 42 Z" fill="#FFFFFF" />
            <ellipse cx="100" cy="112" rx="62" ry="58" fill="#FFFFFF" />
            <path
              d="M41 96 A 62 58 0 0 1 159 96 C146 74 124 66 100 66 C76 66 54 74 41 96 Z"
              fill="#7EC8F0"
            />
            <g className="blink">
              <circle cx="82" cy="112" r="6" fill={INK} stroke="none" />
              <circle cx="118" cy="112" r="6" fill={INK} stroke="none" />
            </g>
            <path d="M93 130 q7 8 14 0" fill="none" />
            <ellipse cx="64" cy="130" rx="10" ry="6" fill="#FFC9BC" stroke="none" />
            <ellipse cx="136" cy="130" rx="10" ry="6" fill="#FFC9BC" stroke="none" />
          </g>
        </svg>
      )

    case 'usagi':
      return (
        <svg {...base} aria-label="우사기">
          <g {...g}>
            <ellipse
              cx="76"
              cy="50"
              rx="14"
              ry="40"
              fill="#FFD66B"
              transform="rotate(-10 76 50)"
            />
            <ellipse
              cx="124"
              cy="50"
              rx="14"
              ry="40"
              fill="#FFD66B"
              transform="rotate(10 124 50)"
            />
            <ellipse cx="100" cy="120" rx="58" ry="54" fill="#FFD66B" />
            <g className="blink">
              <circle cx="80" cy="112" r="7.5" fill={INK} stroke="none" />
              <circle cx="120" cy="112" r="7.5" fill={INK} stroke="none" />
              <circle cx="83" cy="108" r="2.6" fill="#FFFFFF" stroke="none" />
              <circle cx="123" cy="108" r="2.6" fill="#FFFFFF" stroke="none" />
            </g>
            <path d="M88 134 q12 12 24 0 q-12 8 -24 0 z" fill={INK} stroke="none" />
            <ellipse cx="62" cy="132" rx="9" ry="6" fill="#FFB3A7" stroke="none" opacity="0.75" />
            <ellipse cx="138" cy="132" rx="9" ry="6" fill="#FFB3A7" stroke="none" opacity="0.75" />
          </g>
        </svg>
      )

    case 'momonga':
      return (
        <svg {...base} aria-label="모몽가">
          <g {...g}>
            <circle cx="66" cy="72" r="16" fill="#F6E7D2" />
            <circle cx="134" cy="72" r="16" fill="#F6E7D2" />
            <ellipse cx="100" cy="116" rx="58" ry="56" fill="#F6E7D2" />
            <g className="blink">
              <circle cx="80" cy="110" r="8.5" fill={INK} stroke="none" />
              <circle cx="120" cy="110" r="8.5" fill={INK} stroke="none" />
              <circle cx="83.5" cy="106" r="3" fill="#FFFFFF" stroke="none" />
              <circle cx="123.5" cy="106" r="3" fill="#FFFFFF" stroke="none" />
            </g>
            <ellipse cx="100" cy="130" rx="7" ry="5" fill={INK} stroke="none" />
            <path d="M91 140 q9 8 18 0" fill="none" />
            <ellipse cx="62" cy="132" rx="10" ry="6" fill="#FFC9BC" stroke="none" />
            <ellipse cx="138" cy="132" rx="10" ry="6" fill="#FFC9BC" stroke="none" />
          </g>
        </svg>
      )

    case 'rakko':
      return (
        <svg {...base} aria-label="라ッ코">
          <g {...g}>
            <circle cx="64" cy="70" r="14" fill="#CDBBA6" />
            <circle cx="136" cy="70" r="14" fill="#CDBBA6" />
            <ellipse cx="100" cy="114" rx="58" ry="54" fill="#CDBBA6" />
            <ellipse cx="100" cy="134" rx="30" ry="22" fill="#F6EFE7" />
            <g className="blink">
              <circle cx="80" cy="104" r="6" fill={INK} stroke="none" />
              <circle cx="120" cy="104" r="6" fill={INK} stroke="none" />
            </g>
            <ellipse cx="100" cy="124" rx="9" ry="7" fill={INK} stroke="none" />
            <path d="M92 142 q8 7 16 0" fill="none" />
            <path d="M66 132 h-12 M66 140 l-11 5 M134 132 h12 M134 140 l11 5" fill="none" />
          </g>
        </svg>
      )

    case 'shisa':
      return (
        <svg {...base} aria-label="시이사">
          <g {...g}>
            <g fill="#F5B301">
              <circle cx="158" cy="110" r="17" />
              <circle cx="147" cy="144" r="17" />
              <circle cx="118" cy="165" r="17" />
              <circle cx="82" cy="165" r="17" />
              <circle cx="53" cy="144" r="17" />
              <circle cx="42" cy="110" r="17" />
              <circle cx="53" cy="76" r="17" />
              <circle cx="82" cy="55" r="17" />
              <circle cx="118" cy="55" r="17" />
              <circle cx="147" cy="76" r="17" />
            </g>
            <circle cx="100" cy="110" r="45" fill="#FFE7B8" />
            <g className="blink">
              <circle cx="84" cy="102" r="6" fill={INK} stroke="none" />
              <circle cx="116" cy="102" r="6" fill={INK} stroke="none" />
            </g>
            <ellipse cx="100" cy="120" rx="10" ry="8" fill={INK} stroke="none" />
            <path d="M100 128 v6 M100 134 q-9 8 -16 0 M100 134 q9 8 16 0" fill="none" />
          </g>
        </svg>
      )

    case 'kurimanju':
      return (
        <svg {...base} aria-label="크리만주 선배">
          <g {...g}>
            <path
              d="M100 46 C128 62 156 96 156 130 C156 156 132 172 100 172 C68 172 44 156 44 130 C44 96 72 62 100 46 Z"
              fill="#A9714B"
            />
            <path
              d="M64 152 C74 166 126 166 136 152 C132 164 118 172 100 172 C82 172 68 164 64 152 Z"
              fill="#E8CDA9"
              stroke="none"
            />
            <path d="M76 118 q9 -9 18 0" fill="none" />
            <path d="M106 118 q9 -9 18 0" fill="none" />
            <path d="M93 136 q7 7 14 0" fill="none" />
            <ellipse cx="68" cy="136" rx="9" ry="6" fill="#FFC9BC" stroke="none" />
            <ellipse cx="132" cy="136" rx="9" ry="6" fill="#FFC9BC" stroke="none" />
          </g>
        </svg>
      )

    case 'armor':
      return (
        <svg {...base} aria-label="아머씨">
          <g {...g}>
            <rect x="54" y="136" width="92" height="52" rx="20" fill="#9AA5B1" />
            <rect x="58" y="46" width="84" height="98" rx="34" fill="#9AA5B1" />
            <rect x="70" y="86" width="60" height="28" rx="12" fill={INK} />
            <g className="blink">
              <circle cx="88" cy="100" r="6" fill="#FFD66B" stroke="none" />
              <circle cx="112" cy="100" r="6" fill="#FFD66B" stroke="none" />
            </g>
            <ellipse cx="100" cy="30" rx="8" ry="13" fill="#FF9E8A" />
            <path d="M74 152 h52" fill="none" />
          </g>
        </svg>
      )
  }
}
