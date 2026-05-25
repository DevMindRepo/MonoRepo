import { Sidebar } from "@/components/app/sidebar"
import { Topbar } from "@/components/app/topbar"
import { AuthGuard } from "@/components/app/auth-guard"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireWorkspace>
      <div className="flex h-screen overflow-hidden bg-[#070B0E]">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
