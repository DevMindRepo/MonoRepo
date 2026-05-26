"use client"

import { ArrowLeft, ArrowRight, Save, CheckCircle, Zap } from "lucide-react"
import { useEffect, useState } from "react"
import { ScrollReveal } from "@/components/app/scroll-reveal"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import type { CarouselApi } from "@/components/ui/carousel"

const STEPS = [
  {
    icon: Save,
    step: "01",
    title: "Save",
    description:
      "Your AI calls save_memory() via MCP. The memory enters a pending queue — non-blocking, instant return.",
    detail: "→ Redis pending queue (24h TTL)",
    highlight: false,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
    accent: "rgba(173,255,47,0.6)",
    iconColor: "#ADFF2F",
  },
  {
    icon: CheckCircle,
    step: "02",
    title: "Approve",
    description:
      "You review in the dashboard. Potential secrets are highlighted. You approve, edit, or reject — you stay in control.",
    detail: "→ Human-in-the-loop",
    highlight: true,
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
    accent: "rgba(244,114,182,0.6)",
    iconColor: "#F472B6",
  },
  {
    icon: Zap,
    step: "03",
    title: "Recall",
    description:
      "Any AI in your workspace can recall by meaning — semantic search returns the right context, decrypted on the fly.",
    detail: "→ pgvector + Walrus + Seal",
    highlight: false,
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
    accent: "rgba(173,255,47,0.6)",
    iconColor: "#ADFF2F",
  },
]

export function HowItWorksSection() {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (!carouselApi) return
    const update = () => {
      setCanScrollPrev(carouselApi.canScrollPrev())
      setCanScrollNext(carouselApi.canScrollNext())
      setCurrentSlide(carouselApi.selectedScrollSnap())
    }
    update()
    carouselApi.on("select", update)
    return () => { carouselApi.off("select", update) }
  }, [carouselApi])

  return (
    <section id="how-it-works" className="py-16 md:py-24 border-t border-[rgba(255,255,255,0.04)] overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <ScrollReveal>
          <div className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-3">
              <p className="text-xs font-mono text-[#ADFF2F] uppercase tracking-widest">How it works</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Three steps. Zero friction.
              </h2>
              <p className="text-[#8B96A0] max-w-md">
                Works with any MCP-compatible AI. The same memory shared between Claude Code, Cursor, and your autonomous agents.
              </p>
            </div>
            <div className="hidden shrink-0 gap-2 md:flex">
              <button
                onClick={() => carouselApi?.scrollPrev()}
                disabled={!canScrollPrev}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#8B96A0] transition-all hover:border-[rgba(173,255,47,0.3)] hover:text-[#ADFF2F] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => carouselApi?.scrollNext()}
                disabled={!canScrollNext}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#8B96A0] transition-all hover:border-[rgba(173,255,47,0.3)] hover:text-[#ADFF2F] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Carousel */}
      <div className="w-full">
        <Carousel
          setApi={setCarouselApi}
          opts={{ breakpoints: { "(max-width: 768px)": { dragFree: true } } }}
        >
          <CarouselContent className="ml-0 pl-6 2xl:pl-[max(1.5rem,calc(50vw-672px))]">
            {STEPS.map(({ icon: Icon, step, title, description, detail, highlight, image, accent, iconColor }, index) => (
              <CarouselItem key={step} className="max-w-[340px] pl-4 lg:max-w-[400px]">
                <ScrollReveal delay={index * 80}>
                  <div
                    className="group relative min-h-[420px] overflow-hidden rounded-[20px] flex flex-col justify-between cursor-grab active:cursor-grabbing"
                    style={{ border: highlight ? "1px solid rgba(244,114,182,0.35)" : "1px solid rgba(255,255,255,0.08)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(7,11,14,0.35)_0%,rgba(7,11,14,0.88)_100%)]" />
                    <div className="relative z-10 flex items-start justify-between p-6">
                      {highlight ? (
                        <span className="rounded-full border border-[rgba(244,114,182,0.3)] bg-[rgba(7,11,14,0.7)] px-3 py-1 text-[10px] font-mono text-[#F472B6] backdrop-blur-sm">Key differentiator</span>
                      ) : <span />}
                      <span className="font-mono text-4xl font-bold text-[rgba(255,255,255,0.12)]">{step}</span>
                    </div>
                    <div className="relative z-10 p-6 space-y-3">
                      <Icon className="h-6 w-6" style={{ color: iconColor }} />
                      <h3 className="text-xl font-semibold text-[#E8EDF0]">{title}</h3>
                      <p className="text-sm text-[#8B96A0] leading-relaxed">{description}</p>
                      <p className="text-xs font-mono" style={{ color: iconColor, opacity: 0.7 }}>{detail}</p>
                    </div>
                    <div className="absolute bottom-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
                  </div>
                </ScrollReveal>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="mt-6 flex justify-center gap-2">
          {STEPS.map((_, index) => (
            <button
              key={index}
              onClick={() => carouselApi?.scrollTo(index)}
              aria-label={`Go to step ${index + 1}`}
              className="transition-all duration-300"
              style={{
                height: "6px",
                width: currentSlide === index ? "24px" : "6px",
                borderRadius: "9999px",
                background: currentSlide === index ? "#ADFF2F" : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
