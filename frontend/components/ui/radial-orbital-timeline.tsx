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

export default function RadialOrbitalTimeline({ timelineData }: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems]   = useState<Record<number, boolean>>({});
  const [pulseEffect, setPulseEffect]       = useState<Record<number, boolean>>({});
  const [activeNodeId, setActiveNodeId]     = useState<number | null>(null);
  const [autoRotate, setAutoRotate]         = useState(true);
  const rotationRef                         = useRef(0);
  const rafRef                              = useRef<number | undefined>(undefined);
  const lastTimeRef                         = useRef<number | null>(null);
  const containerRef                        = useRef<HTMLDivElement>(null);
  const orbitRef                            = useRef<HTMLDivElement>(null);
  const nodeRefs                            = useRef<Record<number, HTMLDivElement | null>>({});
  // Force re-render each frame
  const [tick, setTick]                     = useState(0);

  // requestAnimationFrame loop — 6 deg/s (60s full rotation)
  const animate = useCallback((ts: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = ts;
    const dt = (ts - lastTimeRef.current) / 1000;
    lastTimeRef.current = ts;
    rotationRef.current = (rotationRef.current + dt * 6) % 360;
    setTick(t => t + 1);
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (autoRotate) {
      lastTimeRef.current = null;
      rafRef.current = requestAnimationFrame(animate);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [autoRotate, animate]);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const toggleItem = (id: number) => {
    setExpandedItems(prev => {
      const next: Record<number, boolean> = {};
      Object.keys(prev).forEach(k => { next[parseInt(k)] = false; });
      const opening = !prev[id];
      next[id] = opening;
      if (opening) {
        setActiveNodeId(id);
        setAutoRotate(false);
        const related = timelineData.find(i => i.id === id)?.relatedIds ?? [];
        const pulse: Record<number, boolean> = {};
        related.forEach(r => { pulse[r] = true; });
        setPulseEffect(pulse);
        // Snap orbit so clicked node sits at top (270°)
        const nodeIndex = timelineData.findIndex(i => i.id === id);
        const targetAngle = (nodeIndex / timelineData.length) * 360;
        rotationRef.current = (270 - targetAngle + 360) % 360;
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }
      return next;
    });
  };

  const calcPos = (index: number) => {
    const angle  = ((index / timelineData.length) * 360 + rotationRef.current) % 360;
    const rad    = (angle * Math.PI) / 180;
    const radius = 210;
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

  return (
    <div
      ref={containerRef}
      className="w-full h-screen flex flex-col items-center justify-center overflow-hidden relative"
      onClick={handleContainerClick}
      style={{ background: "#070B0E" }}
    >
      {/* ── Background layers ───────────────────────────────── */}

      {/* Deep radial bloom — lime center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(173,255,47,0.07) 0%, rgba(173,255,47,0.02) 40%, transparent 70%)",
        }}
      />
      {/* Secondary purple nebula drift */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 40% 30% at 70% 30%, rgba(139,92,246,0.06) 0%, transparent 60%)",
        }}
      />
      {/* Subtle dot-grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.18]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Edge vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 55%, rgba(7,11,14,0.85) 100%)",
        }}
      />

      {/* ── Orbit ring + concentric decorative rings ─────── */}
      <div className="absolute flex items-center justify-center pointer-events-none" style={{ width: 480, height: 480 }}>
        {/* Outer faint ring */}
        <div className="absolute rounded-full" style={{ width: 460, height: 460, border: "1px solid rgba(255,255,255,0.04)" }} />
        {/* Main orbit ring */}
        <div className="absolute rounded-full" style={{ width: 420, height: 420, border: "1px solid rgba(173,255,47,0.12)" }} />
        {/* Inner accent ring */}
        <div className="absolute rounded-full" style={{ width: 360, height: 360, border: "1px dashed rgba(173,255,47,0.06)" }} />
        {/* Inner halo */}
        <div className="absolute rounded-full" style={{ width: 160, height: 160, border: "1px solid rgba(255,255,255,0.05)" }} />
      </div>

      <div
        ref={orbitRef}
        className="relative flex items-center justify-center"
        style={{ width: 480, height: 480 }}
      >
        {/* ── Central orb ─────────────────────────────────── */}
        <div className="absolute flex items-center justify-center z-10" style={{ width: 72, height: 72 }}>
          {/* Outer glow rings */}
          <div className="absolute rounded-full animate-ping opacity-30" style={{ width: 88,  height: 88,  border: "1px solid rgba(173,255,47,0.5)", animationDuration: "2.2s" }} />
          <div className="absolute rounded-full animate-ping opacity-20" style={{ width: 108, height: 108, border: "1px solid rgba(173,255,47,0.3)", animationDuration: "2.8s", animationDelay: "0.6s" }} />
          {/* Orb body */}
          <div
            className="absolute rounded-full"
            style={{
              width: 72, height: 72,
              background: "radial-gradient(circle at 35% 30%, #C8FF52, #ADFF2F 45%, #3D6600)",
              boxShadow: "0 0 30px rgba(173,255,47,0.45), 0 0 60px rgba(173,255,47,0.18)",
            }}
          />
          {/* Specular */}
          <div className="absolute rounded-full bg-white/40" style={{ width: 18, height: 18, top: 14, left: 18 }} />
        </div>

        {/* ── Orbital nodes ───────────────────────────────── */}
        {timelineData.map((item, index) => {
          const pos        = calcPos(index);
          const isExpanded = expandedItems[item.id];
          const isRelated  = isRelatedToActive(item.id);
          const isPulsing  = pulseEffect[item.id];
          const Icon       = item.icon;

          return (
            <div
              key={item.id}
              ref={el => { nodeRefs.current[item.id] = el; }}
              className="absolute transition-[opacity] duration-200 cursor-pointer"
              style={{
                transform:  `translate(${pos.x}px, ${pos.y}px)`,
                zIndex:     isExpanded ? 200 : pos.zIndex,
                opacity:    isExpanded ? 1 : pos.opacity,
              }}
              onClick={e => { e.stopPropagation(); toggleItem(item.id); }}
            >
              {/* Energy aura */}
              <div
                className={`absolute rounded-full ${isPulsing ? "animate-pulse" : ""}`}
                style={{
                  width:      `${item.energy * 0.55 + 60}px`,
                  height:     `${item.energy * 0.55 + 60}px`,
                  left:       `-${(item.energy * 0.55 + 60 - 56) / 2}px`,
                  top:        `-${(item.energy * 0.55 + 60 - 56) / 2}px`,
                  background: "radial-gradient(circle, rgba(173,255,47,0.12) 0%, transparent 70%)",
                }}
              />

              {/* Node circle — bigger: 56×56 */}
              <div
                className={[
                  "flex items-center justify-center rounded-full border-2 transition-all duration-300",
                  "shadow-lg",
                  isExpanded
                    ? "bg-[#ADFF2F] text-black border-[#ADFF2F] scale-[1.35]"
                    : isRelated
                      ? "bg-[rgba(173,255,47,0.25)] text-[#ADFF2F] border-[#ADFF2F] animate-pulse"
                      : "bg-[#0D1A0F] text-[rgba(173,255,47,0.5)] border-[rgba(173,255,47,0.22)] hover:border-[rgba(173,255,47,0.4)] hover:text-[#ADFF2F]",
                ].join(" ")}
                style={{
                  width:      56,
                  height:     56,
                  boxShadow:  isExpanded
                    ? "0 0 20px rgba(173,255,47,0.5), 0 0 40px rgba(173,255,47,0.2)"
                    : isRelated
                      ? "0 0 12px rgba(173,255,47,0.3)"
                      : "0 2px 12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(173,255,47,0.06)",
                }}
              >
                <Icon size={20} />
              </div>

              {/* Label */}
              <div
                className={[
                  "absolute top-16 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold tracking-wider transition-all duration-300",
                  isExpanded ? "text-[#ADFF2F] scale-110" : "text-white/60",
                ].join(" ")}
              >
                {item.title}
              </div>

              {/* Expanded card */}
              {isExpanded && (
                <div
                  style={{
                    animation: "orbPopIn 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards",
                    transformOrigin: "top center",
                  }}
                >
                <Card className="absolute top-[76px] left-1/2 -translate-x-1/2 w-64 bg-[rgba(10,16,11,0.95)] backdrop-blur-lg border-[rgba(173,255,47,0.3)] overflow-visible shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_0_1px_rgba(173,255,47,0.08)]">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[1.5px] h-3 bg-[#ADFF2F] opacity-60" />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <Badge className={`px-2 text-xs ${statusStyle(item.status)}`}>
                        {statusLabel(item.status)}
                      </Badge>
                      <span className="text-xs font-mono text-white/40">{item.date}</span>
                    </div>
                    <CardTitle className="text-sm mt-2 text-[#E8EDF0]">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-white/75">
                    <p>{item.content}</p>
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="flex items-center gap-1 text-white/50">
                          <Zap size={10} /> Energy Level
                        </span>
                        <span className="font-mono text-white/70">{item.energy}%</span>
                      </div>
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${item.energy}%`,
                            background: "linear-gradient(90deg, #3B82F6, #A855F7, #ADFF2F)",
                          }}
                        />
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
