"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

const ShaderAnimation = dynamic(
  () => import("@/components/ui/shader-lines").then((m) => m.ShaderAnimation),
  { ssr: false }
)

export function TopShaderBg() {
  const [height, setHeight] = useState<number | null>(null)

  useEffect(() => {
    const measure = () => {
      const section = document.getElementById("how-it-works")
      if (section) {
        const bottom = section.getBoundingClientRect().bottom + window.scrollY
        setHeight(bottom)
      }
    }

    measure()
    // Re-measure after images/fonts settle
    const t1 = setTimeout(measure, 200)
    const t2 = setTimeout(measure, 800)
    window.addEventListener("resize", measure)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      window.removeEventListener("resize", measure)
    }
  }, [])

  return (
    <div
      className="absolute top-0 left-0 w-full pointer-events-none overflow-hidden"
      style={{ height: height ? `${height}px` : "400vh" }}
      aria-hidden="true"
    >
      {/* WebGL shader — covers entire height */}
      <div className="absolute inset-0 opacity-[0.20]">
        <ShaderAnimation />
      </div>

      {/* Only fade the very bottom edge into the page background */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-[#070B0E]" />
    </div>
  )
}
