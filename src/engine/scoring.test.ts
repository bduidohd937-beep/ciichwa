import { describe, expect, it } from 'vitest'
import { QUESTIONS, AXIS_POLES } from '../data/questions'
import { MBTI_TO_CHARACTER, MBTI_TYPES, CHARACTERS } from '../data/characters'
import {
  decodeResult,
  encodeResult,
  scoreAnswers,
  validateAnswers,
} from './scoring'

/** 모든 선택지를 0번(E/S/T/J 쪽)으로 고른 답 */
const allLeft = QUESTIONS.map(() => 0)
/** 모든 선택지를 1번(I/N/F/P 쪽)으로 고른 답 */
const allRight = QUESTIONS.map(() => 1)

describe('문항 데이터', () => {
  it('12문항이 있고 id는 1~12', () => {
    expect(QUESTIONS).toHaveLength(12)
    expect(QUESTIONS.map((q) => q.id)).toEqual(
      Array.from({ length: 12 }, (_, i) => i + 1),
    )
  })

  it('축마다 3문항씩 있고, 가중치는 1·2·2(합계 5, 홀수)다', () => {
    for (const axis of ['EI', 'SN', 'TF', 'JP'] as const) {
      const qs = QUESTIONS.filter((q) => q.axis === axis)
      expect(qs).toHaveLength(3)
      const total = qs.reduce((sum, q) => sum + q.weight, 0)
      expect(total).toBe(5)
      expect(total % 2).toBe(1)
    }
  })

  it('두 선택지의 pole이 축의 양쪽 글자와 정확히 일치한다', () => {
    for (const q of QUESTIONS) {
      const [left, right] = AXIS_POLES[q.axis]
      const poles = q.options.map((o) => o.pole)
      expect(poles).toContain(left)
      expect(poles).toContain(right)
    }
  })
})

describe('채점', () => {
  it('전부 왼쪽 선택 → ESTJ', () => {
    const r = scoreAnswers(allLeft)
    expect(r.type).toBe('ESTJ')
    expect(r.axes.every((a) => a.percent === 100)).toBe(true)
  })

  it('전부 오른쪽 선택 → INFP', () => {
    const r = scoreAnswers(allRight)
    expect(r.type).toBe('INFP')
    expect(r.axes.every((a) => a.percent === 0)).toBe(true)
  })

  it('동점(50%)이 발생하지 않는다 — 가중치 합 5(홀수) 덕분', () => {
    // EI축 가중치 1·2·2: 전부 왼쪽(+5) 중 3번만 오른쪽(-2) → +5-4=+1
    const answers = [...allLeft]
    answers[2] = 1 // 3번(I) 선택
    const r = scoreAnswers(answers)
    expect(r.axes[0].percent).toBe(60) // (1+5)/10
    expect(r.axes[0].pole).toBe('E')
  })

  it('모든 답변 조합에서 50% 동점이 발생하지 않는다', () => {
    // 12문항 → 4096가지 조합 전수 검사
    for (let mask = 0; mask < 1 << 12; mask++) {
      const answers = Array.from({ length: 12 }, (_, i) => (mask >> i) & 1)
      const r = scoreAnswers(answers)
      for (const a of r.axes) {
        expect(a.percent).not.toBe(50)
      }
    }
  })

  it('답변 개수 검증', () => {
    expect(() => validateAnswers([0, 1])).toThrow(/답변 개수/)
    expect(() => validateAnswers(Array(16).fill(2))).toThrow(/답변 개수/)
    expect(() => validateAnswers(Array(11).fill(0))).toThrow(/답변 개수/)
    expect(() => validateAnswers(Array(12).fill(2))).toThrow(/문항/)
    expect(() => validateAnswers(allLeft)).not.toThrow()
  })

  it('모든 유형이 매핑된 캐릭터를 가진다', () => {
    expect(MBTI_TYPES).toHaveLength(16)
    for (const t of MBTI_TYPES) {
      expect(CHARACTERS[MBTI_TO_CHARACTER[t]]).toBeDefined()
    }
  })
})

describe('공유 인코딩', () => {
  it('encode → decode 무손실 순환', () => {
    const cases = [allLeft, allRight, QUESTIONS.map((_, i) => i % 2)]
    for (const answers of cases) {
      const r = scoreAnswers(answers)
      const restored = decodeResult(encodeResult(r))
      expect(restored).not.toBeNull()
      expect(restored!.type).toBe(r.type)
      expect(restored!.characterId).toBe(r.characterId)
      expect(restored!.axes.map((a) => a.percent)).toEqual(
        r.axes.map((a) => a.percent),
      )
    }
  })

  it('잘못된 인코딩은 null', () => {
    expect(decodeResult('')).toBeNull()
    expect(decodeResult('XXXX.EI60')).toBeNull()
    expect(decodeResult('INFP.ei60.sn50.tf50.jp50')).toBeNull()
  })

  it('유형만 있는 짧은 링크(?r=INFP)도 복원된다', () => {
    const r = decodeResult('INFP')
    expect(r).not.toBeNull()
    expect(r!.type).toBe('INFP')
    expect(r!.characterId).toBe('chiikawa')
    // 축 점수가 없으면 각 축 50%로 시작하되 pole은 유형 글자와 일치
    expect(r!.axes.map((a) => a.pole)).toEqual(['I', 'N', 'F', 'P'])
    expect(r!.axes.every((a) => a.percent === 50)).toBe(true)
  })

  it('짧은 링크는 모든 유형에서 유형 글자를 그대로 복원', () => {
    for (const t of MBTI_TYPES) {
      const r = decodeResult(t)
      expect(r?.type).toBe(t)
      expect(r?.axes.map((a) => a.pole).join('')).toBe(t)
    }
  })

  it('유형 글자와 점수가 어긋난 값도 유형을 우선해 복원', () => {
    // 유형 ESTJ인데 EI 점수가 40 (I가 60)인 비정상 값 → 유형(E)을 유지하되
    // 점수는 대칭 보정(100-40=60)해 모순을 제거한다
    const restored = decodeResult('ESTJ.EI40.SN60.TF60.JP60')
    expect(restored).not.toBeNull()
    expect(restored!.type).toBe('ESTJ')
    expect(restored!.axes[0].pole).toBe('E')
    expect(restored!.axes[0].percent).toBe(60)
  })
})
