"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight, Link, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: React.ElementType;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
}

interface OrbitalSizing {
  containerSize: number;
  orbitRadius: number;
  centralOrbSize: number;
  nodeSize: number;
  nodeIconSize: number;
  ringOuter: number;
  ringAccent: number;
  ringDashed: number;
  ringInner: number;
}

function getOrbitalSizing(width: number): OrbitalSizing {
  if (width < 640) {
    return {
      containerSize:  320,
      orbitRadius:    130,
      centralOrbSize:  48,
      nodeSize:        40,
      nodeIconSize:    16,
      ringOuter:      310,
      ringAccent:     280,
      ringDashed:     240,
      ringInner:      110,
    };
  }
  if (width < 1024) {
    return {
      containerSize:  400,
      orbitRadius:    170,
      centralOrbSize:  60,
      nodeSize:        48,
      nodeIconSize:    18,
      ringOuter:      386,
      ringAccent:     350,
      ringDashed:     300,
      ringInner:      135,
    };
  }
  return {
    containerSize:  480,
    orbitRadius:    210,
    centralOrbSize:  72,
    nodeSize:        56,
    nodeIconSize:    20,
    ringOuter:      460,
    ringAccent:     420,
    ringDashed:     360,
    ringInner:      160,
  };
}

export default function RadialOrbitalTimeline({ timelineData }: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [pulseEffect, setPulseEffect]     = useState<Record<number, boolean>>({});
  const [activeNodeId, setActiveNodeId]   = useState<number | null>(null);
  const [sizing, setSizing]               = useState<OrbitalSizing>(() => getOrbitalSizing(
    typeof window !== "undefined" ? window.innerWidth : 1024
  ));

  const rotationRef    = useRef(0);
  const autoRotateRef  = useRef(true);
  const pendingCardRef = useRef<number | null>(null);
  const lastTimeRef    = useRef<number | null>(null);
  const snapRef        = useRef<{ from: number; to: number; startTs: number } | null>(null);
  const SNAP_MS        = 1400;
  const rafRef         = useRef<number | undefined>(undefined);
  const containerRef   = useRef<HTMLDivElement>(null);
  const orbitRef       = useRef<HTMLDivElement>(null);
  const nodeElsRef      = useRef<(HTMLDivElement | null)[]>([]);
  const activeNodeIdRef = useRef<number | null>(null);
  const sizingRef       = useRef<OrbitalSizing>(sizing);

  // Sync sizing on window resize
  useEffect(() => {
    const handleResize = () => {
      setSizing(getOrbitalSizing(window.innerWidth));
    };
    window.addEventListener("resize", handleResize);
    // Also set on mount to capture true client width
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Mirror state into refs so the (stable) animation loop can read the latest
  // values without being re-created each render.
  useEffect(() => { activeNodeIdRef.current = activeNodeId; }, [activeNodeId]);
  useEffect(() => { sizingRef.current = sizing; }, [sizing]);

  // rAF — runs only while the section is visible (see IntersectionObserver below)
  // Apply orbital node positions straight to the DOM. The old approach called
  // setTick() every frame, re-rendering the whole subtree 60×/s and starving
  // the smooth-scroll thread. Now React only renders on click/state changes.
  const applyPositions = useCallback(() => {
    const radius = sizingRef.current.orbitRadius;
    const n      = timelineData.length;
    for (let index = 0; index < n; index++) {
      const el = nodeElsRef.current[index];
      if (!el) continue;
      const angle    = ((index / n) * 360 + rotationRef.current) % 360;
      const rad      = (angle * Math.PI) / 180;
      const isActive = timelineData[index].id === activeNodeIdRef.current;
      el.style.transform = `translate(${radius * Math.cos(rad)}px, ${radius * Math.sin(rad)}px)`;
      el.style.zIndex    = String(isActive ? 200 : Math.round(100 + 50 * Math.cos(rad)));
      el.style.opacity   = String(isActive ? 1 : Math.max(0.55, Math.min(1, 0.35 + 0.65 * ((1 + Math.sin(rad)) / 2))));
    }
  }, [timelineData]);

  const animate = useCallback((ts: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = ts;
    const dt = (ts - lastTimeRef.current) / 1000;
    lastTimeRef.current = ts;

    if (snapRef.current) {
      const { from, to, startTs } = snapRef.current;
      const progress = Math.min((ts - startTs) / SNAP_MS, 1);
      // ease-in-out cubic
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      // Shortest-path diff
      let diff = to - from;
      diff = ((diff + 180) % 360) - 180;
      rotationRef.current = ((from + diff * ease) + 360) % 360;
      if (progress >= 1) {
        snapRef.current = null;
        if (pendingCardRef.current !== null) {
          const id = pendingCardRef.current;
          pendingCardRef.current = null;
          setExpandedItems(prev => ({ ...prev, [id]: true }));
        }
      }
    } else if (autoRotateRef.current) {
      rotationRef.current = (rotationRef.current + dt * 6) % 360;
    }

    applyPositions();
    rafRef.current = requestAnimationFrame(animate);
  }, [applyPositions]);

  // Only run the loop while the section is on-screen, so it stops competing
  // with smooth-scroll once the user scrolls past it.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const start = () => {
      if (rafRef.current == null) {
        lastTimeRef.current = null;
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    const stop = () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = undefined;
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) start(); else stop(); },
      { rootMargin: "100px" }
    );
    io.observe(el);

    return () => { io.disconnect(); stop(); };
  }, [animate]);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      autoRotateRef.current = true;
      snapRef.current = null;
      pendingCardRef.current = null;
    }
  };

  const toggleItem = (id: number) => {
    const isOpen = expandedItems[id];

    if (isOpen) {
      // Close
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      autoRotateRef.current = true;
      snapRef.current = null;
      pendingCardRef.current = null;
    } else {
      // Close any open card immediately
      setExpandedItems({});
      // Highlight node right away
      setActiveNodeId(id);
      autoRotateRef.current = false;

      const related = timelineData.find(i => i.id === id)?.relatedIds ?? [];
      const pulse: Record<number, boolean> = {};
      related.forEach(r => { pulse[r] = true; });
      setPulseEffect(pulse);

      // Calculate snap target: bring clicked node to top (270°)
      const nodeIndex = timelineData.findIndex(i => i.id === id);
      const nodeAngle = (nodeIndex / timelineData.length) * 360;
      const target    = ((270 - nodeAngle) % 360 + 360) % 360;

      snapRef.current        = { from: rotationRef.current, to: target, startTs: performance.now() };
      pendingCardRef.current = id;
    }
  };

  const calcPos = (index: number) => {
    const angle  = ((index / timelineData.length) * 360 + rotationRef.current) % 360;
    const rad    = (angle * Math.PI) / 180;
    const radius = sizing.orbitRadius;
    return {
      x:       radius * Math.cos(rad),
      y:       radius * Math.sin(rad),
      zIndex:  Math.round(100 + 50 * Math.cos(rad)),
      opacity: Math.max(0.55, Math.min(1, 0.35 + 0.65 * ((1 + Math.sin(rad)) / 2))),
    };
  };

  const isRelatedToActive = (id: number) =>
    activeNodeId ? (timelineData.find(i => i.id === activeNodeId)?.relatedIds ?? []).includes(id) : false;

  const statusStyle = (s: TimelineItem["status"]) => {
    if (s === "completed")   return "text-[#ADFF2F] bg-[rgba(173,255,47,0.12)] border-[rgba(173,255,47,0.3)]";
    if (s === "in-progress") return "text-[#F472B6] bg-[rgba(244,114,182,0.12)] border-[rgba(244,114,182,0.3)]";
    return "text-[#8B96A0] bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.12)]";
  };
  const statusLabel = (s: TimelineItem["status"]) =>
    s === "completed" ? "COMPLETE" : s === "in-progress" ? "IN PROGRESS" : "PENDING";

  const { containerSize, centralOrbSize, nodeSize, nodeIconSize,
          ringOuter, ringAccent, ringDashed, ringInner } = sizing;

  // Energy aura scales with node size
  const auraOffset = (energy: number) => {
    const auraSize = energy * 0.55 + 60;
    const ratio    = nodeSize / 56; // scale factor vs original 56px node
    const scaled   = auraSize * ratio;
    return {
      size:   scaled,
      offset: (scaled - nodeSize) / 2,
    };
  };

  // Label top offset: sits just below the node circle
  const labelTopOffset = nodeSize + 8;

  // Card offset: sits below label
  const cardTopOffset  = labelTopOffset + 12;

  // Ping rings around central orb scale proportionally
  const pingRing1 = Math.round(centralOrbSize * 1.22);
  const pingRing2 = Math.round(centralOrbSize * 1.5);

  // Highlight dot on central orb
  const highlightSize   = Math.round(centralOrbSize * 0.25);
  const highlightTop    = Math.round(centralOrbSize * 0.194);
  const highlightLeft   = Math.round(centralOrbSize * 0.25);

  return (
    <div
      ref={containerRef}
      className="w-full h-screen flex flex-col items-center justify-center overflow-hidden relative isolate"
      onClick={handleContainerClick}
      style={{ background: "#070B0E" }}
    >
      <style suppressHydrationWarning>{`
        @keyframes orbPopIn {
          from { opacity: 0; transform: scale(0.88) translateY(-8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0px);  }
        }
      `}</style>

      {/* ── Background layers ─────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(173,255,47,0.07) 0%, rgba(173,255,47,0.02) 40%, transparent 70%)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 40% 30% at 70% 30%, rgba(139,92,246,0.06) 0%, transparent 60%)" }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.18]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 55%, rgba(7,11,14,0.85) 100%)" }} />

      {/* ── Orbit rings ───────────────────────────────────────────────────── */}
      <div className="absolute flex items-center justify-center pointer-events-none" style={{ width: containerSize, height: containerSize }}>
        <div className="absolute rounded-full" style={{ width: ringOuter,  height: ringOuter,  border: "1px solid rgba(255,255,255,0.04)" }} />
        <div className="absolute rounded-full" style={{ width: ringAccent, height: ringAccent, border: "1px solid rgba(173,255,47,0.12)" }} />
        <div className="absolute rounded-full" style={{ width: ringDashed, height: ringDashed, border: "1px dashed rgba(173,255,47,0.06)" }} />
        <div className="absolute rounded-full" style={{ width: ringInner,  height: ringInner,  border: "1px solid rgba(255,255,255,0.05)" }} />
      </div>

      <div ref={orbitRef} className="relative flex items-center justify-center" style={{ width: containerSize, height: containerSize }}>
        {/* ── Central orb ───────────────────────────────────────────────── */}
        <div className="absolute flex items-center justify-center z-10" style={{ width: centralOrbSize, height: centralOrbSize }}>
          <div className="absolute rounded-full animate-ping opacity-30" style={{ width: pingRing1, height: pingRing1, border: "1px solid rgba(173,255,47,0.5)", animationDuration: "2.2s" }} />
          <div className="absolute rounded-full animate-ping opacity-20" style={{ width: pingRing2, height: pingRing2, border: "1px solid rgba(173,255,47,0.3)", animationDuration: "2.8s", animationDelay: "0.6s" }} />
          <div className="absolute rounded-full" style={{ width: centralOrbSize, height: centralOrbSize, background: "radial-gradient(circle at 35% 30%, #C8FF52, #ADFF2F 45%, #3D6600)", boxShadow: "0 0 30px rgba(173,255,47,0.45), 0 0 60px rgba(173,255,47,0.18)" }} />
          <div className="absolute rounded-full bg-white/40" style={{ width: highlightSize, height: highlightSize, top: highlightTop, left: highlightLeft }} />
        </div>

        {/* ── Orbital nodes ─────────────────────────────────────────────── */}
        {timelineData.map((item, index) => {
          const pos        = calcPos(index);
          const isActive   = item.id === activeNodeId;
          const isExpanded = expandedItems[item.id];
          const isRelated  = isRelatedToActive(item.id);
          const isPulsing  = pulseEffect[item.id];
          const Icon       = item.icon;
          const aura       = auraOffset(item.energy);

          return (
            <div
              key={item.id}
              ref={el => { nodeElsRef.current[index] = el; }}
              className="absolute transition-[opacity] duration-200 cursor-pointer"
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                zIndex:    isActive ? 200 : pos.zIndex,
                opacity:   isActive ? 1   : pos.opacity,
              }}
              onClick={e => { e.stopPropagation(); toggleItem(item.id); }}
            >
              {/* Energy aura */}
              <div
                className={`absolute rounded-full ${isPulsing ? "animate-pulse" : ""}`}
                style={{
                  width:      `${aura.size}px`,
                  height:     `${aura.size}px`,
                  left:       `-${aura.offset}px`,
                  top:        `-${aura.offset}px`,
                  background: "radial-gradient(circle, rgba(173,255,47,0.12) 0%, transparent 70%)",
                }}
              />

              {/* Node circle */}
              <div
                className={[
                  "flex items-center justify-center rounded-full border-2 transition-all duration-300 shadow-lg",
                  isActive
                    ? "bg-[#ADFF2F] text-black border-[#ADFF2F] scale-[1.35]"
                    : isRelated
                      ? "bg-[rgba(173,255,47,0.25)] text-[#ADFF2F] border-[#ADFF2F] animate-pulse"
                      : "bg-[#0D1A0F] text-[rgba(173,255,47,0.5)] border-[rgba(173,255,47,0.22)] hover:border-[rgba(173,255,47,0.4)] hover:text-[#ADFF2F]",
                ].join(" ")}
                style={{
                  width:     nodeSize,
                  height:    nodeSize,
                  boxShadow: isActive
                    ? "0 0 20px rgba(173,255,47,0.5), 0 0 40px rgba(173,255,47,0.2)"
                    : isRelated
                      ? "0 0 12px rgba(173,255,47,0.3)"
                      : "0 2px 12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(173,255,47,0.06)",
                }}
              >
                <Icon size={nodeIconSize} />
              </div>

              {/* Label */}
              <div
                className={[
                  "absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold tracking-wider transition-all duration-300",
                  isActive ? "text-[#ADFF2F] scale-110" : "text-white/60",
                ].join(" ")}
                style={{ top: labelTopOffset }}
              >
                {item.title}
              </div>

              {/* Card — only appears after snap completes */}
              {isExpanded && (
                <div className="absolute" style={{ top: cardTopOffset, left: "50%", transform: "translateX(-50%)", transformOrigin: "top center" }}>
                  <div style={{ animation: "orbPopIn 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards", transformOrigin: "top center" }}>
                    <Card className="w-64 bg-[rgba(10,16,11,0.95)] backdrop-blur-lg border-[rgba(173,255,47,0.3)] overflow-visible shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_0_1px_rgba(173,255,47,0.08)]">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[1.5px] h-3 bg-[#ADFF2F] opacity-60" />
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <Badge className={`px-2 text-xs ${statusStyle(item.status)}`}>{statusLabel(item.status)}</Badge>
                          <span className="text-xs font-mono text-white/40">{item.date}</span>
                        </div>
                        <CardTitle className="text-sm mt-2 text-[#E8EDF0]">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-white/75">
                        <p>{item.content}</p>
                        <div className="mt-4 pt-3 border-t border-white/10">
                          <div className="flex justify-between items-center text-xs mb-1.5">
                            <span className="flex items-center gap-1 text-white/50"><Zap size={10} /> Energy Level</span>
                            <span className="font-mono text-white/70">{item.energy}%</span>
                          </div>
                          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${item.energy}%`, background: "linear-gradient(90deg, #3B82F6, #A855F7, #ADFF2F)" }} />
                          </div>
                        </div>
                        {item.relatedIds.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-white/10">
                            <div className="flex items-center mb-2 gap-1">
                              <Link size={10} className="text-white/50" />
                              <h4 className="text-[10px] uppercase tracking-wider text-white/50">Connected Nodes</h4>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {item.relatedIds.map(relId => {
                                const rel = timelineData.find(i => i.id === relId);
                                return (
                                  <Button
                                    key={relId}
                                    variant="outline"
                                    size="sm"
                                    className="h-6 px-2 py-0 text-xs rounded-md border-[rgba(173,255,47,0.2)] bg-transparent hover:bg-[rgba(173,255,47,0.08)] text-white/70 hover:text-[#ADFF2F]"
                                    onClick={e => { e.stopPropagation(); toggleItem(relId); }}
                                  >
                                    {rel?.title}
                                    <ArrowRight size={8} className="ml-1" />
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
