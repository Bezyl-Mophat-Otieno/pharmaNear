import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Store, ArrowRight, TrendingUp, Eye, ShoppingBag } from 'lucide-react';
const SellerCallout = () => {
    const navigate = useNavigate();
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto">
                <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 overflow-hidden">
                    <CardContent className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            {/* Icon */}
                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                <Store className="h-8 w-8 text-primary" />
                            </div>
                            {/* Content */}
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-lg font-semibold mb-1">
                                    Are you a pharmacy or medical supplier?
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Join our platform to reach more customers, increase your visibility, and manage orders effortlessly.
                                </p>
                                {/* Benefits */}
                                <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Eye className="h-3.5 w-3.5 text-primary" />
                                        <span>Increased visibility</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <TrendingUp className="h-3.5 w-3.5 text-primary" />
                                        <span>Grow your reach</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                                        <span>Manage orders easily</span>
                                    </div>
                                </div>
                            </div>
                            {/* CTA */}
                            <Button
                                size="lg"
                                className="shrink-0 rounded-full px-6"
                                onClick={() => navigate('/seller/onboard')}
                            >
                                Start Selling
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
export default SellerCallout;