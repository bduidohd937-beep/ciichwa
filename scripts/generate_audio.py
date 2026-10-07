#!/usr/bin/env python3
"""나는 어떤 치이카와? 오디오 에셋 생성기

ffmpeg 없이(의존성: numpy) 정적 WAV 파일을 만든다.
  - pop.wav      정답 선택 등 가벼운 클릭음
  - chime.wav    시작/완료 확인음
  - fanfare.wav  결과 확정 팬파레
  - bgm.wav      8마디 루프 BGM (매듭 회귀로 이음매 없음)

실행: python scripts/generate_audio.py
출력: public/audio/*.wav
"""

from __future__ import annotations

import os
import wave

import numpy as np

SR_SFX = 22050
SR_BGM = 16000
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "audio")


# ── 공통 유틸 ─────────────────────────────────────────────
def write_wav(name: str, data: np.ndarray, sr: int) -> None:
    data = np.asarray(data, dtype=np.float64)
    peak = float(np.max(np.abs(data))) or 1.0
    data = np.clip(data / peak * 0.85, -1.0, 1.0)
    pcm = (data * 32767.0).astype(np.int16)
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, name)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm.tobytes())
    rms = float(np.sqrt(np.mean(np.square(data))))
    kb = os.path.getsize(path) / 1024
    print(f"{name:12s} {len(pcm) / sr:6.2f}s  {kb:7.1f}KB  rms={rms:.3f}")


def bell(
    freq: float,
    dur: float,
    amp: float,
    decay: float,
    sr: int,
    harm: tuple = ((1, 1.0), (2, 0.3), (3, 0.12)),
    attack: float = 0.003,
) -> np.ndarray:
    """자연 감쇠 종 괘음(음악상자 톤)"""
    n = int(dur * sr)
    t = np.arange(n) / sr
    sig = np.zeros(n)
    total = 0.0
    for k, a in harm:
        sig += a * np.sin(2 * np.pi * freq * k * t)
        total += a
    env = np.clip(t / attack, 0.0, 1.0) * np.exp(-t / decay)
    return amp * (sig / total) * env


def sweep(f0: float, f1: float, dur: float, amp: float, tau: float, sr: int) -> np.ndarray:
    """피치 글라이드 블립(팝 소리)"""
    n = int(dur * sr)
    t = np.arange(n) / sr
    f = f0 * (f1 / f0) ** (t / dur)
    ph = 2 * np.pi * np.cumsum(f) / sr
    sig = (np.sin(ph) + 0.25 * np.sin(2 * ph)) / 1.25
    env = np.clip(t / 0.004, 0.0, 1.0) * np.exp(-t / tau)
    return amp * sig * env


def pad(freq: float, dur: float, amp: float, sr: int) -> np.ndarray:
    """부드러운 지속 톤"""
    n = int(dur * sr)
    t = np.arange(n) / sr
    sig = (np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * freq * 2 * t)) / 1.3
    attack, release = 0.08, 0.3
    env = np.clip(t / attack, 0.0, 1.0) * np.clip((dur - t) / release, 0.0, 1.0)
    return amp * sig * env


def place(buf: np.ndarray, t0: float, sig: np.ndarray, sr: int, gain: float = 1.0) -> None:
    i = int(round(t0 * sr))
    end = min(i + len(sig), len(buf))
    if i < len(buf) and end > i:
        buf[i:end] += sig[: end - i] * gain


# ── SFX ───────────────────────────────────────────────────
def make_pop() -> np.ndarray:
    sr = SR_SFX
    buf = np.zeros(int(0.22 * sr))
    place(buf, 0.0, sweep(460, 980, 0.16, 0.9, 0.05, sr), sr)
    place(buf, 0.0, bell(1900, 0.06, 0.3, 0.016, sr, harm=((1, 1.0), (2, 0.2)), attack=0.001), sr)
    return buf


def make_chime() -> np.ndarray:
    sr = SR_SFX
    buf = np.zeros(int(1.0 * sr))
    for t0, f, g in ((0.0, 1046.50, 1.0), (0.09, 1318.51, 0.95), (0.18, 1567.98, 0.9)):
        place(buf, t0, bell(f, 0.8, 1.0, 0.22, sr), sr, g)
    place(buf, 0.0, bell(523.25, 0.9, 0.5, 0.3, sr), sr)
    return buf


def make_fanfare() -> np.ndarray:
    sr = SR_SFX
    buf = np.zeros(int(2.6 * sr))
    arp = (
        (0.00, 523.25),
        (0.11, 659.26),
        (0.22, 783.99),
        (0.33, 1046.50),
        (0.46, 1318.51),
    )
    for t0, f in arp:
        place(buf, t0, bell(f, 1.4, 1.0, 0.4, sr), sr)
    for f in (523.25, 659.26, 783.99):  # 착지 코드
        place(buf, 0.62, bell(f, 1.8, 0.7, 0.75, sr), sr)
    place(buf, 0.62, bell(130.81, 1.8, 0.8, 0.7, sr, harm=((1, 1.0), (2, 0.15))), sr)
    for t0, f in ((0.85, 2093.0), (1.0, 2349.32), (1.15, 3135.96)):  # 반짝임
        place(buf, t0, bell(f, 0.5, 0.3, 0.12, sr, attack=0.002), sr, 0.6)
    return buf


# ── BGM (8마디 I–V–vi–IV / I–V–IV–V, 100 BPM) ───────────
C5, D5, E5, F5, G5, A5, B5 = 523.25, 587.33, 659.26, 698.46, 783.99, 880.00, 987.77
C6, D6, E6, G6 = 1046.50, 1174.66, 1318.51, 1567.98
C3, G2, A2, F2 = 130.81, 98.00, 110.00, 87.31

# (마디별 멜로디: (비트 오프셋, 주파수))
MELODY = [
    [(0.0, E6), (1.0, C6), (1.5, D6), (2.0, E6), (3.0, G5), (3.5, A5)],      # C
    [(0.0, B5), (1.0, D6), (2.0, G5), (3.0, A5), (3.5, B5)],                 # G
    [(0.0, C6), (1.0, A5), (1.5, C6), (2.0, E5), (3.0, G5), (3.5, A5)],      # Am
    [(0.0, F5), (1.0, A5), (2.0, C6), (3.0, A5), (3.5, G5)],                 # F
    [(0.0, G6), (1.0, E6), (1.5, G6), (2.0, C6), (3.0, D6), (3.5, E6)],      # C
    [(0.0, D6), (1.0, B5), (2.0, D6), (3.0, G5), (3.5, A5)],                 # G
    [(0.0, C6), (1.0, A5), (1.5, F5), (2.0, A5), (3.0, C6), (3.5, D6)],      # F
    [(0.0, B5), (1.0, G5), (2.0, D6), (3.0, B5), (3.5, D6)],                 # G
]
ROOTS = [C3, G2, A2, F2, C3, G2, F2, G2]


def make_bgm() -> np.ndarray:
    sr = SR_BGM
    bpm = 100
    beat = 60.0 / bpm                       # 0.6s → 정수 샘플(9600)
    beats_total = 8 * 4
    loop_len = int(round(beats_total * beat * sr))
    tail = int(2.0 * sr)
    buf = np.zeros(loop_len + tail)

    # 멜로디(음악상자)
    for bar, notes in enumerate(MELODY):
        for off, f in notes:
            t0 = (bar * 4 + off) * beat
            place(buf, t0, bell(f, 1.0, 0.55, 0.26, sr, harm=((1, 1.0), (2, 0.35), (3, 0.1)), attack=0.002), sr)

    # 베이스 + 패드
    for bar, root in enumerate(ROOTS):
        base = bar * 4 * beat
        place(buf, base, bell(root, 1.2, 0.5, 0.5, sr, harm=((1, 1.0), (2, 0.2)), attack=0.008), sr)
        place(buf, base + 2 * beat, bell(root, 1.0, 0.32, 0.4, sr, harm=((1, 1.0), (2, 0.2)), attack=0.008), sr)
        place(buf, base, pad(root * 2, 4 * beat, 0.12, sr), sr)

    # 루프 이음매 제거: 마디 밖으로 새는 잔향을 처음으로 되돌린다
    out = buf[:loop_len].copy()
    out[:tail] += buf[loop_len : loop_len + tail]
    return out


def main() -> None:
    write_wav("pop.wav", make_pop(), SR_SFX)
    write_wav("chime.wav", make_chime(), SR_SFX)
    write_wav("fanfare.wav", make_fanfare(), SR_SFX)
    bgm = make_bgm()
    write_wav("bgm.wav", bgm, SR_BGM)
    # 이음매 연속성: 경계 앞뒤 1차 차분이 평균 차분 수준인지 확인
    d_edge = abs(bgm[0] - bgm[-1])
    d_avg = float(np.mean(np.abs(np.diff(bgm))))
    print(f"bgm seam: edge_diff={d_edge:.4f} avg_diff={d_avg:.4f}")


if __name__ == "__main__":
    main()
