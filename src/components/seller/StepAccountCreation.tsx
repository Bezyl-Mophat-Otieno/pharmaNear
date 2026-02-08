import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, User, Mail, Lock, Loader2 } from 'lucide-react';
import { sellerService } from '@/services/sellerService';
import { useToast } from '@/hooks/use-toast';
import { OnboardingData } from '@/pages/tenant/TenantOnboarding';
interface Props {
    data: OnboardingData;
    updateData: (d: Partial<OnboardingData>) => void;
    onNext: () => void;
}
const StepAccountCreation = ({ data, updateData, onNext }: Props) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const validate = () => {
        const errs: Record<string, string> = {};
        if (!data.firstName.trim()) errs.firstName = 'First name is required';
        if (!data.lastName.trim()) errs.lastName = 'Last name is required';
        if (!data.email.trim()) errs.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = 'Invalid email';
        if (!data.password) errs.password = 'Password is required';
        else if (data.password.length < 6) errs.password = 'Minimum 6 characters';
        if (data.password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };
    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const res = await sellerService.register({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: data.password,
            });
            if (res.success) {
                updateData({ userId: (res.data as any)?.id });
                toast({ title: 'Account created!', description: 'A verification email has been sent.' });
                onNext();
            } else {
                toast({ title: 'Registration failed', description: res.message, variant: 'destructive' });
            }
        } catch {
            // error handled by interceptor
        } finally {
            setLoading(false);
        }
    };
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Create Your Account
                </CardTitle>
                <CardDescription>
                    This account will be used to manage your business on the platform.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                            id="firstName"
                            value={data.firstName}
                            onChange={e => updateData({ firstName: e.target.value })}
                            placeholder="John"
                        />
                        {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                            id="lastName"
                            value={data.lastName}
                            onChange={e => updateData({ lastName: e.target.value })}
                            placeholder="Doe"
                        />
                        {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={e => updateData({ email: e.target.value })}
                            placeholder="you@business.com"
                            className="pl-10"
                        />
                    </div>
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={e => updateData({ password: e.target.value })}
                            placeholder="••••••••"
                            className="pl-10"
                        />
                    </div>
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="pl-10"
                        />
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                </div>
                <Button onClick={handleSubmit} disabled={loading} className="w-full mt-2">
                    {loading ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating Account...</>
                    ) : (
                        <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
};
export default StepAccountCreation;