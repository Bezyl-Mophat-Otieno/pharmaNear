import { useState } from "react"
import { CheckCircle, Eye, EyeOff } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { authService, User } from "@/services/authService"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

interface AdminLoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminLoginModal({ open, onOpenChange }: AdminLoginModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await authService.adminLogin({ email, password })
      let loggedInUser: User | null = null
      if (response.success) {
        loggedInUser = response.data as User
        signIn(loggedInUser)
        toast({
          title: "Login Successful",
          description: response.message,
        })
      }
      onOpenChange(false)
      if (loggedInUser?.role === 'tenant') {
        navigate('/tenant', { replace: true })
        return
      }
      navigate('/admin', { replace: true })

    } catch (error) {
      console.error("Login failed:", error)

    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Admin Login</DialogTitle>
          <DialogDescription>
            Enter your admin credentials to access the dashboard
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@shamsy.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ?
              <>
                <CheckCircle className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
              : "Sign in"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}