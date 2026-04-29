

'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { History, ArrowUpRight, ArrowDownLeft, Gavel } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

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
    }
].sort((a, b) => b.date.getTime() - a.date.getTime());


export default function HistoryPage() {

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
        return <Badge variant="destructive">{status}</Badge>;
    }


    return (
        <DashboardLayout>
            <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Transaction History</h2>
                </div>
                <p className="text-muted-foreground">A detailed record of your financial activities.</p>

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
                                {transactions.map((transaction) => (
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
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
