"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Zap } from "lucide-react"
import TraditionalConsensusVisualization from "@/components/traditional-consensus-visualization"
import QuorumStoreVisualization from "@/components/network-visualization"
import StepIndicator from "@/components/step-indicator"

export default function QuorumStoreDashboard() {
  const [isAnimating, setIsAnimating] = useState(false)
  const [traditionStep, setTraditionStep] = useState(0)
  const [quorumStep, setQuorumStep] = useState(0)
  const [selectedStep, setSelectedStep] = useState(1)

  // Animation timing for traditional consensus (10-15 seconds total)
  useEffect(() => {
    if (!isAnimating) {
      setTraditionStep(0)
      return
    }

    const timeline = [
      { step: 1, time: 500 }, // Start immediately
      { step: 2, time: 2500 }, // Long data propagation phase (bottleneck)
      { step: 3, time: 8000 }, // Leader consensus phase
      { step: 4, time: 12000 }, // Complete
    ]

    const timers = timeline.map((item) =>
      setTimeout(() => setTraditionStep(item.step), item.time)
    )

    return () => timers.forEach((timer) => clearTimeout(timer))
  }, [isAnimating])

  // Animation timing for Quorum Store (1-2 seconds total)
  useEffect(() => {
    if (!isAnimating) {
      setQuorumStep(0)
      return
    }

    const timeline = [
      { step: 1, time: 100 }, // Nearly instant
      { step: 2, time: 400 }, // Very fast data propagation
      { step: 3, time: 900 }, // Lightweight consensus
      { step: 4, time: 1400 }, // Complete
    ]

    const timers = timeline.map((item) =>
      setTimeout(() => setQuorumStep(item.step), item.time)
    )

    return () => timers.forEach((timer) => clearTimeout(timer))
  }, [isAnimating])

  const handleCompare = () => {
    setIsAnimating(true)
    // Traditional consensus takes longer (~12 seconds total animation)
    // Quorum store finishes much earlier (~1.4 seconds)
    setTimeout(() => {
      setIsAnimating(false)
    }, 13000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 shadow-lg shadow-primary/10">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-balance">
                Aptos Quorum Store
              </h1>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
                기존 합의와 Quorum Store의 속도 차이를 경험하세요
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-5xl mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Timeline Section - THE JOURNEY */}
          <div className="mb-12 rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm">
            <p className="mb-8 text-center text-xs font-bold tracking-widest text-muted-foreground uppercase">
              Quorum Store의 여정
            </p>

            {/* Step Icons - Horizontal Layout */}
            <div className="mb-8">
              <div className="flex tems-start justify-between gap-0 w-full relative">
                {/* Connection Lines */}
                <div className="absolute top-7 h-0.5 bg-gray-300 z-0" style={{ left: "12.5%", right: "12.5%" }} />

                {[
                  { id: 1, icon: "🔑", label: "Tx Submission", time: "< 0.1s" },
                  { id: 2, icon: "📡", label: "Data Dissemination", time: "~ 0.5s" },
                  { id: 3, icon: "⚖️", label: "Metadata Ordering", time: "~ 0.1s" },
                  { id: 4, icon: "⚡", label: "Parallel Finalization", time: "~ 0.2s" },
                ].map((step, index) => (
                  <div key={step.id} className="flex flex-1 flex-col items-center relative z-10">
                    {/* Icon Circle */}
                    <button
                      onMouseEnter={() => setSelectedStep(step.id)}
                      className={`relative z-10 mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 text-2xl transition-all duration-300 ${
                        selectedStep === step.id
                          ? "border-primary bg-white bg-primary/20 scale-110 shadow-lg shadow-primary/30"
                          : "border-gray-300 bg-gray-100 hover:border-primary hover:bg-gray-200"
                      }`}
                    >
                      {step.icon}
                    </button>

                    {/* Label */}
                    <p className="text-center text-xs font-medium text-foreground whitespace-nowrap">
                      {step.label}
                    </p>
                    <p className="text-center text-xs font-semibold text-primary">
                      {step.time}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Detail Card */}
            <div className="rounded-xl max-w-5xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-3">
              {selectedStep === 1 && (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                      <span className="text-2xl">🔑</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">1단계: Tx Submission</h3>
                      <p className="text-xs text-primary font-semibold">EXECUTION</p>
                    </div>
                    <span className="ml-auto text-xs font-semibold text-primary">0.1s</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    유저의 트랜잭션이 개별 노드에 도착하고, 효율적인 처리를 위해 'Batch' 단위로 묶입니다.
                  </p>
                  <div className="rounded-lg bg-background/50 p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">TECHNICAL</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      개별 트랜잭션들이 Batch로 수집되며, 이는 네트워크 효율성을 극대화합니다.
                    </p>
                  </div>
                </>
              )}

              {selectedStep === 2 && (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                      <span className="text-2xl">📡</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">2단계: Data Dissemination</h3>
                      <p className="text-xs text-primary font-semibold">CONSENSUS</p>
                    </div>
                    <span className="ml-auto text-xs font-semibold text-primary">~ 0.5s</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    합의 전, 모든 노드에 배치를 미리 전파합니다. 2/3 이상의 서명을 받아 <strong>PoA(가용성 증명)</strong>를 확보합니다.
                  </p>
                  <div className="rounded-lg bg-background/50 p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">TECHNICAL</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      모든 검증자 노드에 동시에 배치 데이터를 전파하고, Availability Certificate 획득.
                    </p>
                  </div>
                </>
              )}

              {selectedStep === 3 && (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                      <span className="text-2xl">⚖️</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">3단계: Metadata Ordering</h3>
                      <p className="text-xs text-primary font-semibold">CONSENSUS</p>
                    </div>
                    <span className="ml-auto text-xs font-semibold text-primary">~ 0.1s</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    리더는 무거운 데이터 대신 <strong>배치 ID 목록(Metadata)</strong>만 제안합니다. 노드들은 이미 데이터를 갖고 있어 즉시 합의합니다.
                  </p>
                  <div className="rounded-lg bg-background/50 p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">TECHNICAL</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      배치 메타데이터(해시, ID)만으로 순서 합의를 진행하여 합의 속도 대폭 단축.
                    </p>
                  </div>
                </>
              )}

              {selectedStep === 4 && (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">4단계: Parallel Finalization</h3>
                      <p className="text-xs text-primary font-semibold">EXECUTION</p>
                    </div>
                    <span className="ml-auto text-xs font-semibold text-primary">~ 0.2s</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    합의된 순서에 따라 트랜잭션을 병렬로 실행하고 최종 확정(Commit)합니다.
                  </p>
                  <div className="rounded-lg bg-background/50 p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">TECHNICAL</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      모든 노드에서 동시에 트랜잭션을 병렬로 실행하고 상태 변경 확정.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-center text-xs font-semibold text-primary">
                총 소요 시간: &lt; 1.4초
              </p>
            </div>
          </div>

          {/* Visualization Section */}
          <h2 className="mb-8 text-center text-2xl font-bold">직접 체험해보세요</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Traditional Consensus - Left */}
            <div>
              <h3 className="mb-4 text-center text-xl font-bold text-foreground">
                기존 합의 방식
              </h3>
              <p className="mb-3 text-center text-sm text-muted-foreground">
                순차 처리 · 느림 · 병목 현상
              </p>
              <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/80 shadow-2xl shadow-orange-500/5 backdrop-blur-sm">
                <div className="h-[350px] w-full">
                  <TraditionalConsensusVisualization
                    isAnimating={isAnimating}
                  />
                </div>
              </div>

              {/* Traditional Progress Indicator */}
              <div className="mt-6">
                <StepIndicator
                  currentStep={traditionStep}
                  type="traditional"
                  isAnimating={isAnimating}
                />
              </div>

              {/* Time Display */}
              <p className="mt-4 text-center text-xs font-semibold text-orange-600">
                {isAnimating && traditionStep < 4 ? "⏱️ ~12초" : ""}
              </p>
            </div>

            {/* Quorum Store - Right */}
            <div>
              <h3 className="mb-4 text-center text-xl font-bold text-foreground">
                Quorum Store
              </h3>
              <p className="mb-3 text-center text-sm text-muted-foreground">
                병렬 처리 · 빠름 · 즉시 합의
              </p>
              <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/80 shadow-2xl shadow-primary/5 backdrop-blur-sm">
                <div className="h-[350px] w-full">
                  <QuorumStoreVisualization isAnimating={isAnimating} />
                </div>
              </div>

              {/* Quorum Progress Indicator */}
              <div className="mt-6">
                <StepIndicator
                  currentStep={quorumStep}
                  type="quorum"
                  isAnimating={isAnimating}
                />
              </div>

              {/* Time Display */}
              <p className="mt-4 text-center text-xs font-semibold text-primary">
                {isAnimating && quorumStep === 4
                  ? "✅ 1.4초 만에 완료!"
                  : isAnimating
                    ? "⚡ ~1.4초"
                    : ""}
              </p>
            </div>
          </div>

          {/* Compare Button - Center */}
          <div className="mt-12 flex justify-center">
            <Button
              onClick={handleCompare}
              disabled={isAnimating}
              size="lg"
              className="group h-16 gap-3 rounded-full bg-primary px-12 text-lg font-bold shadow-2xl shadow-primary/40 transition-all hover:scale-110 hover:shadow-2xl hover:shadow-primary/60 disabled:scale-95 disabled:opacity-60"
            >
              <Sparkles className="h-6 w-6 transition-transform group-hover:rotate-12" />
              {isAnimating ? "처리 중..." : "두 방식 비교"}
              <Sparkles className="h-6 w-6 transition-transform group-hover:-rotate-12" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
