
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { useEffect, useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

export default function InfoPage() {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString());
  }, []);


  return (
    <DashboardLayout>
        <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Company Information</h2>
            </div>
            <p className="text-muted-foreground">Updates, news, and important announcements for the team.</p>

            <Card>
                <CardHeader>
                    <CardTitle>Welcome to the Team!</CardTitle>
                    <CardDescription>Published on: {currentDate}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>We are thrilled to have you as part of the Averon Workforce freelance team. This platform, AverPay, is your central hub for managing your projects, tracking your earnings, and staying connected with us.</p>
                    <h3 className="font-semibold text-lg pt-4">Getting Started</h3>
                    <p>Please take a moment to familiarize yourself with the dashboard. You can view your assigned projects, submit your work, and request withdrawals all from this platform. Ensure your profile and bank details under 'Settings' are always up-to-date to avoid any payment delays.</p>
                    <h3 className="font-semibold text-lg pt-4">Important Security Notice</h3>
                    <p>For security purposes, all financial transactions, including withdrawals, may require a two-factor authentication code (like an IMF code) provided by your manager. Never share this code with anyone. Our official communication will always come through this platform or your registered email.</p>
                    <p>If you have any questions, please use the "Direct Chat with Admin" button on your dashboard to get in touch.</p>
                     <p className="pt-4">Best regards,</p>
                    <p className="font-semibold">The Averon Workforce Team</p>
                </CardContent>
            </Card>
        </div>
    </DashboardLayout>
  );
}
