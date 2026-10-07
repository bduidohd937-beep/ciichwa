/**
 * 캐릭터 프로필 & MBTI 유형 매핑
 * - 캐릭터 해석은 원작 팬 창작(HR 판) 해석입니다.
 */

export type MbtiType =
  | 'ISTJ'
  | 'ISFJ'
  | 'INFJ'
  | 'INFP'
  | 'ISTP'
  | 'ISFP'
  | 'INTP'
  | 'INTJ'
  | 'ESTJ'
  | 'ESFJ'
  | 'ENFJ'
  | 'ENFP'
  | 'ESTP'
  | 'ESFP'
  | 'ENTP'
  | 'ENTJ'

export type CharacterId =
  | 'chiikawa'
  | 'hachiware'
  | 'usagi'
  | 'momonga'
  | 'rakko'
  | 'shisa'
  | 'kurimanju'
  | 'armor'

export interface Character {
  readonly id: CharacterId
  readonly name: string
  readonly nameJa: string
  /** 결과 헤드라인 */
  readonly title: string
  /** 공유용 한 줄 캡션 */
  readonly tagline: string
  /** 결과 해석 문단 */
  readonly description: readonly string[]
  /** 성격 태그 */
  readonly traits: readonly string[]
  /** 케미 추천 친구 ids */
  readonly friends: readonly CharacterId[]
  readonly color: { readonly bg: string; readonly accent: string }
}

export const CHARACTERS: Record<CharacterId, Character> = {
  chiikawa: {
    id: 'chiikawa',
    name: '치이카와',
    nameJa: 'ちいかわ',
    title: '눈물 많은데 의외로 강한, 다정한 노력파',
    tagline: '조용해 보여도 위기엔 먼저 나서는 타입',
    description: [
      '겉으로는 소심하고 눈물 많은 편이지만, 마음이 약해 포기하는 사람은 아니에요. 친구가 위험하면 등 떠밀리듯 용기를 내는 타입입니다.',
      '작은 것에 감동하고 큰 일에는 신중하지만, 그런 조심성이 오히려 주변에 안정감을 줘요. 생각보다 강운이라 좋은 일이 자주 들어온답니다.',
    ],
    traits: ['다정', '신중', '강운'],
    friends: ['hachiware', 'usagi'],
    color: { bg: '#FFFFFF', accent: '#FF9E8A' },
  },
  hachiware: {
    id: 'hachiware',
    name: '하치와레',
    nameJa: 'はちわれ',
    title: '“뭐든지 될 려-!” 분위기 메이커',
    tagline: '어떤 모임이든 금방 살려내는 긍정 화석',
    description: [
      '사교적이고 낙천적인 말장이. 치이카와와 우사기가 뭐라고 못 할 때는 상황을 대신 설명해 주는 역할을 자처합니다.',
      '위기에서 “뭐든지 될 려-!”라며 모두를 이끌지만, 신기하게도 그 외침이 실제로 통할 때가 많아요. 모임에서 자연스럽게 중심이 되는 타입입니다.',
    ],
    traits: ['분위기 메이커', '낙천적', '응원가'],
    friends: ['chiikawa', 'usagi'],
    color: { bg: '#EAF6FF', accent: '#5FB6E8' },
  },
  usagi: {
    id: 'usagi',
    name: '우사기',
    nameJa: 'うさぎ',
    title: '예측불가 자유인, 먹방은 우사기 몫',
    tagline: '생각보다 몸이 먼저 나가는 타입',
    description: [
      '대사가 거의 없는데 행동으로 모든 걸 말해 버리는 캐릭터. 어디 갈지 갑자기 정해지고, 중요한 순간엔 언제나 선두에 서 있어요.',
      '위기 상황을 뒤집는 전투력과 먹는 것에 대한 집착은 팀 내 원탑. “오늘 뭐 먹을까”가 인생 최대 고민이라고 할 수 있습니다.',
    ],
    traits: ['자유로움', '행동파', '먹방'],
    friends: ['hachiware', 'chiikawa'],
    color: { bg: '#FFF6DC', accent: '#F5B301' },
  },
  momonga: {
    id: 'momonga',
    name: '모몽가',
    nameJa: 'モモンガ',
    title: '“나만 봐 줘!” 관심 1순위 타입',
    tagline: '사랑받고 싶어 안달난 귀염둥이',
    description: [
      '“내 얘기 해 줘”를 바디랭귀지로 구사하는, 귀여운 것에 목숨 건 다람쥐. 원하는 게 있으면 망설임 없이 직설적으로 요구해요.',
      '스루당해도 기죽지 않는 단단한 멘탈이 무기지만, 사실은 관심과 사랑이 제일 필요한 타입입니다. 마음을 열면 누구보다 다정해집니다.',
    ],
    traits: ['관심욕', '애교', '뻔뻔함'],
    friends: ['armor', 'chiikawa'],
    color: { bg: '#FBF1E6', accent: '#D9A06B' },
  },
  rakko: {
    id: 'rakko',
    name: '라ッ코',
    nameJa: 'ラッコ',
    title: '랭킹 1위, 말은 없지만 다 하는 타입',
    tagline: '강함을 수식어로 붙이지 않아도 되는 캐릭터',
    description: [
      '모두가 동경하는 토벌 랭킹 1위의 실력자. 말수는 적고 담백하지만, 결정적인 순간에 확실하게 힘을 보태 줍니다.',
      '단 것을 좋아하는 반전과, 친구를 가르치는 데 진심인 면도 있어요. 묵묵히 앞서가는 리더형입니다.',
    ],
    traits: ['실력자', '담백', '비장미'],
    friends: ['usagi', 'chiikawa'],
    color: { bg: '#EFF6F0', accent: '#6FAE87' },
  },
  shisa: {
    id: 'shisa',
    name: '시이사',
    nameJa: 'シーサー',
    title: '“기비 시이사!” 긍정 일꾼',
    tagline: '성실하게 일하고 디저트는 내가 챙길래',
    description: [
      '라멘집에서 슈퍼 알바 자격을 거머쥔 성실 파워. 긍정적인 에너지와 특유의 말투로 주변을 편하게 만들어요.',
      '열심히 일한 만큼 디저트는 꼭 챙기는 실속형. 작은 성취에도 진심으로 기뻐하는 타입입니다.',
    ],
    traits: ['성실', '긍정', '실속파'],
    friends: ['kurimanju', 'chiikawa'],
    color: { bg: '#FFF2E0', accent: '#EF9435' },
  },
  kurimanju: {
    id: 'kurimanju',
    name: '크리만주 선배',
    nameJa: 'くりまんじゅう',
    title: '“하아…” 커피 한 잔의 여유',
    tagline: '술잔 하나에 오늘을 씻어내는 어른',
    description: [
      '선배 포스로 커피를 사 주고 간식도 나눠 주는 다정한 어른. 겉은 시크해 보여도 후배들을 잘 챙깁니다.',
      '한 잔 하고 “하아…” 하는 게 국룰. 여유로워 보여도 제 몫은 확실하게 하는 든든한 타입이에요.',
    ],
    traits: ['여유', '든든', '선배향'],
    friends: ['shisa', 'chiikawa'],
    color: { bg: '#F6EFE7', accent: '#9C7154' },
  },
  armor: {
    id: 'armor',
    name: '아머씨',
    nameJa: '鎧さん',
    title: '말수는 적지만 현장을 책임지는 타입',
    tagline: '겉은 무심, 속은 이미 다 계산',
    description: [
      '노동을 중개하고 가게를 운영하는 조직의 일하는 갑옷. 표정은 안 보이지만 현장에서는 신뢰가 두터워요.',
      '생각이 깊고, 결단할 때는 카리스마가 납니다. 묵직하게 앞서가며 결과로 증명하는 타입이에요.',
    ],
    traits: ['성실', '묵직함', '카리스마'],
    friends: ['momonga', 'rakko'],
    color: { bg: '#F0F2F5', accent: '#7C8798' },
  },
}

/** 16 MBTI 유형 → 캐릭터 매핑 */
export const MBTI_TO_CHARACTER: Record<MbtiType, CharacterId> = {
  ISTJ: 'kurimanju',
  ISFJ: 'chiikawa',
  INFJ: 'chiikawa',
  INFP: 'chiikawa',
  ISTP: 'rakko',
  ISFP: 'shisa',
  INTP: 'armor',
  INTJ: 'rakko',
  ESTJ: 'momonga',
  ESFJ: 'hachiware',
  ENFJ: 'hachiware',
  ENFP: 'usagi',
  ESTP: 'usagi',
  ESFP: 'shisa',
  ENTP: 'momonga',
  ENTJ: 'armor',
}

export const MBTI_TYPES = Object.keys(MBTI_TO_CHARACTER) as MbtiType[]

export function getCharacter(type: MbtiType): Character {
  return CHARACTERS[MBTI_TO_CHARACTER[type]]
}
