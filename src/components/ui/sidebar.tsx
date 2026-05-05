
'use client';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Wallet, Home, Folder, Info, Settings, LogOut, Lock, MessageSquare, LifeBuoy, FilePlus, History, Search } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from './skeleton';


const calculateProfileCompletion = (userProfile: any): number => {
    if (!userProfile) return 0;
    
    const fields = [
        userProfile.fullName,
        userProfile.profilePhoto,
        userProfile.verificationIdUrl,
        userProfile.proofOfAddressUrl,
        userProfile.bankDetails?.bankName,
        userProfile.bankDetails?.accountNumber,
        userProfile.personalEmail,
        userProfile.phone
    ];
    
    const completedFields = fields.filter(field => !!field).length;
    const totalFields = fields.length;
    
    return Math.round((completedFields / totalFields) * 100);
};

function SidebarContent({ isSheetContent = false }: { isSheetContent?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserRaw = localStorage.getItem('loggedInUser');
    if (storedUserRaw) {
      try {
        const storedUser = JSON.parse(storedUserRaw);
        setUserProfile(storedUser);
      } catch (e) {
        console.error("Failed to parse loggedInUser from localStorage", e);
        router.push('/login');
      }
    } else {
      const publicPaths = ['/login', '/apply', '/forgot-password', '/terms-of-service', '/privacy-policy', '/'];
      if (!publicPaths.includes(pathname)) {
        router.push('/login');
      }
    }
    setIsLoading(false);
  }, [pathname, router]);

  const handleLogout = async () => {
    localStorage.removeItem('loggedInUser');
    router.push('/login');
  };
  
  const accountSetupProgress = calculateProfileCompletion(userProfile);

  const isAdmin = userProfile?.role === 'Admin';
  const isFreelancer = userProfile?.role === 'Freelancer';
  const isClient = userProfile?.role === 'Client';

  const navItems = [
      { href: '/dashboard', label: 'Dashboard', icon: Home },
      { href: '/dashboard/projects', label: isClient ? 'Company Projects' : 'My Projects', icon: Folder },
      { href: '/dashboard/projects?status=new', label: 'New Briefs', icon: FilePlus, hide: isClient },
      { href: '/dashboard/withdraw', label: 'Wallet', icon: Wallet, disabled: userProfile?.status !== 'active', hide: isClient },
      { href: '/dashboard/history', label: 'History', icon: History, hide: isClient },
      { href: '/dashboard/search', label: 'Search', icon: Search, hide: !isFreelancer },
      { href: '/dashboard/chat', label: isAdmin ? 'Team Chat' : 'Supervisor Chat', icon: MessageSquare },
      { href: '/dashboard/support', label: 'Support', icon: LifeBuoy },
      { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ].filter(item => !item.hide);

  // Add specific items for Admin
  if (isAdmin) {
      navItems.push({ href: '/admin', label: 'Admin Panel', icon: Lock });
  }

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const statusParam = searchParams.get('status');
    let isActive = false;

    if (item.href.includes('?')) {
        const [path, params] = item.href.split('?');
        const itemParams = new URLSearchParams(params);
        isActive = pathname === path && statusParam === itemParams.get('status');
    } else {
        if (item.href === '/dashboard/projects') {
            isActive = pathname === item.href && !statusParam;
        } else {
            isActive = pathname === item.href;
        }
    }


    const link = (
        <Link
            href={item.href}
            className={cn(
            'flex items-center gap-3 rounded-2xl px-4 py-4 text-[13px] text-muted-foreground transition-all hover:text-white hover:bg-white/[0.03] border border-transparent duration-300 group',
            isActive && 'bg-primary/10 text-primary font-black border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]',
            item.disabled && 'pointer-events-none opacity-30 grayscale'
            )}
        >
            <item.icon className={cn("h-4 w-4 md:h-5 md:w-5 group-hover:scale-110 transition-transform duration-300", isActive ? "text-primary" : "text-white/20")} />
            <span className="tracking-[0.1em] uppercase font-black text-[10px] leading-none">{item.label}</span>
            {item.disabled && <Lock className="h-3 w-3 ml-auto opacity-50" />}
        </Link>
    );

    if (item.disabled) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div tabIndex={0}>{link}</div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>This feature is locked until your account is activated.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }
    return link;
  }

  const content = (
    <>
      <div className="flex flex-col p-10 pt-12">
        <Link href="/dashboard" className="flex items-center gap-4 font-black mb-14 group">
          <div className="bg-primary/10 text-primary p-3 rounded-[1.5rem] border border-primary/20 shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)] group-hover:scale-105 transition-all duration-500">
            <Wallet className="h-7 w-7" />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl tracking-tighter italic leading-none">AVER<span className='text-primary'>PAY</span></span>
            <span className="text-[8px] uppercase tracking-[0.4em] text-muted-foreground font-black mt-1 opacity-50">Secure Core</span>
          </div>
        </Link>
        {isLoading ? (
            <div className="flex flex-col items-center w-full space-y-4">
                <Skeleton className="h-20 w-20 rounded-[2rem] bg-white/5" />
                <Skeleton className="h-4 w-3/4 bg-white/5" />
            </div>
        ) : userProfile ? (
        <>
            <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className='flex items-center gap-4 p-5 rounded-[2.5rem] bg-white/[0.02] border border-white/5 group hover:border-primary/20 transition-all duration-500'
            >
              <div className="relative">
                  <Avatar className="h-14 w-14 rounded-[1.2rem] border-2 border-white/5 ring-1 ring-white/10 group-hover:ring-primary/30 transition-all">
                    <AvatarImage src={userProfile.profilePhoto} alt={userProfile.fullName} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary font-black uppercase">{getInitials(userProfile.fullName || userProfile.email || 'U')}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-background rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              </div>
              <div className="overflow-hidden">
                <p className="font-black text-[13px] truncate text-white/90 group-hover:text-white transition-colors tracking-tight">{userProfile.fullName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <div className="h-1 w-1 rounded-full bg-primary/60" />
                    <p className="text-[9px] text-muted-foreground font-black truncate uppercase tracking-[0.1em] opacity-40">{userProfile.role || 'Member'}</p>
                </div>
              </div>
            </motion.div>

            {accountSetupProgress < 100 && (
                <div className="w-full mt-8 px-2">
                    <Link href="/dashboard/settings/verification">
                        <div className='flex justify-between items-center mb-2'>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Core Integrity</p>
                            <p className="text-[10px] font-black text-primary">{accountSetupProgress}%</p>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${accountSetupProgress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
                            />
                        </div>
                    </Link>
                </div>
            )}
        </>
        ) : null}
      </div>
      <nav className="grid items-start px-6 gap-2 text-sm font-medium mt-4">
        {navItems.map((item, idx) => (
          <motion.div
            key={item.label + item.href}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + idx * 0.04, ease: "easeOut" }}
          >
            <NavLink item={item} />
          </motion.div>
        ))}
      </nav>
      <div className="mt-auto p-10">
        <Button 
            variant="ghost" 
            className="w-full justify-center text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground hover:text-red-400 hover:bg-red-400/5 border border-white/5 hover:border-red-400/20 rounded-[1.2rem] h-14 transition-all duration-500 group" 
            onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Terminate
        </Button>
      </div>
    </>
  );

  if (isSheetContent) {
    return <div className="flex flex-col h-full bg-card border-r border-white/5">{content}</div>;
  }

  return (
    <aside className="hidden md:flex flex-col w-[320px] border-r border-white/[0.05] bg-card text-white overflow-y-auto overflow-x-hidden">
      {content}
    </aside>
  );
}

export function Sidebar(props: { isSheetContent?: boolean }) {
  return (
    <Suspense fallback={<div className="hidden md:flex flex-col w-[300px] border-r bg-card h-full" />}>
      <SidebarContent {...props} />
    </Suspense>
  );
}
