import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Eye, EyeOff, Plus, Edit, Trash2, Key } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { authService, User } from "@/services/authService"
import { RoleEnum } from "@/types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface PasswordChangeForm {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

interface AdminForm {
  email: string
  password: string
  confirmPassword: string
  name: string
  useDefaultPassword: boolean
}

export default function AdminProfile() {
  const [admins, setAdmins] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false })

  const [passwordForm, setPasswordForm] = useState<PasswordChangeForm>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [adminForm, setAdminForm] = useState<AdminForm>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    useDefaultPassword: false
  })

  const { user } = useAuth()
  const { toast } = useToast()

  const isAdmin = user?.role === RoleEnum.ADMIN

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setAdminForm({ ...adminForm, password, confirmPassword: password })
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const response = await authService.fetchAllAdmins()
      const admins = response.data as User[]
      setAdmins(admins)
    } catch (error) {

      console.error('Error fetching admins:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Only validate passwords if not using default password
    if (!adminForm.useDefaultPassword && adminForm.password !== adminForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      })
      return
    }

    const payload = {
      email: adminForm.email,
      name: adminForm.name,
      password: adminForm.useDefaultPassword ? 'admin123' : adminForm.password
    }

    const response = await authService.registerUser(payload, 'admin')

    if (response.success) {
      toast({
        title: "Success",
        description: `Admin created successfully. Use ${payload.password} as the default password.`,
      })
      setShowCreateDialog(false)
      setAdminForm({ email: '', password: '', confirmPassword: '', name: '', useDefaultPassword: false })
      fetchAdmins()
    } else {
      toast({
        title: "Error",
        description: response.message || "Failed to create admin",
        variant: "destructive"
      })
    }
  }

  const handleDeleteAdmin = async (userId: string) => {
    const response = await authService.deleteUser(userId)
    if (response.success) {
      toast({
        title: "Success",
        description: "Admin deleted successfully"
      })
      fetchAdmins()
    } else {
      toast({
        title: "Error",
        description: response.message || "Failed to delete admin",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="p-6 h-96 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Profile</h1>
        <p className="text-muted-foreground">Manage your profile and admin accounts</p>
      </div>

      {/* Current Admin Info */}
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Current admin account information</CardDescription>
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

      {/* Admin Management */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Manage Admin Accounts</CardTitle>
                <CardDescription>Create, edit, and delete admin accounts</CardDescription>
              </div>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Admin
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Admin</DialogTitle>
                    <DialogDescription>
                      Add a new administrator to the system
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateAdmin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={adminForm.name}
                        onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={adminForm.email}
                        onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="useDefaultPassword"
                          checked={adminForm.useDefaultPassword}
                          onCheckedChange={(checked) => setAdminForm({
                            ...adminForm,
                            useDefaultPassword: checked,
                            password: checked ? '' : adminForm.password,
                            confirmPassword: checked ? '' : adminForm.confirmPassword
                          })}
                        />
                        <Label htmlFor="useDefaultPassword">Use default password (admin123)</Label>
                      </div>
                      {!adminForm.useDefaultPassword && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={generateRandomPassword}
                        >
                          Generate Random
                        </Button>
                      )}
                    </div>

                    {!adminForm.useDefaultPassword && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={adminForm.password}
                            onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={adminForm.confirmPassword}
                            onChange={(e) => setAdminForm({ ...adminForm, confirmPassword: e.target.value })}
                            required
                          />
                        </div>
                      </>
                    )}

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Create Admin</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Badge variant={admin.role === RoleEnum.ADMIN ? "default" : "secondary"}>
                        {admin.role === RoleEnum.ADMIN ? "Admin" : "Super Admin"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {admin.id !== user?.id && (
                        <div className="flex space-x-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Admin</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {admin.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteAdmin(admin.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}