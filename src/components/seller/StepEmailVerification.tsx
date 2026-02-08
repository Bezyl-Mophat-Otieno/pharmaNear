import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Mail, RefreshCw } from 'lucide-react';
import { sellerService } from '@/services/sellerService';
import { useToast } from '@/hooks/use-toast';
interface Props {
    email: string;
    onNext: () => void;
    onBack: () => void;
}
const StepEmailVerification = ({ email, onNext, onBack }: Props) => {
    const { toast } = useToast();
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState('');
    const handleVerify = async () => {
        if (!token.trim()) {
            setError('Please enter the verification token');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await sellerService.verifyEmail(email, token.trim());
            if (res.success) {
                setVerified(true);
                toast({ title: 'Email verified!', description: 'Your email has been confirmed.' });
                setTimeout(onNext, 1500);
            } else {
                setError(res.message || 'Verification failed. Please check your token.');
            }
        } catch {
            setError('Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    const handleResend = async () => {
        setResending(true);
        try {
            await sellerService.resendVerification(email);
            toast({ title: 'Token resent', description: `A new verification token was sent to ${email}.` });
        } catch {
            // handled by interceptor
        } finally {
            setResending(false);
        }
    };
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Verify Your Email
                </CardTitle>
                <CardDescription>
                    We've sent a verification token to <span className="font-medium text-foreground">{email}</span>.
                    Please check your inbox and enter the token below.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                {verified ? (
                    <div className="flex flex-col items-center py-8 gap-3 animate-fade-in">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-primary animate-bounce" />
                        </div>
                        <p className="font-medium text-primary">Email Verified Successfully!</p>
                        <p className="text-sm text-muted-foreground">Proceeding to the next step...</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="token">Verification Token</Label>
                            <Input
                                id="token"
                                value={token}
                                onChange={e => { setToken(e.target.value); setError(''); }}
                                placeholder="Enter the token from your email"
                                className="text-center tracking-widest text-lg"
                            />
                            {error && <p className="text-xs text-destructive">{error}</p>}
                        </div>
                        <Button onClick={handleVerify} disabled={loading} className="w-full">
                            {loading ? (
                                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Verifying...</>
                            ) : (
                                <>Verify Email <ArrowRight className="ml-2 h-4 w-4" /></>
                            )}
                        </Button>
                        <div className="flex items-center justify-between pt-2">
                            <Button variant="ghost" size="sm" onClick={onBack}>
                                <ArrowLeft className="h-4 w-4 mr-1" /> Back
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleResend} disabled={resending}>
                                {resending ? (
                                    <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Resending...</>
                                ) : (
                                    <><RefreshCw className="h-3 w-3 mr-1" /> Resend Token</>
                                )}
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};
export default StepEmailVerification;