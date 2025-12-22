"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Sun, Moon, Check, RotateCcw } from "lucide-react"

interface TransactionStep {
  id: number
  titleKo: string
  titleEn: string
  descriptionKo: string
  descriptionEn: string
  detailsKo: string
  detailsEn: string
  categoryKo: string
  categoryEn: string
}

export default function TransactionJourney() {
  const router = useRouter()
  const [language, setLanguage] = useState<"ko" | "en">("ko")
  const [isDark, setIsDark] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Step 1 states
  const [step1Amount, setStep1Amount] = useState("")
  const [step1Signature, setStep1Signature] = useState(false)
  const [step1Completed, setStep1Completed] = useState(false)
  const [step1ShowStamp, setStep1ShowStamp] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)

  // Add stamp animation styles
  useEffect(() => {
    if (typeof document !== "undefined" && !document.getElementById("stamp-animation-styles")) {
      const style = document.createElement("style")
      style.id = "stamp-animation-styles"
      style.textContent = `
        @keyframes stampDrop {
          0% {
            transform: translateY(-80px) rotate(-15deg) scale(0.3);
            opacity: 0;
          }
          70% {
            transform: translateY(0) rotate(5deg) scale(1.05);
            opacity: 1;
          }
          85% {
            transform: translateY(0) rotate(-2deg) scale(0.98);
            opacity: 1;
          }
          100% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
        }
        
        .stamp-animation {
          animation: stampDrop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = 280
      canvas.height = 80
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.fillStyle = isDark ? "#111827" : "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }
  }, [isDark])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    setIsDrawing(true)
    const ctx = canvas.getContext("2d")
    if (ctx) {
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      ctx.beginPath()
      ctx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY)
      ctx.lineWidth = 2
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.strokeStyle = isDark ? "#d1d5db" : "#1f2937"
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (ctx) {
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      ctx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY)
      ctx.stroke()
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.closePath()
        // Check if canvas has drawing (not empty)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        let hasDrawing = false
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] > 128) {
            hasDrawing = true
            break
          }
        }
        if (hasDrawing) {
          setStep1Signature(true)
        }
      }
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.fillStyle = isDark ? "#111827" : "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        setStep1Signature(false)
      }
    }
  }

  const handleStep1Submit = () => {
    if (step1Amount && step1Signature) {
      setStep1ShowStamp(true)
      setTimeout(() => {
        setStep1ShowStamp(false)
        setStep1Completed(true)
        setCurrentStep(2)
      }, 3000)
    }
  }

  const transactionSteps: TransactionStep[] = [
    {
      id: 1,
      titleKo: "트랜잭션 생성 및 서명",
      titleEn: "Transaction Creation & Signing",
      descriptionKo: "사용자가 지갑이나 SDK를 통해 트랜잭션을 생성하고 서명합니다",
      descriptionEn: "User creates and signs a transaction via wallet or SDK",
      categoryKo: "클라이언트 사이드",
      categoryEn: "Client Side",
      detailsKo: "사용자가 지갑이나 SDK를 통해 트랜잭션(예: 토큰 전송, 스마트 컨트랙트 실행)을 생성하고 개인 키로 서명합니다. 이 단계에서는 트랜잭션의 기본 구조와 의도가 결정됩니다.",
      detailsEn: "The user creates a transaction (e.g., token transfer, smart contract execution) through a wallet or SDK and signs it with their private key. This stage determines the basic structure and intention of the transaction."
    },
    {
      id: 2,
      titleKo: "승인제어",
      titleEn: "Admission Control",
      descriptionKo: "트랜잭션이 REST API를 통해 네트워크에 제출되고 검증됩니다",
      descriptionEn: "Transaction submitted to network via REST API and validated",
      categoryKo: "네트워크 입력",
      categoryEn: "Network Entry",
      detailsKo: "서명된 트랜잭션이 풀노드나 밸리데이터 노드의 REST API를 통해 네트워크에 제출됩니다. 각 노드는 기본적인 유효성 검사(서명 검증, 논스 체크, 잔액 확인 등)를 수행합니다.",
      detailsEn: "The signed transaction is submitted to the network through the REST API of a full node or validator node. Each node performs basic validity checks such as signature verification, nonce checking, and balance confirmation."
    },
    {
      id: 3,
      titleKo: "멤풀",
      titleEn: "Mempool",
      descriptionKo: "유효한 트랜잭션이 노드의 멤풀에 임시 저장됩니다",
      descriptionEn: "Valid transactions stored temporarily in node's mempool",
      categoryKo: "임시 저장소",
      categoryEn: "Temporary Storage",
      detailsKo: "유효성 검사를 통과한 트랜잭션은 노드의 멤풀(Memory Pool)에 임시 저장됩니다. 멤풀은 아직 블록에 포함되지 않은 트랜잭션들을 관리하며, 우선순위에 따라 처리됩니다.",
      detailsEn: "Transactions that pass validation are temporarily stored in the node's mempool (Memory Pool). The mempool manages transactions not yet included in a block and processes them according to priority."
    },
    {
      id: 4,
      titleKo: "쿼럼스토어 - 데이터 전파",
      titleEn: "Quorum Store - Data Propagation",
      descriptionKo: "트랜잭션을 배치로 묶어 다른 밸리데이터에 전파하고 가용성증명을 생성합니다",
      descriptionEn: "Transactions batched and propagated to validators with Proof of Availability",
      categoryKo: "데이터 처리",
      categoryEn: "Data Processing",
      detailsKo: "앱토스는 합의 효율을 높이기 위하여 트랜잭션 데이터 전파와 순서 합의를 분리합니다. 트랜잭션을 배치 단위로 묶어 다른 밸리데이터에게 미리 전파하고, 데이터가 검증되었음을 증명하는 가용성증명(Proof of Availability)을 생성합니다. 2/3 이상의 밸리데이터로부터 PoA를 획득합니다.",
      detailsEn: "Aptos separates transaction data propagation and order consensus for increased efficiency. Transactions are batched and pre-propagated to other validators, with a Proof of Availability generated to certify data validation. PoA is obtained from 2/3+ of validators."
    },
    {
      id: 5,
      titleKo: "합의 - AptosBFT",
      titleEn: "Consensus - AptosBFT",
      descriptionKo: "밸리데이터들은 배치 메타데이터의 순서에 대해 빠르게 합의합니다",
      descriptionEn: "Validators reach rapid consensus on batch metadata ordering",
      categoryKo: "순서 결정",
      categoryEn: "Order Determination",
      detailsKo: "밸리데이터들은 실제 데이터 전체가 아닌 쿼럼스토어에서 생성된 배치들의 메타데이터(증명서) 순서에 대해서만 합의합니다. 이것이 매우 빠른 이유는 모든 트랜잭션 데이터를 순차적으로 옮길 필요가 없기 때문입니다. 가벼운 메타데이터만 합의하여 극도로 높은 처리량을 달성합니다.",
      detailsEn: "Validators reach consensus only on the ordering of batch metadata (certificates) from Quorum Store, not the entire transaction data. This is extremely fast because sequential movement of all transaction data is unnecessary. By consensing only on lightweight metadata, extremely high throughput is achieved."
    },
    {
      id: 6,
      titleKo: "실행 - BlockSTM",
      titleEn: "Execution - BlockSTM",
      descriptionKo: "확정된 순서에 따라 트랜잭션을 병렬로 안전하게 실행합니다",
      descriptionEn: "Execute transactions in parallel safely according to confirmed order",
      categoryKo: "병렬 처리",
      categoryEn: "Parallel Processing",
      detailsKo: "확정된 순서에 따라 트랜잭션을 실행합니다. 이때 핵심 기술인 Block-STM을 사용합니다. 낙관적 실행: 트랜잭션 간의 충돌(이중지불 등)이 없다고 가정하고, 여러 개를 동시에 실행한 뒤, 결과에 문제가 있으면 해당 부분만 다시 실행하여 속도를 극대화합니다. 이를 통해 최대 병렬성을 달성합니다.",
      detailsEn: "Execute transactions according to the confirmed order using Block-STM. Optimistic execution assumes no conflicts between transactions and executes multiple transactions simultaneously. If issues arise, only the affected portions are re-executed to maximize speed. This achieves maximum parallelism."
    },
    {
      id: 7,
      titleKo: "스토리지 커밋",
      titleEn: "Storage & Commit",
      descriptionKo: "실행 결과를 확인하고 Ledger에 영구적으로 기록합니다",
      descriptionEn: "Verify results and permanently record on Ledger",
      categoryKo: "최종 확정",
      categoryEn: "Finalization",
      detailsKo: "실행 결과가 올바른지 다시 한번 확인합니다. 최종 결과가 밸리데이터들에 의해 승인되면 Ledger에 영구적으로 기록됩니다. 이제 트랜잭션은 최종성(Finality)을 갖게 되어 출금이 가능해집니다.",
      detailsEn: "Execution results are verified once more. Once finalized results are approved by validators, they are permanently recorded on the Ledger. The transaction now has finality and can be withdrawn."
    },
  ]

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-white"}`}>
      {/* Header */}
      <header className={`border-b ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} sticky top-0 z-50`}>
        <div className="container mx-auto px-4 py-2 max-w-6xl">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className={`flex items-center gap-2 transition-colors ${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"}`}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCurrentStep(1)
                  setStep1Completed(false)
                  setStep1ShowStamp(false)
                  setStep1Amount("")
                  setStep1Signature(false)
                  clearSignature()
                }}
                className={`px-3 py-1 text-xs font-medium border rounded-none transition-colors ${
                  isDark 
                    ? "border-gray-600 text-gray-400 hover:text-gray-200" 
                    : "border-gray-300 text-gray-600 hover:text-gray-900"
                }`}
              >
                {language === "ko" ? "다시 시작" : "Restart"}
              </button>
              <button
                onClick={() => setLanguage(language === "ko" ? "en" : "ko")}
                className={`px-3 py-1 text-xs font-medium border rounded-none transition-colors ${
                  isDark 
                    ? "border-gray-600 text-gray-400 hover:text-gray-200" 
                    : "border-gray-300 text-gray-600 hover:text-gray-900"
                }`}
              >
                {language === "ko" ? "EN" : "KO"}
              </button>
              <button
                onClick={() => setIsDark(!isDark)}
                className={`p-1.5 rounded-none transition-colors ${
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

      {/* Progress Bar */}
      <div className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"} border-b sticky top-12 z-40`}>
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          {/* Step Numbers */}
          <div className="flex items-center justify-between gap-2 mb-4">
            {Array.from({ length: 7 }).map((_, index) => {
              const stepNum = index + 1
              const isCompleted = stepNum < currentStep
              const isCurrent = stepNum === currentStep
              
              return (
                <div
                  key={stepNum}
                  className={`flex-1 text-center transition-all`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mx-auto transition-all ${
                    isCurrent
                      ? isDark
                        ? "bg-gray-200 text-gray-900 shadow-lg"
                        : "bg-gray-900 text-white shadow-lg"
                      : isCompleted
                        ? isDark
                          ? "bg-gray-600 text-white"
                          : "bg-gray-400 text-white"
                        : isDark
                          ? "bg-gray-700 text-gray-400 hover:bg-gray-600"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}>
                    {isCompleted ? <Check className="h-4 w-4" /> : stepNum === 7 ? "🎉" : stepNum}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Progress Bar */}
          <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? "bg-gray-700" : "bg-gray-300"}`}>
            <div
              className={`h-full transition-all duration-500 ease-out ${
                isDark
                  ? "bg-gradient-to-r from-gray-400 to-gray-200"
                  : "bg-gradient-to-r from-gray-800 to-gray-900"
              }`}
              style={{
                width: `${((currentStep - 1) / 6) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className={`border-b ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-100 bg-white"}`}>
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <p className={`text-xs font-semibold tracking-widest uppercase mb-4 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
            Transaction Lifecycle
          </p>
          <h1 className={`text-5xl md:text-4xl font-bold tracking-tight mb-6 leading-tight ${isDark ? "text-white" : "text-gray-900"}`}>
            {language === "ko" ? "Aptos 체인은 왜 이렇게 빠를까?" : "Why is the Aptos Chain So Fast?"}
          </h1>
          <div className={`text-lg leading-relaxed max-w-2xl ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {language === "ko" ? (
              <>
                Aptos의 기술이 어떻게 트랜잭션을 처리하는지 단계별로 알아봅시다.
                <br className="my-2" />
                각 단계를 클릭하여 인터랙티브하게 체험해보세요.
              </>
            ) : (
              <>
                Learn how Aptos's technology processes transactions step by step.
                <br className="my-2" />
                Click on each stage to experience it interactively.
              </>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className={`container mx-auto px-4 py-16 max-w-4xl ${isDark ? "bg-gray-900" : ""}`}>
        {/* Article Content */}
        <article className="mb-24">
          {transactionSteps.map((step, index) => (
            <section key={step.id} className={`mb-16 pb-16 ${index !== transactionSteps.length - 1 ? `border-b ${isDark ? "border-gray-700" : "border-gray-200"}` : ""}`}>
              <div className="mb-6">
                <p className={`text-sm font-semibold tracking-widest uppercase mb-2 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                  Step {step.id}
                </p>
                <h2 className={`text-2xl md:text-3xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                  {language === "ko" ? step.titleKo : step.titleEn}
                </h2>
                <p className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  {language === "ko" ? step.categoryKo : step.categoryEn}
                </p>
              </div>
              
              <p className={`text-lg leading-relaxed mb-6 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                {language === "ko" ? step.detailsKo : step.detailsEn}
              </p>

              {/* Interactive UI for Step 1 */}
              {step.id === 1 && (
                <div className={`border rounded-none p-8 ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}>
                  <div className={`relative max-w-md mx-auto p-6 rounded-none border-2 ${isDark ? "border-gray-600 bg-gray-900" : "border-gray-300 bg-white"}`}>
                    {/* Stamp Overlay */}
                    {step1ShowStamp && (
                      <div className="stamp-animation absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative w-40 h-40">
                          <svg
                            viewBox="0 0 200 200"
                            className="w-full h-full"
                            style={{
                              filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))"
                            }}
                          >
                            {/* Outer decorative circle */}
                            <circle
                              cx="100"
                              cy="100"
                              r="95"
                              fill="none"
                              stroke="#dc2626"
                              strokeWidth="2"
                              opacity="0.3"
                            />
                            
                            {/* Main circle with star pattern */}
                            <circle
                              cx="100"
                              cy="100"
                              r="85"
                              fill="none"
                              stroke="#dc2626"
                              strokeWidth="4"
                            />
                            
                            {/* Inner circle */}
                            <circle
                              cx="100"
                              cy="100"
                              r="75"
                              fill="none"
                              stroke="#dc2626"
                              strokeWidth="2"
                            />

                            {/* Stars */}
                            <g>
                              <polygon
                                points="155,45 156.5,49 161,49.5 157.5,53 159,58 155,55 151,58 152.5,53 149,49.5 153.5,49"
                                fill="#dc2626"
                              />
                              <polygon
                                points="155,155 156.5,151 161,150.5 157.5,147 159,142 155,145 151,142 152.5,147 149,150.5 153.5,151"
                                fill="#dc2626"
                              />
                              <polygon
                                points="45,155 46.5,151 51,150.5 47.5,147 49,142 45,145 41,142 42.5,147 39,150.5 43.5,151"
                                fill="#dc2626"
                              />
                              <polygon
                                points="45,45 46.5,49 51,49.5 47.5,53 49,58 45,55 41,58 42.5,53 39,49.5 43.5,49"
                                fill="#dc2626"
                              />
                            </g>

                            {/* Checkmark */}
                            <path
                              d="M 70 100 L 90 120 L 135 70"
                              stroke="#dc2626"
                              strokeWidth="8"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />

                            {/* Text paths */}
                            <defs>
                              <path
                                id="topCurve"
                                d="M 30,100 A 70,70 0 0,1 170,100"
                                fill="none"
                              />
                              <path
                                id="bottomCurve"
                                d="M 170,100 A 70,70 0 0,1 30,100"
                                fill="none"
                              />
                            </defs>
                            
                            <text fontSize="14" fontWeight="bold" fill="#dc2626" letterSpacing="2">
                              <textPath href="#topCurve" startOffset="50%" textAnchor="middle">
                                MISSION
                              </textPath>
                            </text>
                            
                            <text fontSize="14" fontWeight="bold" fill="#dc2626" letterSpacing="2">
                              <textPath href="#bottomCurve" startOffset="50%" textAnchor="middle">
                                COMPLETE
                              </textPath>
                            </text>
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Receipt Content */}
                    {!step1Completed ? (
                      <div>
                        {/* Receipt Header */}
                        <div className="text-center mb-6 pb-4 border-b border-gray-400">
                          <p className={`text-xs font-mono tracking-widest ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                            ===== RECEIPT =====
                          </p>
                          <p className={`text-xs mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            {new Date().toLocaleString()}
                          </p>
                        </div>

                        {/* Amount Input */}
                        <div className="mb-6">
                          <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            {language === "ko" ? "출금 금액" : "Withdrawal Amount"}
                          </label>
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="number"
                              value={step1Amount}
                              onChange={(e) => setStep1Amount(e.target.value)}
                              placeholder={language === "ko" ? "예: 100" : "e.g., 100"}
                              className={`flex-1 px-3 py-2 border rounded-none text-sm font-mono ${
                                isDark 
                                  ? "bg-gray-800 border-gray-600 text-white" 
                                  : "bg-white border-gray-300 text-gray-900"
                              }`}
                            />
                            <span className={`text-sm font-semibold ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                              APT
                            </span>
                          </div>
                          
                          {/* Gas Fee */}
                          <div className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                            {language === "ko" ? "가스비" : "Gas Fee"}: 0.001 APT
                          </div>
                        </div>

                        {/* Signature Input */}
                        <div className="mb-6">
                          <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            {language === "ko" ? "서명 (마우스로 그리세요)" : "Signature (Draw with mouse)"}
                          </label>
                          <div className={`border-2 rounded-none overflow-hidden ${isDark ? "border-gray-600" : "border-gray-300"}`}>
                            <canvas
                              ref={canvasRef}
                              onMouseDown={startDrawing}
                              onMouseMove={draw}
                              onMouseUp={stopDrawing}
                              onMouseLeave={stopDrawing}
                              className={`block w-full cursor-crosshair ${isDark ? "bg-gray-900" : "bg-white"}`}
                              style={{ height: "80px", display: "block" }}
                            />
                          </div>
                          {step1Signature && (
                            <button
                              onClick={clearSignature}
                              className={`mt-2 flex items-center gap-1 text-xs font-medium transition-colors ${
                                isDark
                                  ? "text-gray-400 hover:text-gray-200"
                                  : "text-gray-600 hover:text-gray-900"
                              }`}
                            >
                              <RotateCcw className="h-3 w-3" />
                              {language === "ko" ? "지우기" : "Clear"}
                            </button>
                          )}
                        </div>

                        {/* Receipt Footer */}
                        <div className="border-t border-gray-400 pt-4 mb-6 text-xs text-center">
                          <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                            {language === "ko" ? "아래 서명하여 확인하세요" : "Sign below to confirm"}
                          </p>
                        </div>

                        {/* Send Button */}
                        <button
                          onClick={handleStep1Submit}
                          disabled={!step1Amount || !step1Signature}
                          className={`w-full py-2 px-4 font-semibold text-sm rounded-none transition-all ${
                            !step1Amount || !step1Signature
                              ? isDark 
                                ? "bg-gray-700 text-gray-500 cursor-not-allowed" 
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : isDark
                                ? "bg-gray-200 text-gray-900 hover:bg-white"
                                : "bg-gray-900 text-white hover:bg-black"
                          }`}
                        >
                          {language === "ko" ? "보내기" : "Send"}
                        </button>
                      </div>
                    ) : (
                      <div className={`text-center py-12 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          {language === "ko" 
                            ? `${step1Amount} APT 전송이 서명되었습니다` 
                            : `Transfer of ${step1Amount} APT has been signed`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Placeholder for other steps */}
              {step.id !== 1 && (
                <div className={`border rounded-none p-12 text-center ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}>
                  <p className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Interactive Experience - Step {step.id}
                  </p>
                  <p className={`text-xs mt-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    Placeholder for interactive UI component
                  </p>
                </div>
              )}
            </section>
          ))}
        </article>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <p className="text-sm text-gray-500">
              Built by <span className="font-medium text-gray-900"><a href="https://x.com/taeho35858" target="_blank" rel="noopener noreferrer">@Ray</a></span> <span className="text-gray-400">Aptos</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
