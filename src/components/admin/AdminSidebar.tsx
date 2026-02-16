import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Boxes,
  CreditCard,
  Settings,
  LogOut,
  Building2
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

const adminMenuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Business Management", url: "/admin/business-management", icon: Building2 },
  { title: "Profile", url: "/admin/profile", icon: Settings },
]

export function AdminSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const { signOut, user } = useAuth()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"

  const isActive = (path: string) => {
    if (path === "/admin") {
      return currentPath === "/admin"
    }
    return currentPath.startsWith(path)
  }

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted/50"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border">
        {!collapsed && (
          <div className="p-4">
            <h2 className="text-lg font-semibold text-primary">{user.role === "seller" ? "PharmNear Business Admin" : "Admin"}</h2>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className={({ isActive }) => getNavCls({ isActive })}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className={collapsed ? "hidden" : "block"}>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        {!collapsed && user && (
          <div className="p-4 space-y-2">
            <div className="text-sm">
              <p className="font-medium">{user.name}</p>
              <p className="text-muted-foreground text-xs">{user.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}
        {collapsed && user && (
          <div className="p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="w-full p-2"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}