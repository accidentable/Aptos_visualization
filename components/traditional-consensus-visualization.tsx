"use client"

import { useEffect, useState, useRef } from "react"

interface Node {
  id: number
  x: number
  y: number
  angle: number
  isLeader: boolean
  isActive: boolean
  hasData: boolean
  opacity: number
}

interface Particle {
  id: number
  x: number
  y: number
  targetX: number
  targetY: number
  progress: number
}

interface DataStream {
  id: number
  fromX: number
  fromY: number
  toX: number
  toY: number
  progress: number
}

export default function TraditionalConsensusVisualization({ isAnimating }: { isAnimating: boolean }) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [particles, setParticles] = useState<Particle[]>([])
  const [dataStreams, setDataStreams] = useState<DataStream[]>([])
  const [stage, setStage] = useState<"idle" | "data-collection" | "overload" | "processing" | "propagation" | "completion">("idle")
  const [leaderColor, setLeaderColor] = useState<"blue" | "orange" | "red" | "green">("blue")
  const [showHeat, setShowHeat] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Initialize nodes in a circle - 30 nodes around + 1 leader in center
  useEffect(() => {
    const centerX = 50
    const centerY = 50
    const radius = 35
    const nodeCount = 30

    const initialNodes: Node[] = [
      {
        id: -1,
        x: centerX,
        y: centerY,
        angle: 0,
        isLeader: true,
        isActive: false,
        hasData: false,
        opacity: 1,
      },
    ]

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i * 360) / nodeCount - 90
      const radian = (angle * Math.PI) / 180
      initialNodes.push({
        id: i,
        x: centerX + radius * Math.cos(radian),
        y: centerY + radius * Math.sin(radian),
        angle: angle,
        isLeader: false,
        isActive: false,
        hasData: false,
        opacity: 0.2,
      })
    }

    setNodes(initialNodes)
  }, [])

  // Animation sequence - Traditional consensus (sequential with detailed visual feedback)
  useEffect(() => {
    if (!isAnimating || nodes.length === 0) {
      setStage("idle")
      setParticles([])
      setDataStreams([])
      setLeaderColor("blue")
      setShowHeat(false)
      setNodes((prev) => prev.map((node) => ({
        ...node,
        isActive: node.isLeader,
        hasData: false,
        opacity: node.isLeader ? 1 : 0.2,
      })))
      return
    }

    const leaderNode = nodes.find((n) => n.isLeader)!
    const peripheryNodes = nodes.filter((n) => !n.isLeader)
    let timeouts: NodeJS.Timeout[] = []
    let intervals: NodeJS.Timeout[] = []

    // Stage 1: Data Collection - particles stream to center (SLOW)
    setStage("data-collection")
    setLeaderColor("blue")
    setShowHeat(false)

    // Generate particles from all 30 nodes
    const particleInterval = setInterval(() => {
      const randomNode = peripheryNodes[Math.floor(Math.random() * peripheryNodes.length)]
      const newParticle: Particle = {
        id: Math.random(),
        x: randomNode.x,
        y: randomNode.y,
        targetX: leaderNode.x,
        targetY: leaderNode.y,
        progress: 0,
      }
      setParticles((prev) => [...prev.slice(-50), newParticle]) // Keep max 50 particles
    }, 50) // Many particles spawned continuously

    intervals.push(particleInterval)

    // Animate particles toward leader (VERY SLOW - bottleneck effect)
    const moveParticlesInterval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + (p.targetX - p.x) * 0.012, // Very slow movement
            y: p.y + (p.targetY - p.y) * 0.012,
            progress: p.progress + 0.012,
          }))
          .filter((p) => p.progress < 1)
      )
    }, 16)

    intervals.push(moveParticlesInterval)

    // Stage 2: Overload (5 seconds in) - leader turns orange/red with heat effects
    timeouts.push(
      setTimeout(() => {
        setStage("overload")
        setShowHeat(true)
        setLeaderColor("orange")

        // Transition to red after 2 seconds
        timeouts.push(
          setTimeout(() => {
            setLeaderColor("red")
          }, 2000)
        )
      }, 5000)
    )

    // Stage 3: Processing complete, transition to propagation (10 seconds in)
    timeouts.push(
      setTimeout(() => {
        setStage("propagation")
        setLeaderColor("green")
        setShowHeat(false)
        clearInterval(particleInterval)
        clearInterval(moveParticlesInterval)
        setParticles([])

        // Create data streams from leader to all nodes
        const streams: DataStream[] = peripheryNodes.map((node, idx) => ({
          id: idx,
          fromX: leaderNode.x,
          fromY: leaderNode.y,
          toX: node.x,
          toY: node.y,
          progress: 0,
        }))
        setDataStreams(streams)

        // Animate data streams (SLOW)
        const streamsInterval = setInterval(() => {
          setDataStreams((prev) =>
            prev.map((stream) => ({
              ...stream,
              progress: Math.min(stream.progress + 0.015, 1),
            }))
          )
        }, 16)

        intervals.push(streamsInterval)

        // Stage 4: Completion - nodes activate one by one
        timeouts.push(
          setTimeout(() => {
            setStage("completion")
            setDataStreams([])
            clearInterval(streamsInterval)

            // Activate nodes sequentially (one per 150ms)
            let activatedCount = 0
            const activateInterval = setInterval(() => {
              setNodes((prev) => {
                const newNodes = [...prev]
                const nodeToActivate = newNodes.find((n) => !n.isLeader && !n.hasData)
                if (nodeToActivate) {
                  nodeToActivate.hasData = true
                  nodeToActivate.isActive = true
                  nodeToActivate.opacity = 1
                  activatedCount++
                }
                return newNodes
              })

              if (activatedCount >= 30) {
                clearInterval(activateInterval)
                timeouts.push(
                  setTimeout(() => {
                    setStage("idle")
                    setNodes((prev) =>
                      prev.map((node) => ({
                        ...node,
                        isActive: node.isLeader,
                        hasData: false,
                        opacity: 1,
                      }))
                    )
                  }, 1000)
                )
              }
            }, 150)

            intervals.push(activateInterval)
          }, 2000)
        )
      }, 10000)
    )

    return () => {
      timeouts.forEach((t) => clearTimeout(t))
      intervals.forEach((i) => clearInterval(i))
    }
  }, [isAnimating])

  return (
    <div ref={canvasRef} className="relative h-full w-full bg-gradient-to-b from-transparent to-transparent">
      <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {/* Draw connections between peripheral nodes */}
        {nodes
          .filter((n) => !n.isLeader)
          .map((node, i) => {
            const nextNode = nodes.filter((n) => !n.isLeader)[(i + 1) % 30]
            return (
              <line
                key={`line-${i}`}
                x1={node.x}
                y1={node.y}
                x2={nextNode.x}
                y2={nextNode.y}
                stroke="#e5e7eb"
                strokeWidth="0.3"
                opacity="0.3"
              />
            )
          })}

        {/* Draw peripheral nodes */}
        {nodes
          .filter((n) => !n.isLeader)
          .map((node) => (
            <g key={`node-${node.id}`}>
              <circle
                cx={node.x}
                cy={node.y}
                r={1.5}
                fill={node.hasData ? "#10b981" : "#d1d5db"}
                opacity={node.opacity}
                className="transition-all duration-300"
              />
            </g>
          ))}

        {/* Draw data particles flowing toward center */}
        {particles.map((p) => (
          <g key={`particle-${p.id}`}>
            <circle cx={p.x} cy={p.y} r={0.5} fill="#06b6d4" opacity="0.7" />
            <circle cx={p.x} cy={p.y} r={0.8} fill="none" stroke="#06b6d4" strokeWidth="0.2" opacity="0.4" />
          </g>
        ))}

        {/* Draw data streams (propagation phase) */}
        {dataStreams.map((stream) => (
          <g key={`stream-${stream.id}`}>
            <line
              x1={stream.fromX}
              y1={stream.fromY}
              x2={stream.fromX + (stream.toX - stream.fromX) * stream.progress}
              y2={stream.fromY + (stream.toY - stream.fromY) * stream.progress}
              stroke="#10b981"
              strokeWidth="0.4"
              opacity={0.7}
            />
            <circle
              cx={stream.fromX + (stream.toX - stream.fromX) * stream.progress}
              cy={stream.fromY + (stream.toY - stream.fromY) * stream.progress}
              r={0.6}
              fill="#10b981"
              opacity="0.8"
            />
          </g>
        ))}

        {/* Draw leader node */}
        {nodes
          .filter((n) => n.isLeader)
          .map((node) => {
            const leaderFill =
              leaderColor === "blue"
                ? "#06b6d4"
                : leaderColor === "orange"
                  ? "#f97316"
                  : leaderColor === "red"
                    ? "#ef4444"
                    : "#10b981"

            return (
              <g key={`leader-${node.id}`}>
                {/* Heat wave effect (red stage) */}
                {showHeat && leaderColor === "red" && (
                  <>
                    <circle cx={node.x} cy={node.y} r={5} fill="none" stroke="#ef4444" strokeWidth="0.5" opacity="0.3">
                      <animate attributeName="r" values="5;7;5" dur="0.6s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.3;0;0.3" dur="0.6s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={node.x} cy={node.y} r={3.5} fill="none" stroke="#fbbf24" strokeWidth="0.4" opacity="0.4">
                      <animate attributeName="r" values="3.5;5;3.5" dur="0.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.4;0;0.4" dur="0.8s" repeatCount="indefinite" />
                    </circle>
                  </>
                )}

                {/* Main leader node with breathing effect (blue stage) */}
                {leaderColor === "blue" && (
                  <circle cx={node.x} cy={node.y} r={4} fill="none" stroke={leaderFill} strokeWidth="0.8" opacity="0.4">
                    <animate attributeName="r" values="4;5;4" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Core circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={3.5}
                  fill={leaderFill}
                  opacity={leaderColor === "blue" ? 0.8 : 1}
                  className="transition-all duration-500"
                />

                {/* Bright aura when green */}
                {leaderColor === "green" && (
                  <circle cx={node.x} cy={node.y} r={3.5} fill="none" stroke="#10b981" strokeWidth="0.6" opacity="0.8">
                    <animate attributeName="r" values="3.5;5.5;3.5" dur="0.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.5s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Sparks during overload (red stage) */}
                {showHeat && leaderColor === "red" && (
                  <>
                    <circle cx={node.x + 2.5} cy={node.y - 2} r={0.4} fill="#fbbf24" opacity="0.7">
                      <animate attributeName="cy" values={`${node.y - 2};${node.y - 5}`} dur="0.6s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.7;0" dur="0.6s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={node.x - 2} cy={node.y + 2.5} r={0.4} fill="#fbbf24" opacity="0.6">
                      <animate attributeName="cy" values={`${node.y + 2.5};${node.y + 5}`} dur="0.7s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0" dur="0.7s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={node.x - 2.5} cy={node.y - 1} r={0.35} fill="#fbbf24" opacity="0.5">
                      <animate attributeName="cx" values={`${node.x - 2.5};${node.x - 5}`} dur="0.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.5;0" dur="0.8s" repeatCount="indefinite" />
                    </circle>
                  </>
                )}
              </g>
            )
          })}

        {/* Stage indicator text */}
        <text x="50" y="95" textAnchor="middle" fontSize="2" fill="#666" className="pointer-events-none">
          {stage === "idle"
            ? "준비 상태"
            : stage === "data-collection"
              ? "1단계: 데이터 집중 (병목)"
              : stage === "overload"
                ? "2단계: 리더 과부하"
                : stage === "propagation"
                  ? "3단계: 데이터 전파"
                  : "4단계: 완료"}
        </text>
      </svg>
    </div>
  )
}
