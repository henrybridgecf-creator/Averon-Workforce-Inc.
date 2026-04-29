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
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }

    const initialUnreadCount = mockNotifications.filter(n => !n.read).length;
    setUnreadCount(initialUnreadCount);

    const handleUpdate = () => {
       const updatedUnreadCount = mockNotifications.filter(n => !n.read).length;
       setUnreadCount(updatedUnreadCount);
    }
    window.addEventListener('notifications-updated', handleUpdate);
    return () => window.removeEventListener('notifications-updated', handleUpdate);

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
    <div className="flex min-h-screen w-full bg-[#030a1c]">
      <Sidebar />
      <div className="flex flex-col w-full">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-white/5 bg-[#030a1c] px-4 md:px-6">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0 md:hidden text-white/70 hover:bg-white/5">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[300px] bg-[#050f26] border-r-white/5 p-0">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <Sidebar isSheetContent={true} />
                </SheetContent>
            </Sheet>

            <div className="w-full flex-1 md:flex items-center hidden">
                <form onSubmit={handleSearch} className="w-full max-w-sm">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                    type="search"
                    name="search"
                    placeholder="Search for new Projects"
                    className="w-full appearance-none bg-white/5 border-white/10 pl-8 shadow-none h-10"
                    />
                </div>
                </form>
            </div>
            
            <div className="flex items-center gap-3 ml-auto">
                <Button variant="ghost" size="icon" className="text-yellow-500 hover:bg-white/5 h-10 w-10">
                    <Sun className="h-5 w-5 fill-current" />
                </Button>
                
                <Link href="/dashboard/notifications" className="relative">
                    <Button variant="ghost" size="icon" className="rounded-full text-white/70 hover:bg-white/5 h-10 w-10">
                        <Bell className="h-5 w-5" />
                        <span className="sr-only">Toggle notifications</span>
                    </Button>
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                    )}
                </Link>

                <Button variant="ghost" size="icon" className="rounded-full bg-primary hover:bg-primary/90 text-white p-0 h-9 w-9 overflow-hidden flex items-center justify-center">
                     {user?.profilePhoto ? (
                         <Avatar className="h-9 w-9">
                             <AvatarImage src={user.profilePhoto} />
                         </Avatar>
                     ) : <User className="h-5 w-5" />}
                </Button>
            </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
