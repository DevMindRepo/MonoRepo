"use client"

import { type ReactNode, useEffect, useState } from "react"
import { ReactLenis } from "lenis/react"
import "lenis/dist/lenis.css"

/**
 * Wraps a page in Lenis smooth scrolling (the gliding/momentum feel à la
 * walrus.xyz). Mounted only where it's wanted — when this unmounts (e.g. on
 * navigation to the dashboard) native scrolling resumes.
 *
 * Tuning lives in `options` below:
 *  - lerp           — wheel smoothing; lower = more glide/inertia (0..1)
 *  - wheelMultiplier — scroll distance per wheel tick
 *  - anchors        — smooth-scroll in-page `#` links too
 * Touch devices keep native scrolling (syncTouch off) so mobile feels normal.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    // Users who prefer reduced motion get plain native scrolling.
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setEnabled(!mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  if (!enabled) return <>{children}</>

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08,
        smoothWheel: true,
        wheelMultiplier: 1,
        syncTouch: false,
        anchors: true,
      }}
    >
      {children}
    </ReactLenis>
  )
}
