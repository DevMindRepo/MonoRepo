import { Sidebar } from "@/components/app/sidebar"
import { Topbar } from "@/components/app/topbar"
import { AuthGuard } from "@/components/app/auth-guard"
import { PremiumDashboardBackground } from "@/components/ui/premium-dashboard-background"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireWorkspace>
      <PremiumDashboardBackground />
      <div className="relative flex h-screen overflow-hidden" style={{ zIndex: 1 }}>
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-5 pb-20 md:pb-5">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
