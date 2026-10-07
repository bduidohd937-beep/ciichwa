/**
 * 테스트 문항 데이터
 * - 16문항, 4축(EI/SN/TF/JP)당 4문항
 * - 각 축의 마지막 문항은 weight 2 (동점 방지 — 합계가 항상 홀수가 되어
 *   어느 쪽으로든 한 글자로 확정됨)
 * - 선택지는 랜덤 순서로 노출되며, 답은 "선택한 성향(pole)"으로 저장된다.
 */

export type Pole = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P'
export type Axis = 'EI' | 'SN' | 'TF' | 'JP'

export interface QuestionOption {
  readonly text: string
  readonly pole: Pole
}

export interface Question {
  readonly id: number
  readonly axis: Axis
  readonly weight: 1 | 2
  readonly prompt: string
  readonly options: readonly [QuestionOption, QuestionOption]
}

export const AXIS_POLES: Record<Axis, readonly [Pole, Pole]> = {
  EI: ['E', 'I'],
  SN: ['S', 'N'],
  TF: ['T', 'F'],
  JP: ['J', 'P'],
}

export const AXIS_LABELS: Record<Axis, readonly [string, string]> = {
  EI: ['외향 E', '내향 I'],
  SN: ['감각 S', '직관 N'],
  TF: ['사고 T', '감정 F'],
  JP: ['판단 J', '인식 P'],
}

export const QUESTIONS: readonly Question[] = [
  // ── E / I ──────────────────────────────────────────────
  {
    id: 1,
    axis: 'EI',
    weight: 1,
    prompt: '주말에 친구가 갑자기 “나오라”고 하면?',
    options: [
      { text: '바로 준비하고 나간다', pole: 'E' },
      { text: '집이 딱인데… 다음에 할래', pole: 'I' },
    ],
  },
  {
    id: 2,
    axis: 'EI',
    weight: 1,
    prompt: '속이 채워지는 휴식법은?',
    options: [
      { text: '사람들끼리 수다 떨기', pole: 'E' },
      { text: '혼자 조용한 시간 보내기', pole: 'I' },
    ],
  },
  {
    id: 3,
    axis: 'EI',
    weight: 1,
    prompt: '처음 가는 자리에 도착했을 때 나는?',
    options: [
      { text: '먼저 다가가 말을 건넨다', pole: 'E' },
      { text: '분위기부터 파악하고 눈치를 본다', pole: 'I' },
    ],
  },
  {
    id: 4,
    axis: 'EI',
    weight: 2,
    prompt: '신나는 하루가 끝나면?',
    options: [
      { text: '그래도 더 놀고 싶어진다', pole: 'E' },
      { text: '이제 집에 가서 쉬고 싶다', pole: 'I' },
    ],
  },

  // ── S / N ──────────────────────────────────────────────
  {
    id: 5,
    axis: 'SN',
    weight: 1,
    prompt: '새 간식 매대 앞에 섰을 때 나는?',
    options: [
      { text: '재료와 가격부터 꼼꼼히 확인', pole: 'S' },
      { text: '상상 속 맛을 먼저 떠올려 본다', pole: 'N' },
    ],
  },
  {
    id: 6,
    axis: 'SN',
    weight: 1,
    prompt: '이야기를 들을 때 나는?',
    options: [
      { text: '사실과 구체적인 디테일이 중요', pole: 'S' },
      { text: '그 이면의 의미와 가능성에 끌린다', pole: 'N' },
    ],
  },
  {
    id: 7,
    axis: 'SN',
    weight: 1,
    prompt: '문제가 생겼을 때 나의 스타일은?',
    options: [
      { text: '지금까지 통한 방법부터 적용', pole: 'S' },
      { text: '기발한 새 방법을 떠올린다', pole: 'N' },
    ],
  },
  {
    id: 8,
    axis: 'SN',
    weight: 2,
    prompt: '미래의 나를 상상하면?',
    options: [
      { text: '일단 오늘 할 수 있는 일부터', pole: 'S' },
      { text: '상상만 해도 신난다', pole: 'N' },
    ],
  },

  // ── T / F ──────────────────────────────────────────────
  {
    id: 9,
    axis: 'TF',
    weight: 1,
    prompt: '친구가 내 간식을 없앴을 때?',
    options: [
      { text: '왜 그랬는지 이유부터 묻는다', pole: 'T' },
      { text: '괜찮아, 너가 더 속상할 텐데', pole: 'F' },
    ],
  },
  {
    id: 10,
    axis: 'TF',
    weight: 1,
    prompt: '결정할 때 더 중요한 것은?',
    options: [
      { text: '논리와 효율이 맞는가', pole: 'T' },
      { text: '사람들이 다치지 않는가', pole: 'F' },
    ],
  },
  {
    id: 11,
    axis: 'TF',
    weight: 1,
    prompt: '친구들이 싸우고 있으면?',
    options: [
      { text: '누가 더 맞는지 가르쳐주고 싶어', pole: 'T' },
      { text: '둘의 마음부터 달래주고 싶어', pole: 'F' },
    ],
  },
  {
    id: 12,
    axis: 'TF',
    weight: 2,
    prompt: '듣기 싫은 충고를 받았을 때?',
    options: [
      { text: '아픈 말이라도 사실이면 고마워', pole: 'T' },
      { text: '말투가 다정해야 들을 수 있어', pole: 'F' },
    ],
  },

  // ── J / P ──────────────────────────────────────────────
  {
    id: 13,
    axis: 'JP',
    weight: 1,
    prompt: '여행을 떠날 때 나는?',
    options: [
      { text: '일정표와 짐 목록을 미리 만든다', pole: 'J' },
      { text: '가서 그때그때 정한다', pole: 'P' },
    ],
  },
  {
    id: 14,
    axis: 'JP',
    weight: 1,
    prompt: '방이 어질러지면?',
    options: [
      { text: '바로 치우지 않으면 불편하다', pole: 'J' },
      { text: '필요할 때 그때 치운다', pole: 'P' },
    ],
  },
  {
    id: 15,
    axis: 'JP',
    weight: 1,
    prompt: '마감이 있는 일 처리 방식은?',
    options: [
      { text: '미리미리 끝내놓는다', pole: 'J' },
      { text: '마감 직전에 몰아서 한다', pole: 'P' },
    ],
  },
  {
    id: 16,
    axis: 'JP',
    weight: 2,
    prompt: '갑자기 계획이 바뀌면?',
    options: [
      { text: '머리가 복잡해지고 불편하다', pole: 'J' },
      { text: '오히려 더 신난다', pole: 'P' },
    ],
  },
]
