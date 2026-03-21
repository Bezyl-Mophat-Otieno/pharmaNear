import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/services/authService"

export default function ResetPassword() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get("token")
    const navigate = useNavigate()
    const { toast } = useToast()

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [done, setDone] = useState(false)

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="pt-8 pb-6 space-y-4">
                        <XCircle className="mx-auto h-12 w-12 text-destructive" />
                        <p className="text-lg font-medium">Invalid reset link</p>
                        <p className="text-sm text-muted-foreground">This link is missing a token. Please request a new password reset.</p>
                        <Button onClick={() => navigate("/seller/login")}>Back to Login</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            toast({ title: "Passwords don't match", variant: "destructive" })
            return
        }
        if (password.length < 8) {
            toast({ title: "Password must be at least 8 characters", variant: "destructive" })
            return
        }

        setIsLoading(true)
        try {
            const response = await authService.resetPasswordWithToken(token, password)
            if (response.success) {
                setDone(true)
            } else {
                toast({ title: "Error", description: response.message, variant: "destructive" })
            }
        } catch {
            toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-2">
                        <img src="/images/logos/pharmaNear.png" alt="PharmaNear" className="w-full h-full object-cover" />
                    </div>
                    <CardTitle className="text-2xl">Reset Password</CardTitle>
                    <CardDescription>
                        {done ? "Your password has been updated." : "Enter your new password below."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {done ? (
                        <div className="space-y-4 text-center">
                            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                            <p className="text-sm text-muted-foreground">You can now log in with your new password.</p>
                            <Button className="w-full" onClick={() => navigate("/seller/login")}>
                                Go to Login
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="new-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min. 8 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirm-password"
                                        type={showConfirm ? "text" : "password"}
                                        placeholder="Repeat your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                    >
                                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Resetting..." : "Reset Password"}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
