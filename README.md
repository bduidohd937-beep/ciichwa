# 나는 어떤 치이카와? 🐰

MBTI 4축(외향/내향·감각/직관·사고/감정·판단/인식)을 **12문항**으로 측정해서,
당신이 **치이카와 세계관의 어떤 캐릭터와 닮았는지** 알려주는 웹 성격 테스트입니다.

> ⚠️ 본 프로젝트는 **팬메이드 콘텐츠**입니다. 「치이카와(ちいかわ)」 및 등장
> 캐릭터의 모든 권리는 원작자에게 있으며, 상업적 사용은 피하세요.
> 캐릭터 초상은 사용자가 제공한 팬메이드 이미지에서 배경 제거·업스케일링해 만든 PNG를 쓰고,
> 일부 캐릭터는 직접 그린 SVG로 보조합니다(로드 실패 시 SVG 폴백).

## ✨ 기능

- 📝 **12문항 A/B 선택지 테스트** (약 1분 소요)
- 🎯 **4축 채점 엔진** — 각 축마다 마지막 문항을 가중치 2로 두어 동점(50/50) 발생 방지
- 🎭 **캐릭터 8종 매핑** — 치이카와 · 하치와레 · 우사기 · 모몽가 · 라ッ코 · 시이사 · 크리만주 선배 · 아머씨
- 📊 **성향 그래프** — 축별 퍼센트와 애니메이션 막대
- 💞 **케미 추천** — 결과 캐릭터와 잘 맞는 친구 2명
- 🖼 **결과 카드 PNG 다운로드** — 초상(PNG/SVG)→캔버스 렌더링으로 SNS 공유용 이미지 생성
- 🎞 **캐릭터 모션** — 미세 바운스·눈 깜빡임 애니메이션, 호버 시 점프 (reduced-motion 대응)
- 🔊 **효과음 & BGM** — 선택·확인·결과 팬파레 효과음과 루프 BGM. 첫 클릭에서 시작하고
  우하단 버튼으로 음소거(저장됨). 에셋은 `scripts/generate_audio.py`로 재생성
- 🔗 **공유 링크** — `?r=INFP` 같은 결과 URL 복사 (축 점수 포함 시 그래프까지 복원)
- 💾 **진행 저장** — 새로고침/뒤로가기에도 세션 유지
- 📱 **모바일 대응** · 접근성(키보드 조작, 텍스트 대비, reduced-motion 대응)

## 🚀 실행

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm test         # Vitest 단위 테스트 (채점/인코딩)
npm run lint     # oxlint
npm run build    # tsc -b + vite build → dist/
npm run preview  # 빌드 산출물 미리보기
```

```bash
python scripts/generate_audio.py   # public/audio/*.wav 효과음·BGM 재생성 (numpy)
```

## 🗂 구조

```
src/
├─ data/
│  ├─ questions.ts      # 12문항 (4축 × 3문항, 가중치 1·2·2)
│  └─ characters.ts     # 캐릭터 8종 프로필 + 16 MBTI 유형 매핑
├─ engine/
│  ├─ scoring.ts        # 채점 엔진 + 공유 인코딩/디코딩
│  └─ scoring.test.ts   # 단위 테스트 13개
├─ components/
│  ├─ CharacterArt.tsx  # 캐릭터 초상 PNG(7종) + SVG 폴백
│  ├─ Landing.tsx       # 랜딩
│  ├─ MuteButton.tsx    # 소리 켜기/끄기 고정 버튼
│  ├─ Quiz.tsx          # 질문 화면 (진행바, A/B)
│  └─ Result.tsx        # 결과 (그래프, 케미, PNG 카드, 공유)
├─ audio.ts             # 효과음/BGM 재생 · 음소거 설정 저장
└─ App.tsx              # 화면 전환 · 진행 저장 · 공유 링크 복원
```

## 🌐 배포 (GitHub Pages)

저장소에 push하면 **GitHub Actions가 자동으로 테스트→빌드→배포**합니다.

1. GitHub에 저장소 생성 후 push
2. 저장소 **Settings → Pages → Source** 를 **GitHub Actions** 로 설정
3. `main`(또는 `master`) 브랜치에 push하면 자동 배포

`vite.config.ts`의 `base: './'`가 상대 경로로 빌드하므로
사용자 페이지(`username.github.io/repo`)에서도 동작합니다.

## 📄 라이선스/고지

- 코드: 자유롭게 사용 가능 (팬메이드)
- 캐릭터: 원작자(Nagano) 권리 — 비상업 팬콘텐츠 범위 내에서만
