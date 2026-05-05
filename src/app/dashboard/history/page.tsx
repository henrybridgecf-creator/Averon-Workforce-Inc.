

'use client';
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { History, ArrowUpRight, ArrowDownLeft, Gavel, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const totalEarnings = 300900;
const refunds = [
    { description: "Activation Refund", amount: 1100 },
    { description: "Payment Refunds", amount: 5800 },
    { description: "CafeLink Interface Donation Refund", amount: 550 },
    { description: "Donation Refund", amount: 23 },
    { description: "ID Shipping Fee Refund", amount: 250 },
];

const totalRefunds = refunds.reduce((acc, refund) => acc + refund.amount, 0);
const courtOrderedPayment = totalEarnings - totalRefunds;

const transactions = [
    ...refunds.map((refund, index) => ({
        id: `refund-${index}`,
        date: new Date(),
        description: refund.description,
        amount: refund.amount,
        type: 'credit' as const,
        status: 'Processed'
    })),
    {
        id: 'court-payment-01',
        date: new Date(),
        description: "Court-Ordered Compensation Payment",
        amount: courtOrderedPayment,
        type: 'credit' as const,
        status: 'Processed'
    },
    {
        id: 'withdrawal-01',
        date: new Date(Date.now() - 86400000), // yesterday
        description: "Funds Withdrawal to External Account",
        amount: 250.00,
        type: 'debit' as const,
        status: 'Pending'
    },
    {
        id: 'admin-fee-01',
        date: new Date(Date.now() - 172800000), // 2 days ago
        description: "Portal Administrative Maintenance Fee",
        amount: 15.50,
        type: 'debit' as const,
        status: 'Processed'
    }
].sort((a, b) => b.date.getTime() - a.date.getTime());

export default function HistoryPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const filteredTransactions = useMemo(() => {
        return transactions.filter(transaction => {
            const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = typeFilter === "all" || transaction.type === typeFilter;
            const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
            return matchesSearch && matchesType && matchesStatus;
        });
    }, [searchQuery, typeFilter, statusFilter]);

    const getTransactionIcon = (type: 'credit' | 'debit') => {
        if (type === 'credit') {
            return <ArrowUpRight className="h-4 w-4 text-green-500" />;
        }
        return <ArrowDownLeft className="h-4 w-4 text-red-500" />;
    };
    
    const getStatusBadge = (status: string) => {
        if (status === 'Processed') {
            return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">{status}</Badge>;
        }
        if (status === 'Pending') {
            return <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">{status}</Badge>;
        }
        return <Badge variant="destructive">{status}</Badge>;
    }


    return (
        <DashboardLayout>
            <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Transaction History</h2>
                </div>
                <p className="text-muted-foreground">A detailed record of your financial activities.</p>

                <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search description..." 
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-[140px]">
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="credit">Credits</SelectItem>
                                    <SelectItem value="debit">Debits</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-[140px]">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="Processed">Processed</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Account Ledger</CardTitle>
                        <CardDescription>Review all debits and credits associated with your account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Type</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getTransactionIcon(transaction.type)}
                                                    <span className="capitalize font-medium">{transaction.type}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {transaction.description.includes('Court-Ordered') && <Gavel className="inline-block h-4 w-4 mr-2" />}
                                                {transaction.description}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(transaction.status)}
                                            </TableCell>
                                            <TableCell>{format(transaction.date, 'PP')}</TableCell>
                                            <TableCell className={`text-right font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                                {transaction.type === 'credit' ? '+' : '-'}£{transaction.amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No transactions found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
