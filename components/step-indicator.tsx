"use client"

import { motion } from "framer-motion"

export interface StepIndicatorProps {
  currentStep: number // 0-4 (idle, 1, 2, 3, 4)
  type: "traditional" | "quorum"
  isAnimating: boolean
}

const STEPS_TRADITIONAL = ["준비", "트랜잭션 생성", "데이터 전파 (병목)", "리더 결정 및 합의", "완료"]
const STEPS_QUORUM = ["준비", "트랜잭션 생성", "데이터 전파 (병렬)", "경량 합의", "완료"]

export default function StepIndicator({
  currentStep,
  type,
  isAnimating,
}: StepIndicatorProps) {
  const steps = type === "traditional" ? STEPS_TRADITIONAL : STEPS_QUORUM
  const tiltColor = type === "quorum" ? "#06b6d4" : "#f97316" // 틸 vs 오렌지

  return (
    <div className="w-full">
      {/* Step Labels */}
      <div className="mb-3 flex items-center justify-between gap-2">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-1">
            {/* Step Label */}
            <p className="text-center text-xs font-medium text-foreground line-clamp-2 flex-1">
              {step}
            </p>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: tiltColor }}
          animate={{
            width: `${(currentStep / (steps.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  )
}
