import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "./AdminSidebar"
import { AdminAuthGuard } from "./AdminAuthGuard"
import { Button } from "@/components/ui/button"
import { HomeIcon, LogOut, User } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Link } from "react-router-dom"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, signOut } = useAuth()

  return (
    <AdminAuthGuard>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AdminSidebar />

          <div className="flex-1 flex flex-col">
            <header className="h-14 flex items-center justify-between border-b border-border bg-background px-4">
              <div className="flex items-center">
                {/* Mobile sidebar trigger */}
                <SidebarTrigger className="md:hidden mr-2" />
                <HomeIcon />
                <div className="ml-4">
                  <Link to={'/'} className="text-lg font-semibold">Back Home</Link>
                </div>
              </div>

              {/* Admin Profile Section */}
              <div className="flex items-center space-x-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 h-auto p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar_url} />
                        <AvatarFallback>
                          {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-sm font-medium">
                        {user?.name || user?.email?.split('@')[0]}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-0">
                    <div className="py-2">
                      <Link
                        to="/admin/profile"
                        className="flex items-center px-4 py-2 text-sm hover:bg-accent transition-colors"
                      >
                        <User className="h-4 w-4 mr-3" />
                        Profile
                      </Link>
                      <div className="border-t my-1"></div>
                      <button
                        onClick={signOut}
                        className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent transition-colors text-red-600"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </header>

            <main className="flex-1 p-6 bg-muted/20">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AdminAuthGuard>
  )
}