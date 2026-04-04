import {
    ShoppingCart,
    Package,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Share2,
    Copy,
    Check,
    ExternalLink,
    Store,
} from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAdminProducts, useAdminOrders, useAdminTransactions, useAdminCategories } from "@/hooks/useAdminData"
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useMemo, useState, useEffect } from 'react'
import { useAuth } from "@/contexts/AuthContext"
import api from "@/lib/api"


export default function SellerDashboard() {
    const { products, loading: productsLoading } = useAdminProducts();
    const { orders, loading: ordersLoading } = useAdminOrders();
    const { stats, loading: transactionsLoading } = useAdminTransactions();
    const { categories, loading: categoriesLoading } = useAdminCategories();
    const { user } = useAuth();

    const [businessSlug, setBusinessSlug] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!user?.user_id) return;
        api.get(`/sellers/my-business`).then(res => {
            const biz = res.data?.data;
            if (biz?.business_name) {
                setBusinessSlug(biz.business_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
            }
        }).catch(() => { });
    }, [user]);

    const storefrontUrl = businessSlug
        ? `${window.location.origin}/shop/${businessSlug}`
        : null;

    const handleCopy = () => {
        if (!storefrontUrl) return;
        navigator.clipboard.writeText(storefrontUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const loading = productsLoading || ordersLoading || transactionsLoading || categoriesLoading;

    // Transform orders data into monthly aggregations
    const ordersOverTime = useMemo(() => {
        if (!orders || orders.length === 0) {
            return [
                { month: 'Jan', orders: 0 },
                { month: 'Feb', orders: 0 },
                { month: 'Mar', orders: 0 },
                { month: 'Apr', orders: 0 },
                { month: 'May', orders: 0 },
                { month: 'Jun', orders: 0 },
            ];
        }

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();
        const monthlyData: { [key: string]: number } = {};

        // Initialize all months with 0
        monthNames.forEach(month => {
            monthlyData[month] = 0;
        });

        // Count orders by month
        orders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            if (orderDate.getFullYear() === currentYear) {
                const monthName = monthNames[orderDate.getMonth()];
                monthlyData[monthName]++;
            }
        });

        return monthNames.map(month => ({
            month,
            orders: monthlyData[month]
        }));
    }, [orders]);

    // Transform categories data for pie chart
    const categoryData = useMemo(() => {
        if (!categories || categories.length === 0 || !products || products.length === 0) {
            return [
                { name: 'No Categories', value: 100, color: '#8884D8' }
            ];
        }

        const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];
        const categoryStats: { [key: string]: number } = {};

        // Count products by category
        products.forEach(product => {
            const categoryName = product.category_name || 'Uncategorized';
            categoryStats[categoryName] = (categoryStats[categoryName] || 0) + 1;
        });

        // Convert to pie chart format
        const totalProducts = products.length;
        return Object.entries(categoryStats)
            .map(([name, count], index) => ({
                name,
                value: Math.round((count / totalProducts) * 100),
                color: colors[index % colors.length]
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6); // Show top 6 categories
    }, [categories, products]);

    // Calculate dynamic stats based on real data
    const statsData = [
        {
            title: "Total Orders",
            value: orders?.length?.toString() || "0",
            change: "+12.5%",
            trend: "up",
            icon: ShoppingCart,
            color: "text-blue-600"
        },
        {
            title: "Total Products",
            value: products?.length?.toString() || "0",
            change: "+8.2%",
            trend: "up",
            icon: Package,
            color: "text-green-600"
        },
        {
            title: "Total Revenue",
            value: `KES ${stats?.total_revenue?.toLocaleString() || '0'}`,
            change: "+15.3%",
            trend: "up",
            icon: TrendingUp,
            color: "text-purple-600"
        },
        {
            title: "Total Profit",
            value: `KES ${stats?.total_profit?.toLocaleString() || '0'}`,
            change: "+18.7%",
            trend: "up",
            icon: TrendingUp,
            color: "text-emerald-600"
        },
        {
            title: "Profit Margin",
            value: stats?.total_revenue ? `${((Number(stats.total_profit) / Number(stats.total_revenue)) * 100).toFixed(1)}%` : "0%",
            change: "+2.3%",
            trend: "up",
            icon: Package,
            color: "text-indigo-600"
        }
    ];

    // Calculate recent orders from API data
    const recentOrders = orders?.slice(0, 5)?.map(order => ({
        id: order.orderId,
        customer: order.customerInfo?.name || 'Unknown',
        amount: `KES ${order.total?.toLocaleString() || '0'}`,
        status: order.status,
        date: new Date(order.createdAt).toLocaleDateString()
    })) || [];

    // Calculate recent products from API data
    const recentProducts = products?.slice(0, 4)?.map(product => ({
        name: product.name,
        category: product.category_name,
        price: `KES ${product.selling_price?.toLocaleString() || '0'}`,
        stock: product.stock || 0
    })) || [];

    const getStatusBadge = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            completed: "default",
            pending: "secondary",
            processing: "outline",
            shipped: "default",
            delivered: "default"
        }
        return <Badge variant={variants[status] || "outline"}>{status}</Badge>
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                    <p className="text-muted-foreground">Monitor your e-commerce platform performance</p>
                </div>
                <div className="h-96 flex items-center justify-center">
                    <LoadingSpinner size="lg" text="Loading dashboard..." />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                <p className="text-muted-foreground">Monitor your e-commerce platform performance</p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {statsData.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <div className="flex items-center text-xs text-muted-foreground">
                                    {stat.trend === "up" ? (
                                        <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                                    ) : (
                                        <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                                    )}
                                    {stat.change} from last month
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* ── Share Your Store ── */}
            {storefrontUrl && (
                <Card className="border-2 border-primary/30 bg-primary/5">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Share2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Store className="h-4 w-4" />
                                    Your Store Link
                                </CardTitle>
                                <CardDescription>
                                    Share this link with your customers so they can browse and order your products directly — no account needed on their end.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Input
                                readOnly
                                value={storefrontUrl}
                                className="font-mono text-sm bg-background"
                                onClick={e => (e.target as HTMLInputElement).select()}
                            />
                            <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant="default"
                                size="icon"
                                className="shrink-0"
                                onClick={() => window.open(storefrontUrl, '_blank')}
                            >
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Customers who open this link will see only your products, sorted by price. They can add items to cart and checkout without creating an account.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Orders Over Time
                        </CardTitle>
                        <CardDescription>Monthly order trends</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={ordersOverTime}>
                                <defs>
                                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="orders"
                                    stroke="hsl(var(--primary))"
                                    fillOpacity={1}
                                    fill="url(#colorOrders)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Categories by Sales</CardTitle>
                        <CardDescription>Product category distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity Section */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>Latest customer orders</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentOrders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">{order.id}</TableCell>
                                        <TableCell>{order.customer}</TableCell>
                                        <TableCell>{order.amount}</TableCell>
                                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recently Added Products</CardTitle>
                        <CardDescription>Latest products in inventory</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentProducts.map((product, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>{product.category}</TableCell>
                                        <TableCell>{product.price}</TableCell>
                                        <TableCell>{product.stock}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}