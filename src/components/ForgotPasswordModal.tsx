import { useState } from "react"
import { Mail, ArrowLeft } from "lucide-react"
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
import { authService } from "@/services/authService"

interface ForgotPasswordModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onBack?: () => void
}

export function ForgotPasswordModal({ open, onOpenChange, onBack }: ForgotPasswordModalProps) {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const response = await authService.forgotPassword(email)
            if (response.success) {
                setSubmitted(true)
            } else {
                toast({
                    title: "Error",
                    description: response.message,
                    variant: "destructive",
                })
            }
        } catch {
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = (open: boolean) => {
        if (!open) {
            setEmail("")
            setSubmitted(false)
        }
        onOpenChange(open)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Forgot Password</DialogTitle>
                    <DialogDescription>
                        {submitted
                            ? "Check your inbox for the reset link."
                            : "Enter your email and we'll send you a password reset link."}
                    </DialogDescription>
                </DialogHeader>

                {submitted ? (
                    <div className="space-y-4">
                        <div className="flex flex-col items-center gap-3 py-4 text-center">
                            <div className="rounded-full bg-green-100 p-3">
                                <Mail className="h-6 w-6 text-green-600" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                If <span className="font-medium text-foreground">{email}</span> is registered, you'll receive a reset link shortly.
                            </p>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => handleClose(false)}>
                            Close
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="forgot-email">Email</Label>
                            <Input
                                id="forgot-email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Sending..." : "Send Reset Link"}
                        </Button>

                        {onBack && (
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full"
                                onClick={onBack}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to login
                            </Button>
                        )}
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
