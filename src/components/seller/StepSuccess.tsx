import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Clock, LogIn } from 'lucide-react';
const StepSuccess = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center px-4">
            <Card className="max-w-md w-full">
                <CardContent className="pt-8 pb-6 text-center space-y-6">
                    {/* Animated check */}
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-fade-in">
                        <CheckCircle2 className="h-10 w-10 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold">Registration Submitted!</h2>
                        <p className="text-sm text-muted-foreground">
                            Your business registration has been submitted successfully and is now under review.
                        </p>
                    </div>
                    {/* Status info */}
                    <div className="p-4 rounded-lg bg-muted/50 space-y-3 text-left">
                        <div className="flex items-start gap-3">
                            <Clock className="h-4 w-4 text-secondary mt-0.5" />
                            <div>
                                <p className="text-sm font-medium">Pending Approval</p>
                                <p className="text-xs text-muted-foreground">
                                    Our team will review your documents and business details. You'll be notified once approved.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <LogIn className="h-4 w-4 text-primary mt-0.5" />
                            <div>
                                <p className="text-sm font-medium">You can log in now</p>
                                <p className="text-xs text-muted-foreground">
                                    Access your account to check approval status. Selling features will be available after approval.
                                </p>
                            </div>
                        </div>
                    </div>
                    <Button className="w-full" size="lg" onClick={() => navigate('/admin/login')}>
                        <LogIn className="h-4 w-4 mr-2" />
                        Go to Login
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};
export default StepSuccess;