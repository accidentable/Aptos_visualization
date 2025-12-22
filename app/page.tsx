"use client"

import { ArrowRight, BookOpen, Zap, Flashlight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface DashboardItem {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  duration: string
}

const dashboardItems: DashboardItem[] = [
  {
    title: "Transaction의 여정",
    description: "Quorum Store를 통해 트랜잭션이 처리되는 전 과정을 시각화로 체험해보세요",
    href: "/transaction",
    icon: <Flashlight className="h-5 w-5" />,
    duration: "5 min",
  },
]

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-auto items-center justify-center">
              <Image 
                src="/aptos-logo2.png" 
                alt="Aptos" 
                width={60} 
                height={32}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Aptos Overview</h1>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-6xl mx-auto px-4 py-16">
        {/* Welcome Section */}
        <div className="mb-16">
          <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-3">Welcome</p>
          <h2 className="text-5xl font-bold tracking-tight text-gray-900 mb-4">
            앱토스 네트워크 이해하기
          </h2>
          <p className="text-base text-gray-600 max-w-2xl">
            Aptos의 혁신적인 합의 메커니즘을 시각적으로 학습해보세요
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {dashboardItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="group h-full border border-gray-200 bg-white transition-all duration-300 hover:border-gray-300 hover:shadow-sm cursor-pointer flex flex-col">
                {/* Content */}
                <div className="p-6 flex flex-col h-full gap-4">
                  {/* Icon */}
                  <div className="flex items-start justify-between">
                    <div className="text-gray-700">
                      {item.icon}
                    </div>
                    <span className="text-xs font-medium text-gray-600 border border-gray-200 px-2 py-1">
                      {item.duration}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 transition-colors duration-300 group-hover:text-gray-700">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Footer with Arrow */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs font-medium text-gray-600">자세히 보기</span>
                    <ArrowRight className="h-4 w-4 text-gray-700 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* Coming Soon Card */}
          <div className="h-full border border-gray-200 border-dashed bg-gray-50">
            {/* Content */}
            <div className="p-6 flex flex-col h-full gap-4">
              {/* Icon */}
              <div className="flex items-start justify-between">
                <div className="text-gray-400">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-gray-500 border border-gray-200 px-2 py-1">
                  Soon
                </span>
              </div>

              {/* Title & Description */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-500 mb-2">
                  더 많은 콘텐츠
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                  더 많은 학습 자료가 준비 중입니다
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-xs font-medium text-gray-500">곧 추가됩니다</span>
                <BookOpen className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="container max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <p className="text-sm text-gray-500">
              Built by <span className="font-medium text-gray-900">@Ray</span> <span className="text-gray-400">Aptos</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
