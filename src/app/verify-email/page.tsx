'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const email = searchParams.get('email') || '';

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      toast({
        title: 'Email Sent',
        description: 'Verification email has been resent to your inbox',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend verification email',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#050f26] border border-white/10 rounded-2xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
          <p className="text-muted-foreground mb-6">
            We've sent a verification link to <br />
            <span className="text-white font-semibold">{email}</span>
          </p>

          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground">
              Please click the link in the email to verify your account.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleContinue}
              className="w-full h-12 bg-primary hover:bg-primary/90 font-bold"
            >
              I've Verified My Email
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <Button
              onClick={handleResendEmail}
              variant="outline"
              className="w-full h-12 font-bold"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Resend Verification Email'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
