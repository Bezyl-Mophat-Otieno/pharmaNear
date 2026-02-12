import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { authService } from "@/services/authService"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Key } from "lucide-react"

interface PasswordChangeForm {
    oldPassword: string
    newPassword: string
    confirmPassword: string
}

export default function sellerProfile() {
    const [showPasswordDialog, setShowPasswordDialog] = useState(false)
    const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false })

    const [passwordForm, setPasswordForm] = useState<PasswordChangeForm>({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    })


    const { user } = useAuth()
    const { toast } = useToast()



    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast({
                title: "Error",
                description: "New passwords do not match",
                variant: "destructive"
            })
            return
        }

        try {
            const response = await authService.resetPassword(user.email, passwordForm.newPassword)
            if (!response.success) {
                toast({
                    title: "Error",
                    description: response.message || "Failed to change password",
                    variant: "destructive"
                })
                return
            }
            setShowPasswordDialog(false)
            setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
            toast({
                title: "Success",
                description: "Password changed successfully"
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Network error occurred",
                variant: "destructive"
            })
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">seller Profile</h1>
                <p className="text-muted-foreground">Manage your profile and admin accounts</p>
            </div>

            {/* Current seller Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Profile</CardTitle>
                    <CardDescription>Current seller account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Email</Label>
                            <div className="text-sm text-muted-foreground">{user?.email}</div>
                        </div>
                        <div>
                            <Label>Name</Label>
                            <div className="text-sm text-muted-foreground">{user?.name}</div>
                        </div>
                    </div>

                    <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-fit">
                                <Key className="h-4 w-4 mr-2" />
                                Change Password
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Change Password</DialogTitle>
                                <DialogDescription>
                                    Enter your current password and choose a new one
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="oldPassword">Current Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="oldPassword"
                                            type={showPasswords.old ? "text" : "password"}
                                            value={passwordForm.oldPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3"
                                            onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                                        >
                                            {showPasswords.old ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="newPassword"
                                            type={showPasswords.new ? "text" : "password"}
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3"
                                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                        >
                                            {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showPasswords.confirm ? "text" : "password"}
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3"
                                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                        >
                                            {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <Button type="button" variant="outline" onClick={() => setShowPasswordDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">Change Password</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>

        </div>
    )

}