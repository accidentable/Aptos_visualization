"use client"

import { useEffect, useState, useRef } from "react"

interface Node {
  id: number
  x: number
  y: number
  angle: number
  isEntry: boolean
  isActive: boolean
}

interface Particle {
  id: number
  x: number
  y: number
  targetX: number
  targetY: number
  progress: number
}

interface LightBeam {
  id: number
  fromX: number
  fromY: number
  toX: number
  toY: number
  progress: number
}

export default function QuorumStoreVisualization({ isAnimating }: { isAnimating: boolean }) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [particle, setParticle] = useState<Particle | null>(null)
  const [lightBeams, setLightBeams] = useState<LightBeam[]>([])
  const [stage, setStage] = useState<"idle" | "entry" | "dissemination" | "acknowledgement">("idle")
  const canvasRef = useRef<HTMLDivElement>(null)

  // Initialize nodes in a circle
  useEffect(() => {
    const centerX = 50
    const centerY = 50
    const radius = 30
    const nodeCount = 6

    const initialNodes: Node[] = []
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i * 360) / nodeCount - 90 // Start from top
      const radian = (angle * Math.PI) / 180
      initialNodes.push({
        id: i,
        x: centerX + radius * Math.cos(radian),
        y: centerY + radius * Math.sin(radian),
        angle: angle,
        isEntry: i === 0, // Top node is entry
        isActive: false,
      })
    }

    setNodes(initialNodes)
  }, [])

  // Animation sequence
  useEffect(() => {
    if (!isAnimating || nodes.length === 0) {
      setStage("idle")
      setParticle(null)
      setLightBeams([])
      setNodes((prev) => prev.map((node) => ({ ...node, isActive: false })))
      return
    }

    // Stage 1: Entry - particle moves from button to entry node
    setStage("entry")
    const entryNode = nodes.find((n) => n.isEntry)!

    setParticle({
      id: 1,
      x: 50,
      y: 85,
      targetX: entryNode.x,
      targetY: entryNode.y,
      progress: 0,
    })

    const entryInterval = setInterval(() => {
      setParticle((prev) => {
        if (!prev || prev.progress >= 1) {
          clearInterval(entryInterval)
          return null
        }
        const newProgress = prev.progress + 0.05 // Faster for Quorum Store
        return {
          ...prev,
          x: prev.x + (prev.targetX - prev.x) * 0.05,
          y: prev.y + (prev.targetY - prev.y) * 0.05,
          progress: newProgress,
        }
      })
    }, 16)

    // Stage 2: Dissemination - light beams to all nodes
    setTimeout(() => {
      setStage("dissemination")
      setParticle(null)
      setNodes((prev) => prev.map((node) => (node.isEntry ? { ...node, isActive: true } : node)))

      const beams: LightBeam[] = nodes
        .filter((node) => !node.isEntry)
        .map((node, index) => ({
          id: index,
          fromX: entryNode.x,
          fromY: entryNode.y,
          toX: node.x,
          toY: node.y,
          progress: 0,
        }))

      setLightBeams(beams)

      const disseminationInterval = setInterval(() => {
        setLightBeams((prev) =>
          prev.map((beam) => ({
            ...beam,
            progress: Math.min(beam.progress + 0.1, 1), // Much faster for Quorum Store
          })),
        )
      }, 16)

      setTimeout(() => {
        clearInterval(disseminationInterval)
      }, 300) // Faster completion
    }, 200) // Faster start

    // Stage 3: Acknowledgement - all nodes light up
    setTimeout(() => {
      setStage("acknowledgement")
      setLightBeams([])
      setNodes((prev) => prev.map((node) => ({ ...node, isActive: true })))

      setTimeout(() => {
        setStage("idle")
        setNodes((prev) => prev.map((node) => ({ ...node, isActive: false })))
      }, 500) // Faster final stage
    }, 600) // Faster overall timeline
  }, [isAnimating, nodes.length])

  return (
    <div ref={canvasRef} className="relative h-full w-full">
      <svg className="h-full w-full" viewBox="0 0 100 100">
        {/* Light Beams */}
        {lightBeams.map((beam) => (
          <g key={beam.id}>
            <line
              x1={beam.fromX}
              y1={beam.fromY}
              x2={beam.fromX + (beam.toX - beam.fromX) * beam.progress}
              y2={beam.fromY + (beam.toY - beam.fromY) * beam.progress}
              stroke="oklch(0.6 0.15 190)"
              strokeWidth="0.3"
              strokeLinecap="round"
              opacity={0.6}
            />
            <circle
              cx={beam.fromX + (beam.toX - beam.fromX) * beam.progress}
              cy={beam.fromY + (beam.toY - beam.fromY) * beam.progress}
              r="0.8"
              fill="oklch(0.7 0.18 190)"
              opacity={0.8}
            >
              <animate attributeName="r" values="0.8;1.2;0.8" dur="0.5s" repeatCount="indefinite" />
            </circle>
          </g>
        ))}

        {/* Nodes */}
        {nodes.map((node) => (
          <g key={node.id}>
            {/* Glow effect when active */}
            {node.isActive && (
              <circle cx={node.x} cy={node.y} r="4" fill="oklch(0.6 0.15 190)" opacity="0.3">
                <animate attributeName="r" values="4;6;4" dur="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.1;0.3" dur="1s" repeatCount="indefinite" />
              </circle>
            )}

            {/* Node circle */}
            <circle
              cx={node.x}
              cy={node.y}
              r="2.5"
              fill={node.isActive ? "oklch(0.6 0.15 190)" : "oklch(0.9 0.005 190)"}
              stroke={node.isEntry ? "oklch(0.6 0.15 190)" : "oklch(0.8 0.01 190)"}
              strokeWidth={node.isEntry ? "0.5" : "0.3"}
              className="transition-all duration-300"
            />

            {/* Entry node indicator */}
            {node.isEntry && (
              <circle
                cx={node.x}
                cy={node.y}
                r="3.5"
                fill="none"
                stroke="oklch(0.6 0.15 190)"
                strokeWidth="0.3"
                opacity="0.5"
              />
            )}
          </g>
        ))}

        {/* Particle */}
        {particle && (
          <g>
            <circle cx={particle.x} cy={particle.y} r="1.2" fill="oklch(0.7 0.18 190)" opacity="0.8">
              <animate attributeName="r" values="1.2;1.6;1.2" dur="0.5s" repeatCount="indefinite" />
            </circle>
            <circle cx={particle.x} cy={particle.y} r="2" fill="oklch(0.7 0.18 190)" opacity="0.3">
              <animate attributeName="r" values="2;3;2" dur="0.5s" repeatCount="indefinite" />
            </circle>
          </g>
        )}
      </svg>
    </div>
  )
}
