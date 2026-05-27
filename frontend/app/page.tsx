import { Navbar } from "@/components/app/navbar"
import { TopShaderBg } from "@/components/app/top-shader-bg"
import { HeroSection } from "@/components/app/sections/hero"
import { ProblemSection } from "@/components/app/sections/problem"
import { HowItWorksSection } from "@/components/app/sections/how-it-works"
import { AgentDemoSection } from "@/components/app/sections/agent-demo"
import { AgentOrbitalSection } from "@/components/app/sections/agent-orbital"
import { ShipSection } from "@/components/app/sections/ship"
import { ArchitectureSection } from "@/components/app/sections/architecture"
import { CodeSection } from "@/components/app/sections/code"
import { EcosystemSection } from "@/components/app/sections/ecosystem"
import { FaqSection } from "@/components/app/sections/faq"
import { FooterSection } from "@/components/app/sections/footer"

export default function LandingPage() {
  return (
    <main className="relative bg-[#070B0E] text-[#E8EDF0] overflow-x-hidden">
      <TopShaderBg />
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <AgentDemoSection />
      <AgentOrbitalSection />
      <ShipSection />
      <ArchitectureSection />
      <CodeSection />
      <EcosystemSection />
      <FaqSection />
      <FooterSection />
    </main>
  )
}
