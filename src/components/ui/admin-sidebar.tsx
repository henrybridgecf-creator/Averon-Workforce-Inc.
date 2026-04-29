
'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Users, Folder, Settings, LogOut, Wallet, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function AdminSidebar({ isSheetContent = false }: { isSheetContent?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const handleLogout = () => {
    // This is a mock logout. In a real app, you'd clear session/token.
    localStorage.removeItem('loggedInUser');
    router.push('/login');
  };

  const navItems = [
      { href: '/admin/users', label: 'Users', icon: Users },
      { href: '/admin/projects', label: 'Projects', icon: Folder },
      { href: '/admin/chat', label: 'Chat', icon: MessageSquare },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = pathname.startsWith(item.href);

    return (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-4 rounded-lg px-4 py-3 text-muted-foreground transition-all hover:text-primary hover:bg-accent',
          isActive && 'bg-accent text-primary font-semibold',
        )}
      >
        <item.icon className="h-5 w-5" />
        {item.label}
      </Link>
    );
  };

  const content = (
    <>
      <div className="flex flex-col p-6">
        <Link href="/admin/users" className="flex items-center gap-2 font-semibold mb-8 text-foreground">
            <Wallet className="h-6 w-6" />
          <span className="text-xl font-bold">Admin Panel</span>
        </Link>
      </div>
      <nav className="grid items-start px-4 text-sm font-medium">
        {navItems.map((item) => (
          <NavLink key={item.label} item={item} />
        ))}
      </nav>
      <div className="mt-auto p-4">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-primary" onClick={handleLogout}>
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </>
  );

  if (isSheetContent) {
    return <div className="flex flex-col h-full">{content}</div>;
  }

  return (
    <aside className="hidden md:flex flex-col w-[280px] border-r bg-card text-card-foreground">
      {content}
    </aside>
  );
}
