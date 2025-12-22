"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Sun, Moon } from "lucide-react"

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
                <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                  {language === "ko" ? step.titleKo : step.titleEn}
                </h2>
                <p className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  {language === "ko" ? step.categoryKo : step.categoryEn}
                </p>
              </div>
              
              <p className={`text-lg leading-relaxed mb-6 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                {language === "ko" ? step.detailsKo : step.detailsEn}
              </p>

              {/* Placeholder for Interactive UI */}
              <div className={`border rounded-none p-12 text-center ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}>
                <p className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Interactive Experience - Step {step.id}
                </p>
                <p className={`text-xs mt-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  Placeholder for interactive UI component
                </p>
              </div>
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
