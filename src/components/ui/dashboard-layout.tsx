'use client';
import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Bell, Search, Sun, User, Menu } from 'lucide-react';
import { Button } from './button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from './sheet';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { notifications as mockNotifications } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const refreshUser = () => {
      const storedUserRaw = localStorage.getItem('loggedInUser');
      if (storedUserRaw) {
          const storedUser = JSON.parse(storedUserRaw);
          
          // Re-hydrate from usersData to get latest updates from admin/system
          const storedUsersRaw = localStorage.getItem('usersData');
          if (storedUsersRaw) {
              const users = JSON.parse(storedUsersRaw);
              const latestUser = users.find((u: any) => u.uid === storedUser.uid);
              if (latestUser) {
                  // Merge but keep session specifics if any (like browserInfo)
                  const mergedUser = { ...storedUser, ...latestUser };
                  setUser(mergedUser);
                  localStorage.setItem('loggedInUser', JSON.stringify(mergedUser));
                  return;
              }
          }
          setUser(storedUser);
      }
    };

    refreshUser();

    const initialUnreadCount = mockNotifications.filter(n => !n.read).length;
    setUnreadCount(initialUnreadCount);

    const handleUpdate = () => {
       const updatedUnreadCount = mockNotifications.filter(n => !n.read).length;
       setUnreadCount(updatedUnreadCount);
    }

    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'loggedInUser' || e.key === 'usersData') {
            refreshUser();
        }
    };

    window.addEventListener('notifications-updated', handleUpdate);
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('notifications-updated', handleUpdate);
        window.removeEventListener('storage', handleStorageChange);
    };

  }, []);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = formData.get('search') as string;
    if (query) {
      router.push(`/dashboard/search?q=${encodeURIComponent(query)}`);
    }
  };


  return (
    <div className="flex min-h-screen w-full bg-background text-foreground selection:bg-primary/20 selection:text-primary transition-colors duration-500">
      <Sidebar />
      <div className="flex flex-col w-full">
        <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b border-white/[0.04] bg-background/60 px-6 backdrop-blur-2xl md:px-10">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0 md:hidden text-white/40 hover:bg-white/5 hover:text-white transition-all">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[320px] bg-card border-r-white/10 p-0 overflow-hidden">
                    <SheetTitle className="sr-only">AverPay Navigation Menu</SheetTitle>
                    <Sidebar isSheetContent={true} />
                </SheetContent>
            </Sheet>

            <div className="w-full flex-1 md:flex items-center hidden max-w-xl">
                <form onSubmit={handleSearch} className="w-full">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                    type="search"
                    name="search"
                    placeholder="Search operational nodes..."
                    className="w-full bg-white/[0.03] border-white/10 pl-11 shadow-none h-12 rounded-2xl focus:border-primary/50 focus:bg-white/[0.05] transition-all text-xs font-medium"
                    />
                </div>
                </form>
            </div>
            
            <div className="flex items-center gap-4 ml-auto">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Terminal Active</span>
                </div>

                <Link href="/dashboard/notifications" className="relative group">
                    <Button variant="ghost" size="icon" className="rounded-2xl text-white/40 hover:bg-white/5 hover:text-primary transition-all h-12 w-12 border border-transparent hover:border-white/10">
                        <Bell className="h-5 w-5" />
                        <span className="sr-only">Toggle notifications</span>
                    </Button>
                    {unreadCount > 0 && (
                        <span className="absolute top-3 right-3 flex h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]" />
                    )}
                </Link>

                <div className="h-8 w-px bg-white/10 mx-2" />

                <Button variant="ghost" className="p-0 h-11 w-11 rounded-2xl overflow-hidden flex items-center justify-center border border-white/10 hover:border-primary/50 transition-all bg-white/5 group">
                     {user?.profilePhoto ? (
                         <div className="relative h-full w-full">
                             <Avatar className="h-full w-full rounded-none">
                                 <AvatarImage src={user.profilePhoto} className="object-cover" />
                             </Avatar>
                             <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                         </div>
                     ) : <User className="h-5 w-5 text-white/40 group-hover:text-primary" />}
                </Button>
            </div>
        </header>
        <main className="flex-1 overflow-x-hidden p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
