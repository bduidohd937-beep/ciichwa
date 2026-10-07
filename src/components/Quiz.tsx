import { useEffect, useRef, useState } from 'react'
import { QUESTIONS, type Axis } from '../data/questions'
import type { Answers } from '../engine/scoring'

interface Props {
  answers: Answers
  index: number
  onAnswer: (questionIndex: number, optionIndex: number) => void
  onBack: () => void
  /** 마지막 문항 완료 시, 최종 답변 전체를 넘긴다 */
  onFinish: (finalAnswers: Answers) => void
}

const AXIS_BADGE: Record<Axis, string> = {
  EI: '에너지',
  SN: '인식',
  TF: '판단',
  JP: '생활',
}

/**
 * 질문별 선택지 표시 순서 — 질문 id 홀짝으로 섞어
 * "A만 고르기"가 한쪽 성향으로 쏠리지 않도록 합니다.
 * (채점은 항상 원본 선택지 기준이므로 안전합니다)
 */
function displayOrder(questionId: number): [number, number] {
  return questionId % 2 === 0 ? [1, 0] : [0, 1]
}

export default function Quiz({
  answers,
  index,
  onAnswer,
  onBack,
  onFinish,
}: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  // 방금 눌러 애니메이션 중인지 — 뒤로가기 시 재선택을 막지 않기 위한 별도 상태
  const [locked, setLocked] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const question = QUESTIONS[index]
  const total = QUESTIONS.length
  const progress = ((index + (selected !== null ? 1 : 0)) / total) * 100

  const handlePick = (optionIndex: number) => {
    if (locked) return
    setSelected(optionIndex)
    setLocked(true)
    const isLast = index === total - 1
    timerRef.current = setTimeout(() => {
      const nextAnswers = [...answers]
      nextAnswers[index] = optionIndex
      onAnswer(index, optionIndex)
      if (isLast) onFinish(nextAnswers)
    }, 380)
  }

  // 문항 이동/언마운트 시 미완료 타이머 정리 (effect는 ref 접근 가능)
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [index])

  const order = displayOrder(question.id)

  // 문항이 바뀌면 선택 상태를 리셋한다 (effect가 아닌 렌더 중 조정)
  const [prevIndex, setPrevIndex] = useState(index)
  if (prevIndex !== index) {
    setPrevIndex(index)
    const saved = answers[index]
    setSelected(saved === 0 || saved === 1 ? saved : null)
    setLocked(false)
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-5 pt-6 pb-12">
      {/* 헤더: 뒤로가기 + 진행바 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="이전 문항"
          className="rounded-full border-2 border-ink/15 bg-white px-3 py-1.5 text-sm font-semibold text-ink-soft transition hover:text-ink disabled:opacity-40"
          disabled={index === 0}
        >
          ← 뒤로
        </button>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-cream-dark">
          <div
            className="h-full rounded-full bg-sky transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="w-14 text-right text-sm font-semibold text-ink-soft tabular-nums">
          {index + 1}/{total}
        </span>
      </div>

      <div
        key={question.id}
        className="animate-pop mt-8 flex flex-1 flex-col rounded-3xl border-2 border-ink/10 bg-white p-6 shadow-[0_10px_30px_-18px_rgba(62,58,54,0.45)] sm:p-8"
      >
        <span className="self-start rounded-full bg-cream px-3 py-1 text-xs font-bold text-ink-soft">
          {AXIS_BADGE[question.axis]} 성향
        </span>

        <h2 className="mt-4 text-2xl leading-snug sm:text-[1.7rem]">
          {question.prompt}
        </h2>

        <div className="mt-6 flex flex-col gap-3">
          {order.map((optionIndex, slot) => {
            const option = question.options[optionIndex]
            const isSelected = selected === optionIndex
            return (
              <button
                key={optionIndex}
                type="button"
                onClick={() => handlePick(optionIndex)}
                disabled={locked}
                className={[
                  'rounded-2xl border-2 px-5 py-4 text-left text-base transition sm:text-lg',
                  'font-medium',
                  isSelected
                    ? 'border-ink bg-honey scale-[1.02]'
                    : selected !== null
                      ? 'border-ink/10 bg-cream/60 opacity-50'
                      : 'border-ink/15 bg-white hover:border-ink/40 hover:bg-cream',
                ].join(' ')}
              >
                <span className="mr-2 font-display text-ink-soft">
                  {slot === 0 ? 'A' : 'B'}.
                </span>
                {option.text}
              </button>
            )
          })}
        </div>

        <p className="mt-auto pt-6 text-center text-xs text-ink-soft/70">
          가장 가까운 쪽을 골라주세요
        </p>
      </div>
    </div>
  )
}
