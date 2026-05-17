'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Home, DollarSign, MessageSquare, FileText, Settings } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(!user);

  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
    setLoading(false);
  }, [user, router, loading]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: 'Logged out successfully' });
      router.push('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      });
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  const balance = user.appUser?.balance || 0;
  const averpayId = user.appUser?.averpayId || 'AP-00000';
  const fullName = user.appUser?.fullName || user.email || 'User';

  return (
    <div className="min-h-screen bg-[#020817]">
      {/* Header */}
      <header className="bg-[#050f26] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome, {fullName}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Profile Card */}
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-xl p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{fullName}</h2>
              <p className="text-muted-foreground">ID: {averpayId}</p>
              <p className="text-muted-foreground">Email: {user.email}</p>
              {user.appUser?.phoneNumber && (
                <p className="text-muted-foreground">Phone: {user.appUser.phoneNumber}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Balance */}
          <div className="bg-[#050f26] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Available Balance</p>
                <h3 className="text-3xl font-bold text-white mt-2">${balance.toLocaleString()}</h3>
              </div>
              <div className="bg-primary/20 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="bg-[#050f26] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Projects</p>
                <h3 className="text-3xl font-bold text-white mt-2">
                  {user.appUser?.projectsAssigned?.length || 0}
                </h3>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-[#050f26] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Account Status</p>
                <h3 className="text-xl font-bold text-green-400 mt-2 capitalize">
                  {user.appUser?.status || 'active'}
                </h3>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg">
                <Settings className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#050f26] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/projects">
              <Button className="w-full bg-primary hover:bg-primary/90">
                <FileText className="h-4 w-4 mr-2" />
                View Projects
              </Button>
            </Link>
            <Link href="/withdraw">
              <Button className="w-full bg-primary hover:bg-primary/90">
                <DollarSign className="h-4 w-4 mr-2" />
                Withdraw Funds
              </Button>
            </Link>
            <Link href="/chat">
              <Button className="w-full bg-primary hover:bg-primary/90">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </Button>
            </Link>
            <Link href="/profile">
              <Button className="w-full bg-primary hover:bg-primary/90">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
