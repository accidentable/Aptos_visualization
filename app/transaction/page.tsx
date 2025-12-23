"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
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
  const [step1SignatureImage, setStep1SignatureImage] = useState<string | null>(null)
  const [step1Completed, setStep1Completed] = useState(false)
  const [step1ShowStamp, setStep1ShowStamp] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)

  // Step 2 states
  const [step2SelectedNode, setStep2SelectedNode] = useState<number | null>(null)
  const [step2ShowingNodeSelection, setStep2ShowingNodeSelection] = useState(false)
  const [step2ShowingSelectionConfirm, setStep2ShowingSelectionConfirm] = useState(false)
  const [step2IsRolling, setStep2IsRolling] = useState(false)
  const [step2RollingNode, setStep2RollingNode] = useState(1)
  const [step2SignatureChecked, setStep2SignatureChecked] = useState(false)
  const [step2NonceChecked, setStep2NonceChecked] = useState(false)
  const [step2BalanceChecked, setStep2BalanceChecked] = useState(false)
  const [step2Completed, setStep2Completed] = useState(false)
  const [step2ShowStamp, setStep2ShowStamp] = useState(false)

  // Step 3 states
  const [step3Completed, setStep3Completed] = useState(false)
  const [step3Page, setStep3Page] = useState<"pool" | "batch">("pool") // pool: 멤풀 단계, batch: 배치 생성 단계
  const [step3TransactionParticles, setStep3TransactionParticles] = useState<Array<{ id: number; x: number; delay: number }>>([])
  const [step3TransactionsInPool, setStep3TransactionsInPool] = useState<Array<{ id: number; fee: number }>>([])
  const [step3DraggingTx, setStep3DraggingTx] = useState<number | null>(null)
  const [step3HoveringOverPool, setStep3HoveringOverPool] = useState(false)
  const [step3UserTxFee, setStep3UserTxFee] = useState(50)
  const [step3ShowStamp, setStep3ShowStamp] = useState(false)
  const [step3SelectedTxForBatch, setStep3SelectedTxForBatch] = useState<number[]>([])
  const [step3BatchCreating, setStep3BatchCreating] = useState(false)
  const [step3BatchCreated, setStep3BatchCreated] = useState(false)
  const step3PoolRef = useRef<HTMLDivElement>(null)

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
        
        @keyframes tealScanLine {
          0% {
            top: 0;
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
        
        @keyframes slideDownFade {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes transactionFall {
          0% {
            transform: translateY(-50px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(600px);
            opacity: 0;
          }
        }
        
        @keyframes transactionGlow {
          0%, 100% {
            box-shadow: 0 0 10px rgba(20, 184, 166, 0.5);
          }
          50% {
            box-shadow: 0 0 30px rgba(20, 184, 166, 1);
          }
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

  // Step 2: Node selection rolling animation
  useEffect(() => {
    if (step2IsRolling) {
      const interval = setInterval(() => {
        setStep2RollingNode((prev) => (prev % 7) + 1)
      }, 100)
      return () => clearInterval(interval)
    }
  }, [step2IsRolling])

  // Step 3: Initialize transaction particles animation
  useEffect(() => {
    if (currentStep === 3 && !step3Completed) {
      // Create 8-12 transaction particles
      const particleCount = Math.floor(Math.random() * 5) + 8
      const particles = Array.from({ length: particleCount }).map((_, i) => ({
        id: i,
        x: Math.random() * 80 + 10, // 10% ~ 90% of screen width
        delay: Math.random() * 0.5 // 0 ~ 0.5s staggered start
      }))
      setStep3TransactionParticles(particles)

      // Auto-complete Step 3 after all transactions are in pool or 10 seconds
      const timer = setTimeout(() => {
        // Only auto-complete if user has dragged transactions
        if (step3TransactionsInPool.length > 0) {
          setStep3Completed(true)
          setTimeout(() => {
            setCurrentStep(4)
          }, 500)
        }
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [currentStep, step3Completed, step3TransactionsInPool])

  // Auto-scroll to current step
  useEffect(() => {
    const element = document.getElementById(`step-${currentStep}`)
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 100)
    }
  }, [currentStep])

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
          // Save signature as image
          const signatureImage = canvas.toDataURL()
          setStep1SignatureImage(signatureImage)
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
        setStep1SignatureImage(null)
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

  const handleStep2Submit = () => {
    // Step 1: Random node selection after 1 second
    setTimeout(() => {
      const randomNode = Math.floor(Math.random() * 7) + 1
      setStep2SelectedNode(randomNode)
      setStep2ShowingNodeSelection(true)
      
      // Step 2: Show node selection for 2 seconds, then start scanning
      setTimeout(() => {
        setStep2ShowingNodeSelection(false)
        handleReceiptScan()
      }, 2000)
    }, 1000)
  }

  const handleReceiptScan = () => {
    // Sequential validation timing (1s, 2.5s, 4s)
    setTimeout(() => {
      setStep2SignatureChecked(true)
    }, 1000)
    
    setTimeout(() => {
      setStep2NonceChecked(true)
    }, 2500)
    
    setTimeout(() => {
      setStep2BalanceChecked(true)
    }, 4000)
    
    // Show stamp at 5 seconds and auto-advance
    setTimeout(() => {
      setStep2ShowStamp(true)
      setTimeout(() => {
        setStep2ShowStamp(false)
        setStep2Completed(true)
        setTimeout(() => {
          setCurrentStep(3)
        }, 500)
      }, 3000)
    }, 5000)
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
      titleKo: "멤풀 & 배치 생성",
      titleEn: "Mempool & Batch Creation",
      descriptionKo: "유효한 트랜잭션이 멤풀에 임시 저장되고 배치로 묶입니다",
      descriptionEn: "Valid transactions stored in mempool and bundled into batches",
      categoryKo: "데이터 수집",
      categoryEn: "Data Collection",
      detailsKo: "유효성 검사를 통과한 트랜잭션은 노드의 멤풀(Memory Pool)에 임시 저장됩니다. 멤풀은 아직 블록에 포함되지 않은 트랜잭션들을 관리하며, 우선순위(수수료)에 따라 처리됩니다. 그 후 여러 트랜잭션을 배치 단위로 묶어 효율적으로 처리할 수 있도록 준비합니다.",
      detailsEn: "Transactions that pass validation are temporarily stored in the node's mempool (Memory Pool). The mempool manages transactions not yet included in a block and processes them according to priority(fee). Multiple transactions are then bundled into batches for efficient processing."
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
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => router.back()}
              className={`flex items-center gap-2 transition-colors ${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"}`}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back</span>
            </button>
            
            {/* Progress Bar with Step Numbers */}
            <div className="flex-1 ml-10">
              <div className="flex items-center justify-between gap-0">
                {Array.from({ length: 7 }).map((_, index) => {
                  const stepNum = index + 1
                  const isCompleted = stepNum < currentStep
                  const isCurrent = stepNum === currentStep
                  
                  return (
                    <div key={stepNum} className="flex items-center flex-1">
                      {/* Step Number */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${
                        isCurrent
                          ? isDark
                            ? "bg-gray-200 text-gray-900 shadow-lg"
                            : "bg-gray-900 text-white shadow-lg"
                          : isCompleted
                            ? isDark
                              ? "bg-gray-600 text-white"
                              : "bg-gray-400 text-white"
                            : isDark
                              ? "bg-gray-700 text-gray-400"
                              : "bg-gray-200 text-gray-600"
                      }`}>
                        {isCompleted ? <Check className="h-3 w-3" /> : stepNum === 7 ? "🎉" : stepNum}
                      </div>
                      
                      {/* Progress Line */}
                      {stepNum < 7 && (
                        <div className={`flex-1 h-1 mx-1 transition-all ${
                          stepNum < currentStep
                            ? isDark
                              ? "bg-gray-600"
                              : "bg-gray-400"
                            : isDark
                              ? "bg-gray-700"
                              : "bg-gray-300"
                        }`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCurrentStep(1)
                  setStep1Completed(false)
                  setStep1ShowStamp(false)
                  setStep1Amount("")
                  setStep1Signature(false)
                  setStep1SignatureImage(null)
                  clearSignature()
                  // Reset Step 2
                  setStep2SelectedNode(null)
                  setStep2ShowingNodeSelection(false)
                  setStep2ShowingSelectionConfirm(false)
                  setStep2IsRolling(false)
                  setStep2RollingNode(1)
                  setStep2SignatureChecked(false)
                  setStep2NonceChecked(false)
                  setStep2BalanceChecked(false)
                  setStep2Completed(false)
                  setStep2ShowStamp(false)
                  // Reset Step 3
                  setStep3Completed(false)
                  setStep3TransactionParticles([])
                  setStep3TransactionsInPool([])
                  setStep3DraggingTx(null)
                  setStep3HoveringOverPool(false)
                  setStep3UserTxFee(50)
                  setStep3ShowStamp(false)
                  setStep3Page("pool")
                  setStep3BatchCreating(false)
                  setStep3BatchCreated(false)
                  setStep3SelectedTxForBatch([])
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

      {/* Hero Section */}

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
            <section 
              key={step.id} 
              id={`step-${step.id}`}
              className={`mb-16 pb-16 ${index !== transactionSteps.length - 1 ? `border-b ${isDark ? "border-gray-700" : "border-gray-200"}` : ""}`}
            >
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
                          
                          {/* Gas Fee - Auto calculated as 0.01% */}
                          <div className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                            {language === "ko" ? "가스비" : "Gas Fee"}: {step1Amount ? (parseFloat(step1Amount) * 0.0001).toFixed(2) : "0.00"} APT
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

              {/* Interactive UI for Step 2 - Admission Control */}
              {step.id === 2 && (
                <div className={`border rounded-none p-8 ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}>
                  <div className={`relative max-w-2xl mx-auto p-6 rounded-none border-2 ${isDark ? "border-gray-600 bg-gray-900" : "border-gray-300 bg-white"}`}>
                    {!step2Completed ? (
                      <>
                        {/* Screen 1: Node Selection */}
                        {!step2SelectedNode && (
                          <div>
                            <div className="flex items-end justify-center gap-3 mb-8">
                              {Array.from({ length: 7 }).map((_, index) => {
                                const nodeNum = index + 1
                                const isHighlighted = step2IsRolling && step2RollingNode === nodeNum
                                
                                return (
                                  <motion.div 
                                    key={index} 
                                    className="flex flex-col items-center cursor-pointer"
                                    onClick={() => {
                                      if (!step2IsRolling && step1Completed) {
                                        setStep2IsRolling(true)
                                        // Rolling animation for 2 seconds
                                        setTimeout(() => {
                                          setStep2IsRolling(false)
                                          setStep2SelectedNode(nodeNum)
                                          setStep2ShowingSelectionConfirm(true)
                                          // Show confirmation for 4-5 seconds
                                          setTimeout(() => {
                                            setStep2ShowingSelectionConfirm(false)
                                            handleReceiptScan()
                                          }, 3500)
                                        }, 2000)
                                      }
                                    }}
                                    whileHover={!step2IsRolling && step1Completed ? { scale: 1.1 } : {}}
                                  >
                                    <motion.div 
                                      className={`text-3xl mb-2 transition-all ${
                                        isHighlighted 
                                          ? "drop-shadow-lg" 
                                          : ""
                                      }`}
                                      animate={isHighlighted ? {
                                        scale: [1, 1.2, 1],
                                        filter: ["drop-shadow(0 0 0px rgba(34, 211, 238, 0))", "drop-shadow(0 0 15px rgba(34, 211, 238, 1))", "drop-shadow(0 0 0px rgba(34, 211, 238, 0))"]
                                      } : {}}
                                      transition={{ duration: 0.1 }}
                                    >
                                      💻
                                    </motion.div>
                                    <p className={`text-xs font-mono transition-all ${
                                      isHighlighted
                                        ? isDark 
                                          ? "text-teal-400 font-bold" 
                                          : "text-teal-600 font-bold"
                                        : isDark ? "text-gray-400" : "text-gray-600"
                                    }`}>
                                      Node {nodeNum}
                                    </p>
                                  </motion.div>
                                )
                              })}
                            </div>
                            <button
                              onClick={() => {
                                if (!step2IsRolling && step1Completed) {
                                  setStep2IsRolling(true)
                                  // Rolling animation for 2 seconds, then select random node
                                  setTimeout(() => {
                                    setStep2IsRolling(false)
                                    const randomNode = Math.floor(Math.random() * 7) + 1
                                    setStep2SelectedNode(randomNode)
                                    setStep2ShowingSelectionConfirm(true)
                                    // Show confirmation for 4-5 seconds
                                    setTimeout(() => {
                                      setStep2ShowingSelectionConfirm(false)
                                      handleReceiptScan()
                                    }, 4500)
                                  }, 2000)
                                }
                              }}
                              disabled={!step1Completed || step2IsRolling}
                              className={`w-full py-3 px-4 font-semibold text-sm rounded-none transition-all ${
                                !step1Completed || step2IsRolling
                                  ? isDark
                                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                  : isDark
                                    ? "bg-gray-200 text-gray-900 hover:bg-white"
                                    : "bg-gray-900 text-white hover:bg-black"
                              }`}
                            >
                              {step2IsRolling 
                                ? (language === "ko" ? "선택 중..." : "Selecting...") 
                                : (language === "ko" ? "노드에 트랜잭션을 보내보세요" : "Send Transaction to Node")}
                            </button>
                          </div>
                        )}

                        {/* Screen 1.5: Selected Node Display */}
                        {step2SelectedNode && step2ShowingNodeSelection && (
                          <div className="min-h-96 flex flex-col items-center justify-center text-center">
                            <p className={`text-sm font-semibold mb-8 ${isDark ? "text-teal-400" : "text-teal-600"}`}>
                              {language === "ko" ? "선택된 노드" : "Selected Node"}
                            </p>
                            <div className="text-6xl mb-8">💻</div>
                            <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                              Node #{step2SelectedNode}
                            </p>
                            <p className={`text-sm mt-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                              {language === "ko" ? "트랜잭션 검증 중..." : "Validating transaction..."}
                            </p>
                          </div>
                        )}

                        {/* Screen 1.6: Selection Confirmation */}
                        {step2SelectedNode && step2ShowingSelectionConfirm && (
                          <div className="min-h-96 flex flex-col items-center justify-center text-center">
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
                            >
                              <div className="text-6xl mb-6">💻</div>
                              <p className={`text-3xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                                Node #{step2SelectedNode}
                              </p>
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className={`text-xl font-semibold ${isDark ? "text-teal-400" : "text-teal-600"}`}
                              >
                                {language === "ko" ? "노드가 선택되었습니다!" : "Node Selected!"}
                              </motion.p>
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 20 }}
                                className={`mt-6 text-4xl ${isDark ? "text-teal-400" : "text-teal-600"}`}
                              >
                                ✓
                              </motion.div>
                            </motion.div>
                          </div>
                        )}

                        {/* Screen 2: Receipt Scanning */}
                        {step2SelectedNode && !step2ShowingNodeSelection && !step2ShowingSelectionConfirm && !step2Completed && (
                          <div className="relative min-h-96 flex flex-col items-center justify-center">
                            {/* Blockchain Background */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                              <svg className="w-full h-full">
                                {Array.from({ length: 10 }).map((_, i) => (
                                  <circle
                                    key={i}
                                    cx={`${Math.random() * 100}%`}
                                    cy={`${Math.random() * 100}%`}
                                    r="2"
                                    fill={isDark ? "#22d3ee" : "#06b6d4"}
                                  />
                                ))}
                              </svg>
                            </div>

                            <div className="relative z-10 w-full text-center">
                              <p className={`text-sm font-semibold mb-8 ${isDark ? "text-teal-400" : "text-teal-600"}`}>
                                {language === "ko"
                                  ? `Node #${step2SelectedNode}에서 검증 중...`
                                  : `Validating on Node #${step2SelectedNode}...`}
                              </p>

                              {/* Receipt Card with Stamp Overlay */}
                              <div
                                className={`relative border-2 rounded-lg p-6 overflow-hidden max-w-md mx-auto ${
                                  isDark
                                    ? "border-teal-500/40 bg-gray-900/80"
                                    : "border-teal-400/40 bg-white/80"
                                }`}
                                style={{
                                  backdropFilter: "blur(10px)",
                                  boxShadow: isDark
                                    ? "0 20px 50px rgba(34, 211, 238, 0.3), inset 0 1px 0 rgba(34, 211, 238, 0.1)"
                                    : "0 20px 50px rgba(6, 182, 212, 0.2), inset 0 1px 0 rgba(6, 182, 212, 0.1)"
                                }}
                              >
                                {/* Stamp Overlay on Receipt */}
                                {step2ShowStamp && (
                                  <div className="stamp-animation absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                                    <svg width="140" height="140" viewBox="0 0 180 180">
                                      <defs>
                                        <filter id="dropShadow3">
                                          <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3" />
                                        </filter>
                                        <path id="topCurve3" d="M 30 90 A 60 60 0 0 1 150 90" fill="none" />
                                        <path id="bottomCurve3" d="M 150 90 A 60 60 0 0 1 30 90" fill="none" />
                                      </defs>
                                      <circle cx="90" cy="90" r="85" fill="none" stroke="#dc2626" strokeWidth="3" filter="url(#dropShadow3)" opacity="0.9" />
                                      <circle cx="90" cy="90" r="75" fill="none" stroke="#dc2626" strokeWidth="2" opacity="0.7" />
                                      <text x="40" y="35" fontSize="20" fill="#dc2626">★</text>
                                      <text x="140" y="35" fontSize="20" fill="#dc2626">★</text>
                                      <text x="40" y="145" fontSize="20" fill="#dc2626">★</text>
                                      <text x="140" y="145" fontSize="20" fill="#dc2626">★</text>
                                      <path
                                        d="M 70 95 L 85 110 L 115 75"
                                        stroke="#dc2626"
                                        strokeWidth="6"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                      <text fontSize="14" fontWeight="bold" fill="#dc2626" letterSpacing="2">
                                        <textPath href="#topCurve3" startOffset="50%" textAnchor="middle">
                                          MISSION
                                        </textPath>
                                      </text>
                                      <text fontSize="14" fontWeight="bold" fill="#dc2626" letterSpacing="2">
                                        <textPath href="#bottomCurve3" startOffset="50%" textAnchor="middle">
                                          COMPLETE
                                        </textPath>
                                      </text>
                                    </svg>
                                  </div>
                                )}
                                {/* Teal Scan Line */}
                                <div
                                  className="h-1 z-20"
                                  style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    background: "linear-gradient(90deg, transparent, rgba(34, 211, 238, 1), transparent)",
                                    animation: "tealScanLine 5s ease-in-out",
                                    boxShadow: "0 0 20px rgba(34, 211, 238, 0.8)"
                                  }}
                                ></div>

                                {/* Receipt Header */}
                                <p className={`text-xs font-mono tracking-widest text-center mb-6 ${
                                  isDark ? "text-gray-400" : "text-gray-500"
                                }`}>
                                  ◆ DIGITAL RECEIPT ◆
                                </p>

                                {/* Signature Image from Step 1 */}
                                {step1SignatureImage && (
                                  <div className="mb-4 border-b pb-4">
                                    <p className={`text-xs font-mono text-center mb-2 ${
                                      isDark ? "text-gray-500" : "text-gray-400"
                                    }`}>
                                      {language === "ko" ? "서명" : "Signature"}
                                    </p>
                                    <img
                                      src={step1SignatureImage}
                                      alt="signature"
                                      className={`w-full h-12 rounded ${isDark ? "bg-gray-900" : "bg-white"}`}
                                      style={{ objectFit: "contain" }}
                                    />
                                  </div>
                                )}

                                {/* Receipt Items */}
                                <div className="space-y-4 text-sm">
                                  {/* Item 1: Amount */}
                                  <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{
                                      opacity: 1,
                                      x: 0,
                                      backgroundColor: step2SignatureChecked 
                                        ? isDark ? "rgb(34, 71, 91)" : "rgb(207, 250, 254)" 
                                        : isDark ? "rgb(31, 41, 55, 0.3)" : "rgb(255, 255, 255, 0.3)"
                                    }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className={`flex justify-between items-center px-4 py-3 rounded transition-all ${
                                      step2SignatureChecked
                                        ? isDark
                                          ? "border border-teal-500/50"
                                          : "border border-teal-400/50"
                                        : ""
                                    }`}
                                  >
                                    <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                                      {language === "ko" ? "출금 금액" : "Amount"}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className={`font-mono font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                        {step1Amount} APT
                                      </span>
                                      {step2SignatureChecked && (
                                        <motion.span
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                          className={isDark ? "text-teal-400" : "text-teal-600"}
                                        >
                                          ✓
                                        </motion.span>
                                      )}
                                    </div>
                                  </motion.div>

                                  {/* Item 2: Gas Fee */}
                                  <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{
                                      opacity: 1,
                                      x: 0,
                                      backgroundColor: step2NonceChecked 
                                        ? isDark ? "rgb(34, 71, 91)" : "rgb(207, 250, 254)" 
                                        : isDark ? "rgb(31, 41, 55, 0.3)" : "rgb(255, 255, 255, 0.3)"
                                    }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                    className={`flex justify-between items-center px-4 py-3 rounded transition-all ${
                                      step2NonceChecked
                                        ? isDark
                                          ? "border border-teal-500/50"
                                          : "border border-teal-400/50"
                                        : ""
                                    }`}
                                  >
                                    <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                                      {language === "ko" ? "가스비" : "Gas Fee"}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className={`font-mono font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                        {step1Amount ? (parseFloat(step1Amount) * 0.0001).toFixed(2) : "0.00"} APT
                                      </span>
                                      {step2NonceChecked && (
                                        <motion.span
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                          className={isDark ? "text-teal-400" : "text-teal-600"}
                                        >
                                          ✓
                                        </motion.span>
                                      )}
                                    </div>
                                  </motion.div>

                                  {/* Item 3: Signature */}
                                  <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{
                                      opacity: 1,
                                      x: 0,
                                      backgroundColor: step2BalanceChecked 
                                        ? isDark ? "rgb(34, 71, 91)" : "rgb(207, 250, 254)" 
                                        : isDark ? "rgb(31, 41, 55, 0.3)" : "rgb(255, 255, 255, 0.3)"
                                    }}
                                    transition={{ duration: 0.5, delay: 0.6 }}
                                    className={`flex justify-between items-center px-4 py-3 rounded transition-all ${
                                      step2BalanceChecked
                                        ? isDark
                                          ? "border border-teal-500/50"
                                          : "border border-teal-400/50"
                                        : ""
                                    }`}
                                  >
                                    <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                                      {language === "ko" ? "서명 상태" : "Signature"}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className={isDark ? "text-teal-400" : "text-teal-600"}>
                                        {language === "ko" ? "유효" : "Valid"}
                                      </span>
                                      {step2BalanceChecked && (
                                        <motion.span
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                          className={isDark ? "text-teal-400" : "text-teal-600"}
                                        >
                                          ✓
                                        </motion.span>
                                      )}
                                    </div>
                                  </motion.div>
                                </div>
                              </div>

                              {/* Scanning Indicator */}
                              <div className="mt-8">
                                <div
                                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md ${
                                    isDark
                                      ? "bg-teal-900/30 border border-teal-500/40"
                                      : "bg-teal-100/30 border border-teal-400/40"
                                  }`}
                                >
                                  <div
                                    className={`w-2 h-2 rounded-full animate-pulse ${
                                      isDark ? "bg-teal-400" : "bg-teal-600"
                                    }`}
                                  ></div>
                                  <span
                                    className={`text-xs font-semibold ${
                                      isDark ? "text-teal-400" : "text-teal-600"
                                    }`}
                                  >
                                    {language === "ko" ? "스캔 진행 중..." : "Scanning..."}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className={`text-center py-12 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          {language === "ko"
                            ? "트랜잭션이 승인제어를 통과했습니다"
                            : "Transaction passed admission control"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Interactive UI for Step 3 - Drag & Drop Transaction Collection */}
              {step.id === 3 && step3Page === "pool" && (
                <div className={`border rounded-none p-8 ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}>
                  <div className={`relative max-w-4xl mx-auto rounded-none p-8 flex gap-8 ${isDark ? "bg-gray-900" : "bg-white border border-gray-200"}`}>
                    {/* Left side: User TX (Draggable) */}
                    <div className="flex-1 flex flex-col items-center justify-start gap-4">
                      <div className="text-center mb-2">
                        <p className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                          {language === "ko" ? "사용자 TX" : "User TX"}
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          {language === "ko" ? "드래그 가능" : "Draggable"}
                        </p>
                      </div>

                      {/* Fee Slider */}
                      <div className="w-full px-4">
                        <div className="mb-2">
                          <label className={`text-xs font-medium block mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            {language === "ko" ? "Gas/Fee 조절" : "Gas/Fee"}
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="100"
                            value={step3UserTxFee}
                            onChange={(e) => setStep3UserTxFee(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-teal-500"
                          />
                          <div className="flex justify-between items-center mt-1">
                            <span className={`text-xs font-bold ${isDark ? "text-teal-400" : "text-teal-600"}`}>
                              {step3UserTxFee}
                            </span>
                            <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                              / 100
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Draggable TX Card - Size based on fee */}
                      <motion.div
                        draggable
                        onDragStart={() => {
                          setStep3DraggingTx(1)
                        }}
                        onDragEnd={() => {
                          setStep3DraggingTx(null)
                          setStep3HoveringOverPool(false)
                        }}
                        animate={{
                          scale: step3DraggingTx === 1 ? 1.1 : 1,
                          y: step3TransactionsInPool.length > 0 ? -10 : 0
                        }}
                        className={`rounded-none flex flex-col items-center justify-center font-bold text-sm cursor-grab active:cursor-grabbing transition-all ${
                          step3TransactionsInPool.length === 0
                            ? isDark
                              ? "bg-teal-500 text-white shadow-lg shadow-teal-500/50"
                              : "bg-teal-500 text-white shadow-lg shadow-teal-400/50"
                            : isDark
                              ? "bg-gray-600 text-gray-300 shadow-none"
                              : "bg-gray-400 text-gray-600 shadow-none"
                        }`}
                        style={{
                          width: `${40 + (step3UserTxFee / 100) * 80}px`,
                          height: `${40 + (step3UserTxFee / 100) * 80}px`
                        }}
                      >
                        {step3TransactionsInPool.length === 0 ? "TX" : "✓"}
                      </motion.div>

                      {/* TX Status */}
                      {step3TransactionsInPool.length === 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center"
                        >
                          <p className={`text-xs ${isDark ? "text-teal-400" : "text-teal-600"}`}>
                            {language === "ko" ? "검증 대기중..." : "Waiting..."}
                          </p>
                        </motion.div>
                      )}
                      {step3TransactionsInPool.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-center"
                        >
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${isDark ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-700"}`}>
                            <Check size={12} />
                            {language === "ko" ? "검증됨" : "Validated"}
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Center: Arrow or divider */}
                    <div className="flex items-center justify-center">
                      <div className={`w-8 h-0.5 ${isDark ? "bg-gradient-to-r from-gray-700 to-transparent" : "bg-gradient-to-r from-gray-300 to-transparent"}`}></div>
                    </div>

                    {/* Right side: MEMPOOL (Drop zone) */}
                    <div className="flex-1 flex flex-col items-center justify-start gap-4">
                      <div className="text-center mb-4">
                        <p className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                          MEMPOOL
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          {language === "ko" ? "대기 중 (우선순위 정렬 중)" : "Pending (Sorted by Fee)"}
                        </p>
                      </div>

                      {/* MEMPOOL Grid - Drop Zone */}
                      <motion.div
                        ref={step3PoolRef}
                        onDragOver={(e) => {
                          e.preventDefault()
                          setStep3HoveringOverPool(true)
                        }}
                        onDragLeave={() => {
                          setStep3HoveringOverPool(false)
                        }}
                        onDrop={() => {
                          if (step3DraggingTx === 1 && step3TransactionsInPool.length === 0) {
                            // Create 9 other transactions with random fees
                            const otherTxs = Array.from({ length: 9 }).map((_, i) => ({
                              id: i + 2,
                              fee: Math.floor(Math.random() * 80) + 10 // 10-90 범위의 랜덤 수수료
                            }))
                            // Add user's TX and shuffle randomly
                            const allTxs = [...otherTxs, { id: 1, fee: step3UserTxFee }]
                            // Fisher-Yates shuffle
                            for (let i = allTxs.length - 1; i > 0; i--) {
                              const j = Math.floor(Math.random() * (i + 1));
                              [allTxs[i], allTxs[j]] = [allTxs[j], allTxs[i]];
                            }
                            setStep3TransactionsInPool(allTxs)
                          }
                          setStep3HoveringOverPool(false)
                        }}
                        animate={{
                          backgroundColor: step3HoveringOverPool
                            ? isDark
                              ? "rgba(20, 184, 166, 0.1)"
                              : "rgba(20, 184, 166, 0.05)"
                            : "transparent",
                          boxShadow: step3HoveringOverPool
                            ? isDark
                              ? "0 0 20px rgba(20, 184, 166, 0.3), inset 0 0 20px rgba(20, 184, 166, 0.1)"
                              : "0 0 15px rgba(20, 184, 166, 0.2), inset 0 0 15px rgba(20, 184, 166, 0.05)"
                            : "none"
                        }}
                        className={`w-full p-4 rounded-lg border-2 border-dashed flex items-center justify-center min-h-32 transition-all ${
                          step3HoveringOverPool
                            ? isDark
                              ? "border-teal-400 bg-teal-500/10"
                              : "border-teal-500 bg-teal-50"
                            : isDark
                              ? "border-gray-700 bg-gray-800/50"
                              : "border-gray-300 bg-gray-50"
                        }`}
                      >
                        {step3TransactionsInPool.length === 0 ? (
                          <div className="text-center">
                            <p className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                              {language === "ko" ? "TX를 여기로 드래그하세요" : "Drag TX here"}
                            </p>
                          </div>
                        ) : (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-wrap gap-4 w-full justify-center items-end"
                          >
                            {/* Sorted transactions in pool by fee (highest first) */}
                            {step3TransactionsInPool.map((tx, index) => {
                              const isUserTx = tx.id === 1
                              // 박스 크기: 최소 12px + 수수료에 따른 추가 크기 (최대 62px)
                              const boxSize = 12 + (tx.fee / 100) * 50

                              return (
                                <motion.div
                                  key={`pool-tx-${tx.id}`}
                                  initial={{ scale: 0, opacity: 0, y: 20 }}
                                  animate={{ 
                                    scale: 1, 
                                    opacity: 1, 
                                    y: 0
                                  }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex flex-col items-center gap-2 group"
                                >
                                  <motion.div
                                    animate={{
                                      y: [0, -3, 2, -2, 0],
                                      x: [-1, 1, -1, 1, 0],
                                      rotate: [-1, 1, -0.5, 0.5, 0]
                                    }}
                                    transition={{
                                      duration: 4,
                                      repeat: Infinity,
                                      repeatType: "loop",
                                      ease: "easeInOut",
                                      delay: index * 0.2
                                    }}
                                    className={`rounded-none flex items-center justify-center font-bold cursor-default transition-all relative ${
                                      isUserTx
                                        ? isDark
                                          ? "bg-teal-500 text-white shadow-lg shadow-teal-500/50"
                                          : "bg-teal-500 text-white shadow-lg shadow-teal-400/50"
                                        : isDark
                                          ? "bg-gray-500 text-white shadow-lg"
                                          : "bg-gray-500 text-white shadow-lg"
                                    }`}
                                    style={{
                                      width: `${boxSize}px`,
                                      height: `${boxSize}px`,
                                      fontSize: `${Math.max(8, boxSize * 0.3)}px`
                                    }}
                                  >
                                    TX
                                    
                                    {/* Tooltip - Fee Info */}
                                    <div className={`absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
                                      isDark ? "bg-gray-800 text-teal-300" : "bg-gray-700 text-teal-200"
                                    }`}>
                                      Fee: {tx.fee}
                                    </div>
                                  </motion.div>
                                </motion.div>
                              )
                            })}
                          </motion.div>
                        )}
                      </motion.div>

                      {/* Pool Status */}
                      {step3TransactionsInPool.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center"
                        >
                          <motion.div
                            animate={{
                              y: [0, -2, 0]
                            }}
                            transition={{
                              repeat: Infinity,
                              duration: 1.5
                            }}
                            className={`text-xs font-medium ${isDark ? "text-teal-400" : "text-teal-600"}`}
                          >
                            ● {language === "ko" ? "풀 형성 완료" : "Pool Ready"}
                          </motion.div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Auto-advance button when transaction is in pool */}
                  {step3TransactionsInPool.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-center mt-6"
                    >
                      <button
                        onClick={() => {
                          setStep3Page("batch")
                        }}
                        className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${
                          isDark
                            ? "bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white shadow-lg shadow-teal-500/30"
                            : "bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white shadow-lg shadow-teal-400/30"
                        }`}
                      >
                        {language === "ko" ? "배치 생성" : "Create Batch"}
                      </button>
                    </motion.div>
                  )}

                  {/* Step 3 Completion Stamp */}
                  {step3ShowStamp && (
                    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none rounded-none border-2 ${isDark ? "border-gray-600 bg-gray-900/80" : "border-gray-300 bg-white/80"}`}>
                      <div className="stamp-animation text-6xl opacity-80">✓</div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3 - Batch Creation Page */}
              {step.id === 3 && step3Page === "batch" && (
                <div className={`border rounded-none p-4 ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}>
                  <div className={`relative max-w-3xl mx-auto rounded-none p-4 ${isDark ? "bg-gray-900" : "bg-white border border-gray-200"}`}>
                    {/* Batch Creation Title */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center mb-4"
                    >
                      <p className={`text-lg font-bold ${isDark ? "text-teal-400" : "text-teal-600"}`}>
                        {language === "ko" ? "배치(Batch) 생성" : "Creating Batch"}
                      </p>
                      <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {language === "ko" ? "TX를 선택하여 배치로 박싱하세요" : "Select TXs and create a batch"}
                      </p>
                    </motion.div>

                    {/* Pool Display with Selection */}
                    <div className={`relative w-full rounded-lg border-2 border-dashed p-4 mb-6 ${
                      isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-300 bg-gray-50"
                    }`}>
                      <div className={`text-xs font-medium text-center mb-3 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {language === "ko" ? "멤풀에서 선택하기" : "Select from Pool"}
                      </div>

                      {/* Selectable TXs in Pool */}
                      <div className="flex flex-wrap gap-2 justify-center">
                        {step3TransactionsInPool.map((tx) => {
                          const isSelected = step3SelectedTxForBatch.includes(tx.id)
                          const boxSize = 12 + (tx.fee / 100) * 50

                          return (
                            <motion.div
                              key={`select-tx-${tx.id}`}
                              whileHover={{ scale: 1.05 }}
                              onClick={() => {
                                if (isSelected) {
                                  setStep3SelectedTxForBatch(step3SelectedTxForBatch.filter(id => id !== tx.id))
                                } else if (step3SelectedTxForBatch.length < 3) {
                                  setStep3SelectedTxForBatch([...step3SelectedTxForBatch, tx.id])
                                }
                              }}
                              className="cursor-pointer flex flex-col items-center gap-1"
                            >
                              <motion.div
                                animate={{
                                  y: [0, -3, 2, -2, 0],
                                  x: [-1, 1, -1, 1, 0],
                                  rotate: [-1, 1, -0.5, 0.5, 0]
                                }}
                                transition={{
                                  duration: 4,
                                  repeat: Infinity,
                                  repeatType: "loop",
                                  ease: "easeInOut",
                                  delay: Math.random() * 0.5
                                }}
                                className={`rounded-none flex items-center justify-center font-bold cursor-pointer transition-all ${
                                  isSelected
                                    ? isDark
                                      ? "bg-teal-400 text-gray-900 shadow-lg shadow-teal-400/80"
                                      : "bg-teal-400 text-white shadow-lg shadow-teal-400/80"
                                    : isDark
                                      ? "bg-gray-500 text-white shadow-lg"
                                      : "bg-gray-500 text-white shadow-lg"
                                }`}
                                style={{
                                  width: `${boxSize}px`,
                                  height: `${boxSize}px`,
                                  fontSize: `${Math.max(8, boxSize * 0.3)}px`
                                }}
                              >
                                TX
                              </motion.div>

                              {/* Fee Display */}
                              <p className={`text-xs font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                {tx.fee}APT
                              </p>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Selection Info and Limit */}
                    <div className="text-center mb-4">
                      <p className={`text-xs font-medium mb-1 ${isDark ? "text-teal-400" : "text-teal-600"}`}>
                        {language === "ko" ? `선택됨: ${step3SelectedTxForBatch.length}개 / 최대 3개` : `Selected: ${step3SelectedTxForBatch.length} / Max 3`}
                      </p>
                      {step3SelectedTxForBatch.length > 0 && (
                        <p className={`text-xs font-bold mb-1 ${isDark ? "text-green-400" : "text-green-600"}`}>
                          {language === "ko" ? "총 수수료: " : "Total Fee: "}
                          {step3TransactionsInPool
                            .filter(tx => step3SelectedTxForBatch.includes(tx.id))
                            .reduce((sum, tx) => sum + tx.fee, 0)}
                          APT
                        </p>
                      )}
                      <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {language === "ko" ? "(최대 3개의 TX만 배치로 선택할 수 있습니다)" : "(You can select up to 3 TXs for batch)"}      
                      </p>
                    </div>

                    {/* Create Batch Button */}
                    {!step3BatchCreating && !step3BatchCreated && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center gap-3"
                      >
                        <button
                          onClick={() => setStep3Page("pool")}
                          className={`px-4 py-1 rounded-lg font-medium text-xs transition-all ${
                            isDark
                              ? "border border-gray-600 text-gray-300 hover:border-gray-400 hover:text-gray-100"
                              : "border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900"
                          }`}
                        >
                          {language === "ko" ? "뒤로" : "Back"}
                        </button>
                        <button
                          onClick={() => {
                            setStep3BatchCreating(true)
                            setTimeout(() => {
                              setStep3BatchCreating(false)
                              setStep3BatchCreated(true)
                            }, 2000)
                          }}
                          disabled={step3SelectedTxForBatch.length === 0}
                          className={`px-4 py-1 rounded-lg font-medium text-xs transition-all ${
                            step3SelectedTxForBatch.length === 0
                              ? isDark
                                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : isDark
                                ? "bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white shadow-lg shadow-teal-500/30"
                                : "bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white shadow-lg shadow-teal-400/30"
                          }`}
                        >
                          {language === "ko" ? "배치 생성" : "Create Batch"}
                        </button>
                      </motion.div>
                    )}

                    {/* Batch Creation Progress */}
                    {step3BatchCreating && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-4"
                      >
                        <div className={`relative w-24 h-24 rounded-lg border-2 flex items-center justify-center ${
                          isDark ? "border-teal-500 bg-teal-500/10" : "border-teal-500 bg-teal-50"
                        }`}>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className={`text-2xl font-bold ${isDark ? "text-teal-400" : "text-teal-600"}`}
                          >
                            ⚙️
                          </motion.div>
                        </div>
                        <motion.div
                          animate={{ y: [0, -3, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className={`text-sm font-medium ${isDark ? "text-teal-400" : "text-teal-600"}`}
                        >
                          ● {language === "ko" ? "배치 생성 중" : "Creating Batch..."}
                        </motion.div>
                      </motion.div>
                    )}

                    {/* Batch Created Status */}
                    {step3BatchCreated && !step3ShowStamp && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                          className={`inline-block p-2 rounded-lg mb-2 ${
                            isDark ? "bg-green-900/30" : "bg-green-100"
                          }`}
                        >
                          <p className={`text-sm font-bold ${isDark ? "text-green-400" : "text-green-600"}`}>
                            {language === "ko" ? "배치 생성 완료!" : "Batch Created!"}
                          </p>
                        </motion.div>
                        <p className={`text-xs mb-3 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          {language === "ko" ? `${step3SelectedTxForBatch.length}개의 TX가 배치로 생성되었습니다` : `${step3SelectedTxForBatch.length} TXs packed into batch`}
                        </p>
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="flex justify-center"
                        >
                          <button
                            onClick={() => {
                              setStep3ShowStamp(true)
                              setTimeout(() => {
                                setStep3Completed(true)
                                setTimeout(() => {
                                  setCurrentStep(4)
                                }, 500)
                              }, 1500)
                            }}
                            className={`px-4 py-1 rounded-lg font-medium text-xs transition-all ${
                              isDark
                                ? "bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white shadow-lg shadow-teal-500/30"
                                : "bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white shadow-lg shadow-teal-400/30"
                            }`}
                          >
                            {language === "ko" ? "다음 단계로" : "Next Step"}
                          </button>
                        </motion.div>
                      </motion.div>
                    )}

                    {/* Batch Completion Stamp */}
                    {step3ShowStamp && (
                      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none rounded-lg border-2 ${isDark ? "border-gray-600 bg-gray-900/80" : "border-gray-300 bg-white/80"}`}>
                        <div className="stamp-animation">
                          <svg width="140" height="140" viewBox="0 0 180 180">
                            <defs>
                              <filter id="dropShadow4">
                                <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3" />
                              </filter>
                              <path id="topCurve4" d="M 30 90 A 60 60 0 0 1 150 90" fill="none" />
                              <path id="bottomCurve4" d="M 150 90 A 60 60 0 0 1 30 90" fill="none" />
                            </defs>
                            <circle cx="90" cy="90" r="85" fill="none" stroke="#dc2626" strokeWidth="3" filter="url(#dropShadow4)" opacity="0.9" />
                            <circle cx="90" cy="90" r="75" fill="none" stroke="#dc2626" strokeWidth="2" opacity="0.7" />
                            <text x="40" y="35" fontSize="20" fill="#dc2626">★</text>
                            <text x="140" y="35" fontSize="20" fill="#dc2626">★</text>
                            <text x="40" y="145" fontSize="20" fill="#dc2626">★</text>
                            <text x="140" y="145" fontSize="20" fill="#dc2626">★</text>
                            <path
                              d="M 70 95 L 85 110 L 115 75"
                              stroke="#dc2626"
                              strokeWidth="6"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <text fontSize="14" fontWeight="bold" fill="#dc2626" letterSpacing="2">
                              <textPath href="#topCurve4" startOffset="50%" textAnchor="middle">
                                MISSION
                              </textPath>
                            </text>
                            <text fontSize="14" fontWeight="bold" fill="#dc2626" letterSpacing="2">
                              <textPath href="#bottomCurve4" startOffset="50%" textAnchor="middle">
                                COMPLETE
                              </textPath>
                            </text>
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Placeholder for other steps */}
              {step.id !== 1 && step.id !== 2 && step.id !== 3 && (
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
