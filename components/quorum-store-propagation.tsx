"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface ValidatorNode {
  id: number
  status: "idle" | "pending" | "completed"
  progress: number
}

export default function QuorumStorePropagation({
  onComplete,
  onShowStamp,
  isDark = true,
  language = "ko"
}: {
  onComplete?: () => void
  onShowStamp?: () => void
  isDark?: boolean
  language?: "ko" | "en"
}) {
  const [validators, setValidators] = useState<ValidatorNode[]>([])
  const [poaCount, setPoaCount] = useState(0)
  const [totalValidators] = useState(12)
  const [quorumThreshold] = useState(Math.ceil((12 * 2) / 3)) // 8
  const [draggedFromUser, setDraggedFromUser] = useState(false)
  const [dragOverNodeId, setDragOverNodeId] = useState<number | null>(null)
  const [completedCount, setCompletedCount] = useState(0)

  // 초기화
  useEffect(() => {
    const nodes: ValidatorNode[] = Array.from({ length: totalValidators }).map((_, i) => ({
      id: i,
      status: "idle",
      progress: 0
    }))
    setValidators(nodes)
  }, [totalValidators])

  // 게이지 애니메이션
  useEffect(() => {
    const activeNodes = validators.filter(v => v.status === "pending")
    if (activeNodes.length === 0) return

    const intervals = activeNodes.map(node => {
      return setInterval(() => {
        setValidators(prev =>
          prev.map(v => {
            if (v.id === node.id && v.status === "pending") {
              return { ...v, progress: Math.min(v.progress + 5, 100) }
            }
            return v
          })
        )
      }, 100)
    })

    return () => intervals.forEach(interval => clearInterval(interval))
  }, [validators])

  const handleDragStart = () => {
    setDraggedFromUser(true)
  }

  const handleDragEnd = () => {
    setDraggedFromUser(false)
    setDragOverNodeId(null)
  }

  const handleDragOverNode = (nodeId: number) => {
    if (draggedFromUser) {
      setDragOverNodeId(nodeId)
    }
  }

  const handleDropOnNode = (nodeId: number) => {
    if (draggedFromUser) {
      setValidators(prev =>
        prev.map(v => (v.id === nodeId && v.status === "idle" ? { ...v, status: "pending", progress: 0 } : v))
      )
      setDraggedFromUser(false)
      setDragOverNodeId(null)
    }
  }

  const handleNodeClick = (nodeId: number) => {
    const node = validators.find(v => v.id === nodeId)
    if (node && node.status === "pending" && node.progress === 100) {
      setValidators(prev =>
        prev.map(v => (v.id === nodeId ? { ...v, status: "completed", progress: 0 } : v))
      )
      setPoaCount(prev => prev + 1)
      setCompletedCount(prev => prev + 1)

      // 쿼럼 달성 시 자동으로 다음 단계로
      if (poaCount + 1 >= quorumThreshold) {
        setTimeout(() => {
          onShowStamp?.()
          setTimeout(() => {
            onComplete?.()
          }, 1000)
        }, 500)
      }
    }
  }

  const isQuorumAchieved = poaCount >= quorumThreshold

  return (
    <div className={`w-full rounded-lg border-2 p-6 ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}>
      {/* 제목 */}
      <div className="text-center mb-4">
        <h2 className={`text-lg font-bold mb-1 ${isDark ? "text-teal-400" : "text-teal-600"}`}>
          {language === "ko" ? "쿼럼스토어 - 배치 전파" : "Quorum Store - Batch Propagation"}
        </h2>
        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          {language === "ko"
            ? "배치를 노드에 드래그하여 전파합니다"
            : "Drag batch to nodes to propagate"}
        </p>
      </div>

      {/* 메인 영역 */}
      <div className="relative w-full mb-6">
        {/* 노드들 상단 배치 */}
        <div className="flex justify-between items-end gap-1 mb-4 px-2">
          {validators.map((validator) => (
            <motion.div
              key={`validator-${validator.id}`}
              className="flex flex-col items-center h-20"
              onDragOver={(e) => {
                e.preventDefault()
                handleDragOverNode(validator.id)
              }}
              onDrop={() => handleDropOnNode(validator.id)}
              onDragLeave={() => setDragOverNodeId(null)}
            >
              {/* 노드 */}
              <motion.div
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg cursor-pointer transition-all mb-2 border-2 ${
                  dragOverNodeId === validator.id
                    ? isDark
                      ? "border-teal-400 bg-teal-900/40"
                      : "border-teal-600 bg-teal-100"
                    : validator.status === "idle"
                    ? isDark
                      ? "border-gray-600 bg-gray-700"
                      : "border-gray-300 bg-gray-200"
                    : validator.status === "pending"
                    ? isDark
                      ? "border-orange-500 bg-orange-900/40"
                      : "border-orange-600 bg-orange-100"
                    : isDark
                    ? "border-green-500 bg-green-900/40"
                    : "border-green-600 bg-green-100"
                }`}
                onClick={() => handleNodeClick(validator.id)}
                animate={{
                  scale: dragOverNodeId === validator.id ? 1.1 : 1
                }}
              >
                {validator.status === "completed" ? "✓" : "💻"}
              </motion.div>

              {/* 게이지 */}
              {validator.status === "pending" && (
                <div className="w-8 h-1 bg-gray-600 rounded-full overflow-hidden mb-1">
                  <motion.div
                    className={`h-full ${
                      validator.progress === 100
                        ? "bg-gradient-to-r from-green-400 to-green-600"
                        : "bg-gradient-to-r from-yellow-400 to-yellow-600"
                    }`}
                    animate={{ width: `${validator.progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              )}

              {/* 상태 텍스트 (고정 높이) */}
              <p className={`text-xxs text-center w-8 h-4 flex items-center justify-center ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}>
                {validator.status === "pending" && validator.progress === 100 ? "Click!" : ""}
              </p>
            </motion.div>
          ))}
        </div>

        {/* 사용자 박스 (중앙 하단) */}
        <div className="flex flex-col items-center gap-4">
          <motion.div
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className={`w-16 h-12 rounded-lg flex flex-col items-center justify-center cursor-grab active:cursor-grabbing border-2 transition-all ${
              draggedFromUser
                ? isDark
                  ? "border-teal-400 bg-teal-900/40"
                  : "border-teal-600 bg-teal-100"
                : isDark
                ? "border-teal-500 bg-teal-900/20"
                : "border-teal-500 bg-teal-100"
            }`}
            animate={{
              scale: draggedFromUser ? 0.95 : 1,
              y: draggedFromUser ? -5 : 0
            }}
          >
            <div className="text-sm mb-0.5">📦</div>
            <p className={`text-xxxxs font-semibold ${isDark ? "text-teal-300" : "text-teal-700"}`}>
              Batch
            </p>
          </motion.div>

          {/* PoA 카운터 */}
          <motion.div
            className={`text-center font-semibold ${isDark ? "text-teal-300" : "text-teal-700"} w-40 h-10 flex flex-col items-center justify-center`}
            animate={{ scale: poaCount > 0 ? 1.05 : 1 }}
          >
            <div className="text-2xl h-6 flex items-center justify-center">
              {Array(poaCount).fill(0).map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: i * 0.1 }}
                  className="inline-block"
                  style={{ marginLeft: i === 0 ? 0 : -4 }}
                >
                  🔑
                </motion.span>
              ))}
            </div>
            <div className="text-xs font-bold mb-1">
              {poaCount} / {totalValidators}
            </div>
            <div className="text-xs mt-0 px-2 text-center whitespace-nowrap">
              {language === "ko"
                ? `쿼럼 달성까지 ${Math.max(0, quorumThreshold - poaCount)}개의 PoA(🔑)가 더 필요합니다`
                : `Need ${Math.max(0, quorumThreshold - poaCount)} more PoA(🔑) for quorum`}
            </div>
            {isQuorumAchieved && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className={`mt-1 text-sm font-bold ${isDark ? "text-green-400" : "text-green-600"}`}
              >
                ✓ 쿼럼 달성!
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* 안내 문구 */}
      <div className={`text-center text-xs mt-4 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
        {language === "ko"
          ? "📦 배치를 노드(💻)로 드래그하세요. 게이지가 다 차면 클릭해서 🔑를 받으세요."
          : "Drag 📦 to nodes (💻). When the gauge is full, click to receive 🔑"}
      </div>
    </div>
  )
}
