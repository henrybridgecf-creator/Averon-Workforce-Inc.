
'use client';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChevronRight, User, Bell, Palette, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useEffect } from "react";
import { initializeUsers, updateUserData, addActivityLog, activityLogs } from "@/lib/mock-data";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userLogs, setUserLogs] = useState<any[]>([]);

  useEffect(() => {
    initializeUsers();
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserProfile(user);
        setUserLogs(activityLogs.filter(l => l.user === user.fullName || l.target === user.fullName).slice(0, 5));
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

    addActivityLog({
        type: 'profile_update',
        user: userProfile.fullName,
        description: `Updated ${setting} preference to ${enabled ? 'Enabled' : 'Disabled'}.`,
        timestamp: new Date().toISOString()
    });

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

                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Security Activity Terminal</h3>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest">Live Audit</Badge>
                    </div>
                    <Card className="bg-[#050f26] border-white/5 rounded-3xl shadow-xl overflow-hidden">
                        <CardContent className="p-0 divide-y divide-white/5">
                            {userLogs.length > 0 ? userLogs.map((log, i) => (
                                <div key={i} className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 text-primary">
                                            {log.type === 'login' ? <ShieldCheck className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">
                                                {log.type === 'login' ? 'System Login' : 
                                                 log.type === 'profile_update' ? 'Profile Mutation' :
                                                 log.type === 'submission' ? 'Resource Dispatch' : 'AverPay Event'}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                                                {log.location || 'Protocol Node'} • {log.description || 'Verified interaction'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-white">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Recent'}</p>
                                        <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">Success</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-10 text-center text-muted-foreground text-sm">
                                    No local cache logs found in this cycle.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <p className="text-[10px] text-muted-foreground mt-4 px-2 leading-relaxed">
                        Security logs are retained for 30 days. If you detect unauthorized access from an unknown IP or location, contact the supervisor immediately via the secure terminal.
                    </p>
                </section>
            </div>
        </div>
    </DashboardLayout>
  );
}
