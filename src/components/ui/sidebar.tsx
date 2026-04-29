
'use client';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Wallet, Home, Folder, Info, Settings, LogOut, Lock, MessageSquare, LifeBuoy, FilePlus, History } from 'lucide-react';
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

  const navItems = [
      { href: '/dashboard', label: 'Dashboard', icon: Home },
      { href: '/dashboard/projects', label: 'My Projects', icon: Folder },
      { href: '/dashboard/projects?status=new', label: 'New Projects', icon: FilePlus },
      { href: '/dashboard/withdraw', label: 'Withdraw', icon: Wallet, disabled: userProfile?.status !== 'active' },
      { href: '/dashboard/history', label: 'History', icon: History },
      { href: '/dashboard/info', label: 'Newsfeed', icon: Info },
      { href: '/dashboard/chat', label: 'Supervisor Chat', icon: MessageSquare },
      { href: '/dashboard/support', label: 'Support', icon: LifeBuoy },
      { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

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
            'flex items-center gap-3 rounded-lg px-3 py-3 text-muted-foreground transition-all hover:text-primary hover:bg-accent',
            isActive && 'bg-accent text-primary font-semibold',
            item.disabled && 'pointer-events-none opacity-50'
            )}
        >
            <item.icon className="h-4 w-4 md:h-5 md:w-5" />
            {item.label}
            {item.disabled && <Lock className="h-4 w-4 ml-auto" />}
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
      <div className="flex flex-col p-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold mb-6">
          <div className="bg-primary/10 text-primary p-2 rounded-lg">
            <Wallet className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <span className="text-xl">AVER<span className='font-bold'>PAY</span></span>
        </Link>
        {isLoading ? (
            <div className="flex flex-col items-center w-full">
                <Skeleton className="h-16 w-16 rounded-full mb-2" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
                <div className="w-full mt-6 space-y-2">
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-2 w-full" />
                </div>
            </div>
        ) : userProfile ? (
        <>
            <div className='flex items-center gap-4'>
              <Avatar className="h-16 w-16">
                <AvatarImage src={userProfile.profilePhoto} alt={userProfile.fullName} />
                <AvatarFallback>{getInitials(userProfile.fullName || userProfile.email || 'U')}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-lg">{userProfile.fullName}</p>
                <p className="text-sm text-muted-foreground font-mono">{userProfile.averpayId}</p>
              </div>
            </div>

            {accountSetupProgress < 100 && (
                <div className="w-full mt-6">
                    <Link href="/dashboard/settings/verification">
                        <div className='flex justify-between items-center mb-1'>
                            <p className="text-xs font-semibold">Account Setup</p>
                            <p className="text-xs font-semibold">{accountSetupProgress}%</p>
                        </div>
                        <Progress value={accountSetupProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1 cursor-pointer hover:underline">Click to complete verification</p>
                    </Link>
                </div>
            )}
        </>
        ) : null}
      </div>
      <nav className="grid items-start px-4 text-sm font-medium">
        {navItems.map((item) => (
          <NavLink key={item.label + item.href} item={item} />
        ))}
      </nav>
      <div className="mt-auto p-4">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4 md:h-5 md:w-5" />
          Logout
        </Button>
      </div>
    </>
  );

  if (isSheetContent) {
    return <div className="flex flex-col h-full">{content}</div>;
  }

  return (
    <aside className="hidden md:flex flex-col w-[300px] border-r bg-card text-card-foreground">
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
