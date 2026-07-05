"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Image from "next/image"

const TOTAL_FRAMES = 97
const SCROLL_HEIGHT = 350

export function CinematicHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const currentFrameRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const [showIntro, setShowIntro] = useState(true)

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const img = imagesRef.current[index]
    if (!img) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const cw = canvas.width
    const ch = canvas.height
    const iw = img.naturalWidth
    const ih = img.naturalHeight

    const scale = Math.max(cw / iw, ch / ih)
    const sw = iw * scale
    const sh = ih * scale
    const sx = (cw - sw) / 2
    const sy = (ch - sh) / 2

    ctx.clearRect(0, 0, cw, ch)
    ctx.drawImage(img, sx, sy, sw, sh)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      drawFrame(currentFrameRef.current)
    }

    resizeCanvas()
    const ro = new ResizeObserver(resizeCanvas)
    if (canvas.parentElement) ro.observe(canvas.parentElement)
    window.addEventListener("resize", resizeCanvas)

    const loadImage = (index: number): Promise<void> => {
      return new Promise((resolve) => {
        const img = document.createElement("img")
        const frameNum = String(index + 1).padStart(4, "0")
        const prefix = window.innerWidth < 768 ? "/mobile/photos" : "/sequence"
        img.src = `${prefix}/img-${frameNum}.webp`
        img.onload = () => resolve()
        img.onerror = () => resolve()
        imagesRef.current[index] = img
        if (index === 0) {
          img.onload = () => {
            drawFrame(0)
            resolve()
          }
        }
      })
    }

    const preloadAll = async () => {
      await loadImage(0)
      for (let i = 1; i < TOTAL_FRAMES; i++) {
        setTimeout(() => loadImage(i), i * 30)
      }
    }

    preloadAll()

    return () => {
      ro.disconnect()
      window.removeEventListener("resize", resizeCanvas)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [drawFrame])

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const container = containerRef.current
        if (!container) return
        const rect = container.getBoundingClientRect()
        const totalHeight = rect.height - window.innerHeight
        const scrolled = -rect.top
        const progress = Math.max(0, Math.min(1, scrolled / totalHeight))
        const frameIndex = Math.min(
          TOTAL_FRAMES - 1,
          Math.floor(progress * TOTAL_FRAMES)
        )
        currentFrameRef.current = frameIndex
        if (imagesRef.current[frameIndex]) {
          drawFrame(frameIndex)
        }
        if (frameIndex >= TOTAL_FRAMES - 1) {
          setShowIntro(false)
        }
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [drawFrame])

  return (
    <>
      {/* Cinematic Logo Intro */}
      <section
        className={`relative w-full bg-white overflow-hidden transition-all duration-1000 ${
          showIntro ? "h-screen opacity-100" : "h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full px-6">
          <div className="animate-logo-reveal flex flex-col items-center gap-6">
            <Image
              src="/logo.jpg"
              alt="مملكة الثقة 25"
              width={280}
              height={140}
              className="max-h-32 w-auto object-contain"
              priority
            />
            <p className="text-sm tracking-[0.3em] uppercase text-[#FF5722] font-medium">
              Meuble Confiance Constantine
            </p>
            <div className="mt-4 w-12 h-[1px] bg-[#FF5722]/40" />
          </div>
          <div className="absolute bottom-12 animate-scroll-indicator">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FF5722"
              strokeWidth="1.5"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </div>
        </div>
      </section>

      {/* Canvas Scroll Sequence */}
      <section
        ref={containerRef}
        className="relative w-full bg-black"
        style={{ height: `${SCROLL_HEIGHT}vh` }}
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
      </section>
    </>
  )
}
