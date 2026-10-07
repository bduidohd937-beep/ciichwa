import { CHARACTERS, type CharacterId } from '../data/characters'
import CharacterArt from './CharacterArt'

interface Props {
  onStart: () => void
  resumable: boolean
}

const HERO_IDS: readonly CharacterId[] = ['usagi', 'chiikawa', 'hachiware', 'rakko']
const ALL_IDS = Object.keys(CHARACTERS) as CharacterId[]

export default function Landing({ onStart, resumable }: Props) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center px-5 pt-10 pb-16 text-center">
      <span className="rounded-full border-2 border-ink/15 bg-white px-4 py-1.5 text-xs font-semibold tracking-wide text-ink-soft">
        팬메이드 성격 테스트 · 약 1분
      </span>

      <div className="mt-6 flex items-end justify-center gap-1 sm:gap-4">
        {HERO_IDS.map((id, i) => (
          <div
            key={id}
            className="animate-float w-16 sm:w-24"
            style={{ animationDelay: `${i * 0.25}s` }}
          >
            <CharacterArt id={id} className="h-auto w-full" />
          </div>
        ))}
      </div>

      <h1 className="mt-4 text-4xl leading-tight sm:text-5xl">
        나는 어떤{' '}
        <span className="relative inline-block">
          <span
            aria-hidden
            className="absolute inset-x-[-6px] bottom-1 -z-10 h-4 rounded bg-honey/70"
          />
          치이카와
        </span>
        ?
      </h1>
      <p className="mt-4 max-w-md text-ink-soft">
        우사기, 하치와레, 치이카와… 16문항으로 알아보는
        <br />
        나와 닮은 치이카와 세계관 캐릭터
      </p>

      <button
        type="button"
        onClick={onStart}
        className="mt-8 rounded-full bg-ink px-10 py-4 font-display text-xl text-cream shadow-[0_6px_0_0_rgba(62,58,54,0.25)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
      >
        {resumable ? '이어서 테스트하기' : '테스트 시작하기'}
      </button>
      {resumable && (
        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem('chiikawa-mbti-progress')
            onStart()
          }}
          className="mt-3 text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
        >
          처음부터 다시 하기
        </button>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs font-medium text-ink-soft">
        <span className="rounded-full bg-white px-3 py-1 ring-1 ring-ink/10">16문항</span>
        <span className="rounded-full bg-white px-3 py-1 ring-1 ring-ink/10">4축 성향 분석</span>
        <span className="rounded-full bg-white px-3 py-1 ring-1 ring-ink/10">결과 이미지 공유</span>
      </div>

      <section className="mt-12 w-full">
        <h2 className="text-lg text-ink-soft">이런 친구들이 기다려요</h2>
        <div className="mt-4 grid grid-cols-4 gap-3 sm:gap-4">
          {ALL_IDS.map((id) => (
            <div
              key={id}
              className="card-hop rounded-2xl border-2 border-ink/10 bg-white p-2 transition-transform hover:-translate-y-1"
              style={{ backgroundColor: CHARACTERS[id].color.bg }}
            >
              <CharacterArt id={id} className="h-auto w-full" />
              <p className="mt-1 text-xs font-semibold sm:text-sm">{CHARACTERS[id].name}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-12 text-xs leading-relaxed text-ink-soft/80">
        <p>
          본 테스트는 팬메이드 콘텐츠입니다.
          <br />
          「치이카와」 및 등장 캐릭터의 모든 권리는 원작자에게 있습니다.
        </p>
      </footer>
    </div>
  )
}
