/**
 * 채점 엔진
 * - 질문별 선택지를 가중치와 함께 합산해 축별 점수 산출
 * - 축마다 마지막 문항이 weight 2라서 합계는 항상 홀수 → 동점(0) 불가
 */

import {
  AXIS_POLES,
  QUESTIONS,
  type Axis,
  type Pole,
  type Question,
} from '../data/questions'
import {
  MBTI_TO_CHARACTER,
  type CharacterId,
  type MbtiType,
} from '../data/characters'

/** 질문별 답: 선택지 인덱스 (0 또는 1) */
export type Answers = number[]

export interface AxisScore {
  readonly axis: Axis
  /** 왼쪽 축(E/S/T/J) 퍼센트 0~100 */
  readonly percent: number
  /** 채택된 글자 */
  readonly pole: Pole
}

export interface TestResult {
  readonly type: MbtiType
  readonly characterId: CharacterId
  readonly axes: readonly [AxisScore, AxisScore, AxisScore, AxisScore]
}

const AXIS_ORDER: readonly Axis[] = ['EI', 'SN', 'TF', 'JP']

export function validateAnswers(answers: Answers): void {
  if (answers.length !== QUESTIONS.length) {
    throw new Error(
      `답변 개수가 ${answers.length}개입니다. ${QUESTIONS.length}개가 필요합니다.`,
    )
  }
  answers.forEach((a, i) => {
    if (a !== 0 && a !== 1) {
      throw new Error(`문항 ${i + 1}의 답변이 잘못되었습니다: ${a}`)
    }
  })
}

function questionsOf(axis: Axis): Question[] {
  return QUESTIONS.filter((q) => q.axis === axis)
}

export function scoreAxis(axis: Axis, answers: Answers): AxisScore {
  const axisQuestions = questionsOf(axis)
  const [leftPole, rightPole] = AXIS_POLES[axis]

  let score = 0
  let totalWeight = 0
  for (const q of axisQuestions) {
    const answer = answers[q.id - 1]
    const chosen = q.options[answer]
    score += chosen.pole === leftPole ? q.weight : -q.weight
    totalWeight += q.weight
  }

  const percent = Math.round(((score + totalWeight) / (2 * totalWeight)) * 100)
  return { axis, percent, pole: percent >= 50 ? leftPole : rightPole }
}

export function toMbtiType(
  axes: readonly [AxisScore, AxisScore, AxisScore, AxisScore],
): MbtiType {
  return axes.map((a) => a.pole).join('') as MbtiType
}

export function scoreAnswers(answers: Answers): TestResult {
  validateAnswers(answers)
  const axes = AXIS_ORDER.map((axis) => scoreAxis(axis, answers)) as [
    AxisScore,
    AxisScore,
    AxisScore,
    AxisScore,
  ]
  const type = toMbtiType(axes)
  if (!(type in MBTI_TO_CHARACTER)) {
    throw new Error(`알 수 없는 MBTI 유형: ${type}`)
  }
  return { type, characterId: MBTI_TO_CHARACTER[type], axes }
}

/** URL 안전 인코딩: 결과를 짧은 쿼리 스트링으로 */
export function encodeResult(result: TestResult): string {
  const axisPart = result.axes.map((a) => `${a.axis}${a.percent}`).join('.')
  return `${result.type}.${axisPart}`
}

/** 공유 링크 → 결과 복원. 잘못된 값이면 null */
export function decodeResult(encoded: string): TestResult | null {
  const m = encoded.match(
    /^(ISTJ|ISFJ|INFJ|INFP|ISTP|ISFP|INTP|INTJ|ESTJ|ESFJ|ENFJ|ENFP|ESTP|ESFP|ENTP|ENTJ)(?:((?:\.[ESTJ][INFP]\d{1,3}){4}))?$/,
  )
  if (!m) return null

  const type = m[1] as MbtiType
  if (!(type in MBTI_TO_CHARACTER)) return null

  // 축 점수가 없는 짧은 링크(?r=INFP) → 각 축 50%로 시작해 유형 글자에 맞춤
  if (!m[2]) {
    const axes = AXIS_ORDER.map((axis) => {
      const [leftPole] = AXIS_POLES[axis]
      return { axis, percent: 50, pole: leftPole }
    }) as [AxisScore, AxisScore, AxisScore, AxisScore]
    return {
      type,
      characterId: MBTI_TO_CHARACTER[type],
      axes: alignAxesToType(axes, type),
    }
  }

  const parts = m[2].slice(1).split('.') // "EI60"
  const axes: AxisScore[] = []
  for (const p of parts) {
    const axis = p.slice(0, 2) as Axis
    const percent = Number(p.slice(2))
    if (!(axis in AXIS_POLES) || !Number.isFinite(percent)) return null
    const clamped = Math.max(0, Math.min(100, Math.round(percent)))
    const [leftPole, rightPole] = AXIS_POLES[axis]
    axes.push({
      axis,
      percent: clamped,
      pole: clamped >= 50 ? leftPole : rightPole,
    })
  }
  if (axes.length !== 4) return null
  if (!(type in MBTI_TO_CHARACTER)) return null

  const derived = axes.map((a) => a.pole).join('') as MbtiType
  // 유형 글자와 축 점수가 어긋나면 유형을 우선한다
  if (derived !== type) {
    return {
      type,
      characterId: MBTI_TO_CHARACTER[type],
      axes: alignAxesToType(
        axes as [AxisScore, AxisScore, AxisScore, AxisScore],
        type,
      ),
    }
  }

  return {
    type,
    characterId: MBTI_TO_CHARACTER[type],
    axes: axes as [AxisScore, AxisScore, AxisScore, AxisScore],
  }
}

/** 축별 pole을 주어진 MBTI 유형 글자와 일치시킨다 (percent는 모순되지 않게 50 이상 보정) */
function alignAxesToType(
  axes: [AxisScore, AxisScore, AxisScore, AxisScore],
  type: MbtiType,
): [AxisScore, AxisScore, AxisScore, AxisScore] {
  const fixed = axes.map((a, i) => {
    const wantPole = type[i] as Pole
    if (a.pole === wantPole) return a
    const [leftPole] = AXIS_POLES[a.axis]
    const percent = wantPole === leftPole ? 100 - a.percent : a.percent
    return {
      axis: a.axis,
      percent: Math.max(50, Math.min(100, percent)),
      pole: wantPole,
    }
  })
  return fixed as [AxisScore, AxisScore, AxisScore, AxisScore]
}
