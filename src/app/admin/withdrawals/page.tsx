'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, X, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { Withdrawal } from '@/types';

export default function WithdrawalsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    if (user && user.appUser?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const fetchWithdrawals = async () => {
      try {
        const withdrawalsRef = collection(db, 'withdrawalRequests');
        let q;
        if (filter === 'pending') {
          q = query(withdrawalsRef, where('status', '==', 'pending'));
        } else {
          q = query(withdrawalsRef);
        }
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => doc.data() as Withdrawal);
        setWithdrawals(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load withdrawals',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawals();
  }, [user, router, filter]);

  const handleApprove = async (withdrawalId: string) => {
    try {
      await updateDoc(doc(db, 'withdrawalRequests', withdrawalId), {
        status: 'approved',
        reviewedAt: Date.now(),
      });
      setWithdrawals(
        withdrawals.map((w) =>
          w.id === withdrawalId ? { ...w, status: 'approved' } : w
        )
      );
      toast({ title: 'Success', description: 'Withdrawal approved' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve withdrawal',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (withdrawalId: string) => {
    try {
      await updateDoc(doc(db, 'withdrawalRequests', withdrawalId), {
        status: 'rejected',
        reviewedAt: Date.now(),
      });
      setWithdrawals(
        withdrawals.map((w) =>
          w.id === withdrawalId ? { ...w, status: 'rejected' } : w
        )
      );
      toast({ title: 'Success', description: 'Withdrawal rejected' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject withdrawal',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="text-white">Loading withdrawals...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817]">
      <header className="bg-[#050f26] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">Withdrawal Requests</h1>
          <div className="w-32"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex gap-4">
          <Button
            onClick={() => setFilter('pending')}
            className={filter === 'pending' ? 'bg-primary' : 'bg-white/10'}
          >
            Pending
          </Button>
          <Button
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-primary' : 'bg-white/10'}
          >
            All
          </Button>
        </div>

        <div className="space-y-4">
          {withdrawals.map((withdrawal) => (
            <div
              key={withdrawal.id}
              className="bg-[#050f26] border border-white/10 rounded-xl p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{withdrawal.userName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Amount: ${withdrawal.amount.toLocaleString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    withdrawal.status === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : withdrawal.status === 'approved'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {withdrawal.status}
                </span>
              </div>

              {withdrawal.bankDetails && (
                <div className="mb-4 p-3 bg-white/5 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Bank Details:</p>
                  <p className="text-sm text-white">{withdrawal.bankDetails.accountHolder}</p>
                  <p className="text-sm text-white">{withdrawal.bankDetails.bankName}</p>
                  <p className="text-sm text-white">***{withdrawal.bankDetails.accountNumber.slice(-4)}</p>
                </div>
              )}

              {withdrawal.status === 'pending' && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApprove(withdrawal.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleReject(withdrawal.id)}
                    variant="destructive"
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {withdrawals.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No withdrawal requests found
          </div>
        )}
      </main>
    </div>
  );
}
