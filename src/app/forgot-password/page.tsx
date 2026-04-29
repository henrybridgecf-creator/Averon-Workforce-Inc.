
'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Wallet, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitted(false);

    if (!email) {
      setError('Please enter a valid email address.');
      return;
    }

    // Mock submission
    setTimeout(() => {
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground">
      <div className="absolute inset-0 z-0 dark:bg-grid-white/[0.05] bg-grid-black/[0.05]"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <main className="w-full max-w-md">
          <div className="bg-card p-8 rounded-2xl shadow-2xl shadow-black/10">
              <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center justify-center">
                <Wallet className="mr-2"/>
                AverPay
              </h1>
              <p className="text-muted-foreground mt-1">Reset Your Password</p>
            </div>
            
            {submitted ? (
              <Alert className="border-green-500/50 text-green-700 dark:text-green-400 [&>svg]:text-green-700 dark:[&>svg]:text-green-400">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Request Sent</AlertTitle>
                <AlertDescription>
                  If an account exists for {email}, you will receive a password reset link shortly.
                </AlertDescription>
              </Alert>
            ) : (
              <form className="space-y-4" onSubmit={handleReset}>
                 {error && (
                    <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <p className="text-sm text-muted-foreground text-center">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <div className="space-y-2">
                  <Input 
                    id="email"
                    type="email"
                    placeholder="Email" 
                    className="bg-secondary border-secondary"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="pt-4">
                  <Button type="submit" className="w-full text-lg py-6">
                    Send Reset Link
                  </Button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
