import { useEffect, useState } from 'react'
import Landing from './components/Landing'
import Quiz from './components/Quiz'
import Result from './components/Result'
import { QUESTIONS } from './data/questions'
import { decodeResult, scoreAnswers, type Answers, type TestResult } from './engine/scoring'

type Screen = 'landing' | 'quiz' | 'result'

const STORAGE_KEY = 'chiikawa-mbti-progress'

interface Progress {
  answers: Answers
  index: number
}

function loadProgress(): Progress | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Progress
    if (!Array.isArray(parsed.answers) || parsed.answers.length !== QUESTIONS.length) {
      return null
    }
    if (typeof parsed.index !== 'number' || parsed.index >= QUESTIONS.length) return null
    // 다 채워진 항목이 있는지 확인 (모두 -1이면 새 진행)
    if (parsed.answers.every((a) => a === -1)) return null
    return parsed
  } catch {
    return null
  }
}

function saveProgress(p: Progress) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(p))
  } catch {
    /* 저장 실패는 무시 */
  }
}

function clearProgress() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* 무시 */
  }
}

/** 공유 링크(?r=TYPE) 여부 확인 */
function readSharedResult(): TestResult | null {
  const param = new URLSearchParams(window.location.search).get('r')
  if (!param) return null
  return decodeResult(param)
}

export default function App() {
  const [shared] = useState<TestResult | null>(() => readSharedResult())
  const [screen, setScreen] = useState<Screen>(() =>
    readSharedResult() ? 'result' : 'landing',
  )
  const [result, setResult] = useState<TestResult | null>(shared)
  const [progress, setProgress] = useState<Progress>(() => {
    const saved = loadProgress()
    return saved ?? { answers: Array(QUESTIONS.length).fill(-1), index: 0 }
  })
  const [resumable] = useState<boolean>(() => loadProgress() !== null)

  // 진행 상황 자동 저장
  useEffect(() => {
    if (screen === 'quiz') saveProgress(progress)
  }, [progress, screen])

  const start = () => {
    const saved = loadProgress()
    if (saved) setProgress(saved)
    setScreen('quiz')
  }

  const answer = (questionIndex: number, optionIndex: number) => {
    setProgress((prev) => {
      const answers = [...prev.answers]
      answers[questionIndex] = optionIndex
      const next: Progress = {
        answers,
        index: Math.min(questionIndex + 1, QUESTIONS.length - 1),
      }
      return next
    })
  }

  const back = () => {
    setProgress((prev) => ({
      ...prev,
      index: Math.max(prev.index - 1, 0),
    }))
  }

  /** Quiz가 완료 시 최신 답변 전체를 전달하므로 stale state 문제 없음 */
  const finish = (finalAnswers: Answers) => {
    if (finalAnswers.some((a) => a === -1)) {
      setScreen('quiz')
      return
    }
    try {
      const r = scoreAnswers(finalAnswers)
      setResult(r)
      clearProgress()
      setScreen('result')
      window.scrollTo({ top: 0 })
    } catch {
      /* 계산 실패 시 질문 화면 유지 */
      setScreen('quiz')
    }
  }

  const restart = () => {
    clearProgress()
    setResult(null)
    setProgress({ answers: Array(QUESTIONS.length).fill(-1), index: 0 })
    // 공유 링크에서 왔다면 쿼리 제거
    if (window.location.search) {
      window.history.replaceState(null, '', window.location.pathname)
    }
    setScreen('landing')
    window.scrollTo({ top: 0 })
  }

  if (screen === 'result' && result) {
    return (
      <Result result={result} shared={shared !== null} onRestart={restart} />
    )
  }

  if (screen === 'quiz') {
    return (
      <Quiz
        answers={progress.answers}
        index={progress.index}
        onAnswer={answer}
        onBack={back}
        onFinish={finish}
      />
    )
  }

  return <Landing onStart={start} resumable={resumable} />
}
