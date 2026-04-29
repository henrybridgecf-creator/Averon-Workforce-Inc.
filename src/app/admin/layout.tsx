
'use client';
import React from 'react';
import { AdminSidebar } from '@/components/ui/admin-sidebar';
import { Input } from '@/components/ui/input';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <AdminSidebar />
      <div className="flex flex-col w-full">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[300px] bg-card p-0">
                    <SheetTitle className="sr-only">Admin Menu</SheetTitle>
                    <AdminSidebar isSheetContent={true} />
                </SheetContent>
            </Sheet>

            <div className="w-full flex-1">
                <form>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                    type="search"
                    name="search"
                    placeholder="Search users..."
                    className="w-full appearance-none bg-card pl-8 shadow-none md:w-2/3 lg:w-1/3"
                    />
                </div>
                </form>
            </div>
             <Link href="/admin/notifications" className="relative">
              <Button variant="ghost" size="icon" className="rounded-full">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Toggle notifications</span>
              </Button>
            </Link>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
