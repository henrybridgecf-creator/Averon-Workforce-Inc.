'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Briefcase, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError('');
    setIsLoading(true);

    // Mock signup logic
    setTimeout(() => {
        // In a real app, you would create the user here.
        // For mock, we'll just redirect to login.
        console.log("Mock signup successful for:", email);
        router.push('/login');
        setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground flex flex-col items-center justify-center">
      <div className="absolute inset-0 z-0 bg-grid-black/[0.05] dark:bg-grid-white/[0.05]"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <main className="w-full max-w-md">
          <div className="bg-card p-8 rounded-2xl shadow-2xl shadow-black/10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center justify-center">
                <Briefcase className="mr-2"/>
                CafeLink
              </h1>
              <p className="text-muted-foreground mt-1">Create Your Account</p>
            </div>
            
            <form className="space-y-4" onSubmit={handleSignup}>
              {error && (
                <Alert variant="destructive">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Signup Failed</AlertTitle>
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Input 
                  id="email"
                  type="email"
                  placeholder="CAFELINK Email" 
                  className="bg-background/80 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  className="bg-background/80 text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
               <div className="space-y-2">
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm Password"
                  className="bg-background/80 text-sm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="pt-4">
                <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </div>
            </form>
             <div className="text-center mt-6 text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                Log In
                </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
