'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  TrendingUp,
  DollarSign,
  AlertCircle,
  LogOut,
  BarChart3,
  Settings,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, countDocuments } from 'firebase/firestore';
import { AdminStats } from '@/types';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalEarningsPaid: 0,
    pendingWithdrawals: 0,
    activeProjects: 0,
    completedProjects: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify admin access
    if (user && user.appUser?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const fetchStats = async () => {
      try {
        // Get total users
        const usersRef = collection(db, 'users');
        const allUsers = await getDocs(usersRef);
        const totalUsers = allUsers.size;

        // Get active users
        const activeUsersQuery = query(usersRef, where('status', '==', 'active'));
        const activeUsersSnap = await getDocs(activeUsersQuery);
        const activeUsers = activeUsersSnap.size;

        // Get pending withdrawals
        const withdrawalsRef = collection(db, 'withdrawalRequests');
        const pendingQuery = query(withdrawalsRef, where('status', '==', 'pending'));
        const pendingSnap = await getDocs(pendingQuery);
        const pendingWithdrawals = pendingSnap.size;

        // Get active projects
        const projectsRef = collection(db, 'projects');
        const activeProjectsQuery = query(projectsRef, where('status', '==', 'active'));
        const activeProjectsSnap = await getDocs(activeProjectsQuery);
        const activeProjects = activeProjectsSnap.size;

        // Get completed projects
        const completedProjectsQuery = query(projectsRef, where('status', '==', 'completed'));
        const completedProjectsSnap = await getDocs(completedProjectsQuery);
        const completedProjects = completedProjectsSnap.size;

        // Calculate total earnings paid
        let totalEarningsPaid = 0;
        const approvedWithdrawals = query(
          withdrawalsRef,
          where('status', '==', 'completed')
        );
        const approvedSnap = await getDocs(approvedWithdrawals);
        approvedSnap.forEach((doc) => {
          totalEarningsPaid += doc.data().amount || 0;
        });

        setStats({
          totalUsers,
          activeUsers,
          totalEarningsPaid,
          pendingWithdrawals,
          activeProjects,
          completedProjects,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard stats',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817]">
      {/* Header */}
      <header className="bg-[#050f26] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage AverPay Platform</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.appUser?.fullName}
            </span>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-[#050f26] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Users</p>
                <h3 className="text-3xl font-bold text-white mt-2">{stats.totalUsers}</h3>
              </div>
              <div className="bg-primary/20 p-3 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-[#050f26] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Users</p>
                <h3 className="text-3xl font-bold text-white mt-2">{stats.activeUsers}</h3>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>

          {/* Pending Withdrawals */}
          <div className="bg-[#050f26] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Pending Withdrawals</p>
                <h3 className="text-3xl font-bold text-white mt-2">{stats.pendingWithdrawals}</h3>
              </div>
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Total Paid Out */}
          <div className="bg-[#050f26] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Paid Out</p>
                <h3 className="text-3xl font-bold text-white mt-2">
                  ${stats.totalEarningsPaid.toLocaleString()}
                </h3>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Active Projects */}
          <div className="bg-[#050f26] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Projects</p>
                <h3 className="text-3xl font-bold text-white mt-2">{stats.activeProjects}</h3>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Completed Projects */}
          <div className="bg-[#050f26] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Completed Projects</p>
                <h3 className="text-3xl font-bold text-white mt-2">{stats.completedProjects}</h3>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#050f26] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/users">
              <Button className="w-full bg-primary hover:bg-primary/90">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/withdrawals">
              <Button className="w-full bg-primary hover:bg-primary/90">
                <DollarSign className="h-4 w-4 mr-2" />
                Withdrawals
              </Button>
            </Link>
            <Link href="/admin/projects">
              <Button className="w-full bg-primary hover:bg-primary/90">
                <BarChart3 className="h-4 w-4 mr-2" />
                Projects
              </Button>
            </Link>
            <Link href="/admin/messages">
              <Button className="w-full bg-primary hover:bg-primary/90">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
