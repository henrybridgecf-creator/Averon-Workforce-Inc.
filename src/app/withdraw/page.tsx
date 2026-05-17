'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  DollarSign,
  ArrowLeft,
  CreditCard,
  Bank,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Withdrawal } from '@/types';

export default function WithdrawPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    amount: '',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    reason: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const balance = user?.appUser?.balance || 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    if (parseFloat(formData.amount) > balance) {
      toast({
        title: 'Insufficient Balance',
        description: `You only have $${balance.toLocaleString()} available`,
        variant: 'destructive',
      });
      return;
    }

    if (!formData.bankName || !formData.accountNumber || !formData.accountHolder) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all bank details',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const withdrawalRequest: Withdrawal = {
        id: '',
        userId: user!.uid,
        userName: user?.appUser?.fullName || user?.email || 'User',
        amount: parseFloat(formData.amount),
        status: 'pending',
        bankDetails: {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          accountHolder: formData.accountHolder,
        },
        reason: formData.reason,
        requestedAt: Date.now(),
      };

      const withdrawalsRef = collection(db, 'withdrawalRequests');
      await addDoc(withdrawalsRef, withdrawalRequest);

      toast({
        title: 'Success',
        description: 'Withdrawal request submitted. Admin will review shortly.',
      });

      setFormData({
        amount: '',
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        reason: '',
      });

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit withdrawal request',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817]">
      {/* Header */}
      <header className="bg-[#050f26] border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">Request Withdrawal</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Available Balance</p>
              <h2 className="text-4xl font-bold text-white mt-2">${balance.toLocaleString()}</h2>
            </div>
            <div className="bg-primary/20 p-4 rounded-lg">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-[#050f26] border border-white/10 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Withdrawal Details</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Amount to Withdraw</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  max={balance}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  required
                  disabled={submitting}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Maximum: ${balance.toLocaleString()}</p>
            </div>

            <div className="border-t border-white/10 pt-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Bank className="h-5 w-5" />
                Bank Details
              </h3>

              {/* Bank Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-2">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="e.g., Chase Bank"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  required
                  disabled={submitting}
                />
              </div>

              {/* Account Holder */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-2">Account Holder Name</label>
                <input
                  type="text"
                  name="accountHolder"
                  value={formData.accountHolder}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  required
                  disabled={submitting}
                />
              </div>

              {/* Account Number */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-2">Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="123456789"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Reason (Optional)</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Tell us why you're withdrawing..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
                disabled={submitting}
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 bg-primary hover:bg-primary/90 font-bold"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Request Withdrawal
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-200">
              ⚠️ Your withdrawal request will be reviewed by our admin team. You'll be notified once it's approved.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
