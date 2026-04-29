
'use client';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChevronRight, User, Bell, Palette, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useEffect } from "react";
import { initializeUsers, updateUserData } from "@/lib/mock-data";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/ui/dashboard-layout";

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    initializeUsers();
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
        setUserProfile(JSON.parse(storedUser));
    } else {
        router.push('/login');
    }
  }, [router]);
  
  const handleToggle = (setting: string, enabled: boolean) => {
    if (!userProfile) return;

    let updatedPreferences;
    if (setting === 'Project Updates') {
        updatedPreferences = { ...userProfile.notificationPreferences, projectUpdates: enabled };
    } else if (setting === 'Platform Announcements') {
        updatedPreferences = { ...userProfile.notificationPreferences, platformAnnouncements: enabled };
    } else if (setting === 'Dark Mode') {
        document.documentElement.classList.toggle('dark', !enabled); // Note: UI shows "Light Mode" switch, so checked is dark.
         updatedPreferences = { ...userProfile.notificationPreferences, darkMode: enabled };
    } else {
        return;
    }
    
    const updatedUser = updateUserData(userProfile.uid, { notificationPreferences: updatedPreferences });
    setUserProfile(updatedUser);

    toast({
      title: "Settings Updated",
      description: `${setting} have been ${enabled ? 'enabled' : 'disabled'}.`,
    });
  };

  if (!userProfile) {
    return null; // or a loading spinner
  }

  return (
    <DashboardLayout>
        <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            </div>
             <p className="text-muted-foreground">Manage your account and preferences.</p>
            <div className="space-y-10 pt-6">
                 <section>
                    <h3 className="text-lg font-semibold mb-4">Account</h3>
                    <Card className="rounded-xl shadow-sm">
                        <CardContent className="p-0 divide-y">
                            <Link href="/dashboard/settings/profile" className="flex justify-between items-center p-4 hover:bg-secondary">
                                <div className="flex items-center">
                                    <User className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground mr-4"/>
                                    <div>
                                        <p className="font-semibold">Profile Details</p>
                                        <p className="text-sm text-muted-foreground">Update your name, photo, and bank info.</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground"/>
                            </Link>
                             <Link href="/dashboard/settings/verification" className="flex justify-between items-center p-4 hover:bg-secondary">
                                <div className="flex items-center">
                                    <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground mr-4"/>
                                    <div>
                                        <p className="font-semibold">Account Verification</p>
                                        <p className="text-sm text-muted-foreground">Activate your ID and complete security checks.</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground"/>
                            </Link>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h3 className="text-lg font-semibold mb-4">Notifications</h3>
                    <Card className="rounded-xl shadow-sm">
                    <CardContent className="p-0 divide-y">
                        <div className="flex justify-between items-center p-4">
                            <div className="flex items-center">
                                <Bell className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground mr-4"/>
                                <div>
                                    <Label htmlFor="project-updates" className="font-semibold cursor-pointer">Project Updates</Label>
                                    <p className="text-sm text-muted-foreground">Receive alerts for new projects and status changes.</p>
                                </div>
                            </div>
                            <Switch 
                                id="project-updates" 
                                checked={userProfile?.notificationPreferences?.projectUpdates}
                                onCheckedChange={(checked) => handleToggle("Project Updates", checked)}
                            />
                        </div>
                        <div className="flex justify-between items-center p-4">
                            <div className="flex items-center">
                                <Bell className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground mr-4"/>
                                 <div>
                                    <Label htmlFor="general-announcements" className="font-semibold cursor-pointer">Platform Announcements</Label>
                                    <p className="text-sm text-muted-foreground">Get notified about general platform news.</p>
                                </div>
                            </div>
                            <Switch 
                                id="general-announcements" 
                                checked={userProfile?.notificationPreferences?.platformAnnouncements}
                                onCheckedChange={(checked) => handleToggle("Platform Announcements", checked)}
                            />
                        </div>
                        </CardContent>
                    </Card>
                </section>
                
                <section>
                    <h3 className="text-lg font-semibold mb-4">Appearance</h3>
                    <Card className="rounded-xl shadow-sm">
                    <CardContent className="p-0">
                        <div className="flex justify-between items-center p-4">
                            <div className="flex items-center">
                                <Palette className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground mr-4"/>
                                <div>
                                    <Label htmlFor="dark-mode" className="font-semibold cursor-pointer">Dark Mode</Label>
                                    <p className="text-sm text-muted-foreground">Toggle between light and dark themes.</p>
                                </div>
                            </div>
                            <Switch 
                                id="dark-mode"
                                checked={userProfile?.notificationPreferences?.darkMode}
                                onCheckedChange={(checked) => {
                                  handleToggle("Dark Mode", checked)
                                  if (checked) {
                                    document.documentElement.classList.add('dark');
                                  } else {
                                    document.documentElement.classList.remove('dark');
                                  }
                                }}
                            />
                        </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    </DashboardLayout>
  );
}
