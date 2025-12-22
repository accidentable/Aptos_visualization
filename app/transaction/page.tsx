"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, Sun, Moon } from "lucide-react"
import TraditionalConsensusVisualization from "@/components/traditional-consensus-visualization"
import QuorumStoreVisualization from "@/components/network-visualization"
import StepIndicator from "@/components/step-indicator"

export default function QuorumStoreDashboard() {
  const router = useRouter()
  const [isAnimating, setIsAnimating] = useState(false)
  const [traditionStep, setTraditionStep] = useState(0)
  const [quorumStep, setQuorumStep] = useState(0)
  const [selectedStep, setSelectedStep] = useState(1)
  const [language, setLanguage] = useState<"ko" | "en">("ko")
  const [isDark, setIsDark] = useState(false)

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
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-white"}`}>
      {/* Header */}
      <header className={`border-b ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} sticky top-0 z-50`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className={`flex items-center gap-2 ${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"} transition-colors`}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage(language === "ko" ? "en" : "ko")}
                className={`px-3 py-1 text-xs font-medium border rounded transition-colors ${
                  isDark 
                    ? "border-gray-600 text-gray-400 hover:text-gray-200 hover:border-gray-500" 
                    : "border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400"
                }`}
              >
                {language === "ko" ? "EN" : "KO"}
              </button>
              <button
                onClick={() => setIsDark(!isDark)}
                className={`p-1.5 rounded transition-colors ${
                  isDark 
                    ? "bg-gray-700 text-yellow-400 hover:bg-gray-600" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <div className={`border-b ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-100 bg-white"}`}>
        <div className="container mx-auto px-4 py-8">
          <p className={`text-xs font-semibold tracking-widest uppercase mb-3 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
            {new Date().toLocaleDateString("ko-KR")} · 9 min
          </p>
          <h1 className={`text-5xl font-bold tracking-tight mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
            {language === "ko" ? "Transaction의 여정" : "The Life of a Transaction"}
          </h1>
          <p className={`text-base max-w-2xl ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {language === "ko" 
              ? "Quorum Store를 통해 트랜잭션이 처리되는 전 과정을 시각화로 체험해보세요"
              : "Experience the complete transaction processing through Quorum Store with interactive visualizations"
            }
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className={`container max-w-6xl mx-auto px-4 py-12 ${isDark ? "bg-gray-900" : ""}`}>
        {/* Timeline Section */}
        <div className={`mb-16 border p-8 ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
          <p className={`mb-8 text-left text-xs font-semibold tracking-widest uppercase ${isDark ? "text-gray-500" : "text-gray-500"}`}>
            4단계 프로세스
          </p>

          {/* Step Icons - Horizontal Layout */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-0 w-full relative">
              {/* Connection Lines */}
              <div className="absolute top-6 h-0.5 bg-gray-300 z-0" style={{ left: "12.5%", right: "12.5%" }} />

              {[
                { id: 1, label: "Tx Submission", time: "< 0.1s" },
                { id: 2, label: "Data Dissemination", time: "~ 0.5s" },
                { id: 3, label: "Metadata Ordering", time: "~ 0.1s" },
                { id: 4, label: "Parallel Finalization", time: "~ 0.2s" },
              ].map((step) => (
                <div key={step.id} className="flex flex-1 flex-col items-center relative z-10">
                  {/* Number Circle */}
                  <button
                    onMouseEnter={() => setSelectedStep(step.id)}
                    className={`relative z-10 mb-4 flex h-12 w-12 items-center justify-center border transition-all duration-300 text-sm font-semibold ${
                      selectedStep === step.id
                        ? isDark ? "border-white bg-white text-gray-900 scale-110" : "border-gray-900 bg-gray-900 text-white scale-110"
                        : isDark ? "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500" : "border-gray-300 bg-white text-gray-900 hover:border-gray-900"
                    }`}
                  >
                    {step.id}
                  </button>

                  {/* Label */}
                  <p className={`text-center text-xs font-semibold whitespace-nowrap ${isDark ? "text-gray-300" : "text-gray-900"}`}>
                    {step.label}
                  </p>
                  <p className="text-center text-xs text-gray-600 whitespace-nowrap">
                    {step.time}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Detail Card */}
          <div className={`border p-6 ${isDark ? "border-gray-700 bg-gray-700" : "border-gray-200 bg-gray-50"}`}>
            {selectedStep === 1 && (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">1단계: Tx Submission</h3>
                  <p className="text-xs text-gray-600 font-medium">EXECUTION</p>
                </div>
                <p className="text-sm text-gray-700 mb-4">
                  유저의 트랜잭션이 개별 노드에 도착하고, 효율적인 처리를 위해 'Batch' 단위로 묶입니다.
                </p>
                <div className="border border-gray-200 bg-white p-4">
                  <p className="text-xs font-semibold text-gray-600 mb-1">TECHNICAL DETAILS</p>
                  <p className="text-xs text-gray-600 font-mono">
                    개별 트랜잭션들이 Batch로 수집되며, 이는 네트워크 효율성을 극대화합니다.
                  </p>
                </div>
              </>
            )}

            {selectedStep === 2 && (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">2단계: Data Dissemination</h3>
                  <p className="text-xs text-gray-600 font-medium">CONSENSUS</p>
                </div>
                <p className="text-sm text-gray-700 mb-4">
                  합의 전, 모든 노드에 배치를 미리 전파합니다. 2/3 이상의 서명을 받아 <strong>PoA(가용성 증명)</strong>를 확보합니다.
                </p>
                <div className="border border-gray-200 bg-white p-4">
                  <p className="text-xs font-semibold text-gray-600 mb-1">TECHNICAL DETAILS</p>
                  <p className="text-xs text-gray-600 font-mono">
                    모든 검증자 노드에 동시에 배치 데이터를 전파하고, Availability Certificate 획득.
                  </p>
                </div>
              </>
            )}

            {selectedStep === 3 && (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">3단계: Metadata Ordering</h3>
                  <p className="text-xs text-gray-600 font-medium">CONSENSUS</p>
                </div>
                <p className="text-sm text-gray-700 mb-4">
                  리더는 무거운 데이터 대신 <strong>배치 ID 목록(Metadata)</strong>만 제안합니다. 노드들은 이미 데이터를 갖고 있어 즉시 합의합니다.
                </p>
                <div className="border border-gray-200 bg-white p-4">
                  <p className="text-xs font-semibold text-gray-600 mb-1">TECHNICAL DETAILS</p>
                  <p className="text-xs text-gray-600 font-mono">
                    배치 메타데이터(해시, ID)만으로 순서 합의를 진행하여 합의 속도 대폭 단축.
                  </p>
                </div>
              </>
            )}

            {selectedStep === 4 && (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">4단계: Parallel Finalization</h3>
                  <p className="text-xs text-gray-600 font-medium">EXECUTION</p>
                </div>
                <p className="text-sm text-gray-700 mb-4">
                  합의된 순서에 따라 트랜잭션을 병렬로 실행하고 최종 확정(Commit)합니다.
                </p>
                <div className="border border-gray-200 bg-white p-4">
                  <p className="text-xs font-semibold text-gray-600 mb-1">TECHNICAL DETAILS</p>
                  <p className="text-xs text-gray-600 font-mono">
                    모든 노드에서 동시에 트랜잭션을 병렬로 실행하고 상태 변경 확정.
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="mt-6 border border-gray-200 bg-gray-50 p-4 text-center">
            <p className="text-sm font-semibold text-gray-900">
              총 소요 시간: &lt; 1.4초
            </p>
          </div>
        </div>

        {/* Visualization Section */}
        <div>
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">직접 체험해보세요</h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 mb-12">
            {/* Traditional Consensus - Left */}
            <div>
              <h3 className="mb-4 text-center text-lg font-bold text-gray-900">
                기존 합의 방식
              </h3>
              <p className="mb-4 text-center text-sm text-gray-600">
                순차 처리 · 느림 · 병목 현상
              </p>
              <div className="relative border border-gray-200 bg-white">
                <div className="h-80 w-full">
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
              <p className="mt-4 text-center text-sm font-semibold text-gray-700">
                {isAnimating && traditionStep < 4 ? "~12초" : ""}
              </p>
            </div>

            {/* Quorum Store - Right */}
            <div>
              <h3 className="mb-4 text-center text-lg font-bold text-gray-900">
                Quorum Store
              </h3>
              <p className="mb-4 text-center text-sm text-gray-600">
                병렬 처리 · 빠름 · 즉시 합의
              </p>
              <div className="relative border border-gray-200 bg-white">
                <div className="h-80 w-full">
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
              <p className="mt-4 text-center text-sm font-semibold text-gray-900">
                {isAnimating && quorumStep === 4
                  ? "1.4초 만에 완료!"
                  : isAnimating
                    ? "~1.4초"
                    : ""}
              </p>
            </div>
          </div>

          {/* Compare Button - Center */}
          <div className="flex justify-center">
            <Button
              onClick={handleCompare}
              disabled={isAnimating}
              className="gap-2 bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed px-8 py-3 text-base font-semibold transition-all"
            >
              <Play className="h-4 w-4" />
              {isAnimating ? "처리 중..." : "비교 시작"}
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} mt-16`}>
        <div className="container max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Built by <span className={`font-medium ${isDark ? "text-gray-200" : "text-gray-900"}`}>@Ray</span> <span className={isDark ? "text-gray-500" : "text-gray-400"}>Aptos</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
