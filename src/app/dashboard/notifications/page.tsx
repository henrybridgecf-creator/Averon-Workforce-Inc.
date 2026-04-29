
'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell, CheckCircle, XCircle, MessageSquare, LogIn, BadgeCheck } from "lucide-react";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { notifications as initialNotifications } from "@/lib/mock-data";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'project-approved':
            return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'project-rejected':
            return <XCircle className="h-5 w-5 text-red-500" />;
        case 'new-message':
            return <MessageSquare className="h-5 w-5 text-blue-500" />;
        case 'new-login':
            return <LogIn className="h-5 w-5 text-slate-500" />;
        case 'activation-notice':
            return <BadgeCheck className="h-5 w-5 text-yellow-500" />;
        default:
            return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
};

const getNotificationBadge = (type: string) => {
    switch (type) {
        case 'project-approved':
            return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">Approved</Badge>;
        case 'project-rejected':
            return <Badge variant="destructive">Edits Required</Badge>;
        case 'new-message':
            return <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">Message</Badge>;
        case 'new-login':
            return <Badge variant="secondary">Security</Badge>;
        case 'activation-notice':
            return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">Activation</Badge>;
        default:
            return <Badge variant="secondary">Update</Badge>;
    }
}


export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleNotificationClick = (notification: typeof initialNotifications[0]) => {
    // Mark as read
    const updatedNotifications = notifications.map(n => 
      n.id === notification.id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    // This is a mock way of updating the global state.
    // In a real app, you'd use a state management library.
    initialNotifications.find(n => n.id === notification.id)!.read = true;
    window.dispatchEvent(new CustomEvent('notifications-updated'));


    // Navigate if a link is associated
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DashboardLayout>
        <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
            </div>
            <p className="text-muted-foreground">Your recent account activity and updates.</p>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Notifications</CardTitle>
                    <CardDescription>You have {unreadCount} unread notifications.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {notifications.map(notification => {
                          const Wrapper = notification.link ? 'a' : 'div';
                          
                          return (
                            <Wrapper 
                              key={notification.id}
                              href={notification.link}
                              onClick={(e) => {
                                e.preventDefault();
                                handleNotificationClick(notification);
                              }}
                              className={cn(
                                "flex items-start gap-4 p-4 rounded-lg border transition-colors",
                                !notification.read && "bg-secondary/50",
                                "hover:bg-accent cursor-pointer"
                              )}
                            >
                                <div className="p-2 bg-background rounded-full mt-1">
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1">
                                    <p className={cn("font-semibold", !notification.read ? "text-foreground" : "text-muted-foreground")}>
                                      {notification.title}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                                    <div className="mt-2">
                                        {getNotificationBadge(notification.type)}
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground text-right space-y-2">
                                    <span>{notification.timestamp}</span>
                                    {!notification.read && <Badge variant="default" className="block w-fit ml-auto">New</Badge>}
                                </div>
                            </Wrapper>
                          )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    </DashboardLayout>
  );
}
