
'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, User, Mail, Upload, Landmark, CreditCard, Phone } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { getInitials } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { updateUserData, initializeUsers, saveData } from "@/lib/mock-data";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/loading-spinner";


const profileFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters.").max(100, "Full name is too long."),
  personalEmail: z.string().email("Please enter a valid email.").optional().or(z.literal('')),
  phone: z.string().min(5, "Phone number seems too short.").optional().or(z.literal('')),
  bankDetails: z.object({
    bankName: z.string().min(2, "Bank name is required.").max(50, "Bank name is too long."),
    accountHolder: z.string().min(2, "Account holder name is required.").max(100, "Account holder name is too long."),
    accountNumber: z.string().min(5, "Account number is required.").max(20, "Account number is too long."),
  })
}).refine(data => data.bankDetails.accountHolder.toLowerCase() === data.fullName.toLowerCase(), {
    message: "Account holder name must match your full name.",
    path: ["bankDetails.accountHolder"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileSettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isFinishingSetup, setIsFinishingSetup] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      personalEmail: "",
      phone: "",
      bankDetails: {
        bankName: "",
        accountHolder: "",
        accountNumber: "",
      }
    },
    mode: 'onChange',
  });

  useEffect(() => {
    initializeUsers();
    const storedUserRaw = localStorage.getItem('loggedInUser');
    if (storedUserRaw) {
        const freshUserProfile = JSON.parse(storedUserRaw);
        setUserProfile(freshUserProfile);
        if (freshUserProfile) {
            form.reset({
                fullName: freshUserProfile.fullName || '',
                personalEmail: freshUserProfile.personalEmail || '',
                phone: freshUserProfile.phone || '',
                bankDetails: {
                    bankName: freshUserProfile.bankDetails?.bankName || '',
                    accountHolder: freshUserProfile.bankDetails?.accountHolder || '',
                    accountNumber: freshUserProfile.bankDetails?.accountNumber || '',
                }
            });
        }
    } else {
        router.push('/login');
    }
    setIsPageLoading(false);
  }, [form, router]);
  
  // Watch fullName field to auto-update accountHolder
  const watchedFullName = form.watch("fullName");
  useEffect(() => {
      form.setValue("bankDetails.accountHolder", watchedFullName, { shouldValidate: true });
  }, [watchedFullName, form]);


  const handleProfileUpdate = async (values: ProfileFormValues) => {
    if (!userProfile) return;

    const wasProfileIncomplete = !userProfile.bankDetails?.bankName;

    try {
        const updatedUser = updateUserData(userProfile.uid, values);
        setUserProfile(updatedUser); // Update local state
        saveData('loggedInUser', updatedUser); // Explicitly update logged in user in storage


        if (wasProfileIncomplete && values.bankDetails?.bankName) {
            setIsFinishingSetup(true);
            await new Promise(resolve => setTimeout(resolve, 2000));
            toast({
                title: "Bank Details Saved!",
                description: "You can now proceed with account verification.",
            });
            router.push('/dashboard/settings/verification');
        } else {
            toast({
                title: "Profile Updated",
                description: "Your profile details have been saved successfully.",
            });
        }
    } catch(e: any) {
        toast({ variant: 'destructive', title: "Update Failed", description: e.message || "Could not update your profile."})
    } finally {
        setIsFinishingSetup(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    
    const file = e.target.files?.[0];
    if (!file || !userProfile) return;

    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

    if (file.size > MAX_SIZE_BYTES) {
        toast({ variant: "destructive", title: "Upload Failed", description: "File is too large. Max 5MB." });
        return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
        toast({ variant: "destructive", title: "Upload Failed", description: "Unsupported file type. Please use JPG or PNG." });
        return;
    }
    
    try {
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            const updatedUser = updateUserData(userProfile.uid, { profilePhoto: dataUrl });
            setUserProfile(updatedUser);
            saveData('loggedInUser', updatedUser);

            toast({
                title: 'Photo Uploaded',
                description: `Your profile photo has been updated.`,
            });
        };
        reader.readAsDataURL(file);

    } catch (error: any) {
        console.error("Profile photo upload error: ", error);
        toast({
            variant: "destructive",
            title: "Upload Failed",
            description: error.message || "Could not upload photo."
        });
    }
  };
  
  if (isFinishingSetup) {
      return <LoadingSpinner />;
  }

  if (isPageLoading || !userProfile) {
      return (
          <div className="bg-background min-h-screen font-sans">
              <div className="container mx-auto px-4 pt-4 pb-24 max-w-2xl">
                  <header className="flex items-center py-2">
                     <Skeleton className="h-10 w-10" />
                     <Skeleton className="h-6 w-32 ml-4" />
                  </header>
                  <main className="mt-6">
                    <Skeleton className="h-[600px] w-full" />
                  </main>
              </div>
          </div>
      )
  }
  
  return (
    <div className="bg-background min-h-screen font-sans">
       <div className="container mx-auto px-4 pt-4 pb-24 max-w-2xl">
        
        <header className="flex items-center py-2">
          <Link href="/dashboard/settings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold ml-4">Profile Details</h1>
        </header>

        <main className="mt-6">
          <Card className="rounded-xl shadow-sm">
            <CardHeader>
                <CardTitle>Edit Your Profile</CardTitle>
                <CardDescription>Keep your personal and bank information up-to-date to ensure timely payments.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form className="space-y-6" onSubmit={form.handleSubmit(handleProfileUpdate)}>
                        <div className="flex items-center gap-4">
                           <Avatar className="h-20 w-20">
                                <AvatarImage src={userProfile?.profilePhoto} alt={userProfile?.fullName} />
                                <AvatarFallback>{getInitials(userProfile?.fullName || userProfile?.email || 'U')}</AvatarFallback>
                            </Avatar>
                            <div>
                                 <Label htmlFor="photo-upload" className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Photo
                                </Label>
                                <Input id="photo-upload" type="file" className="hidden" onChange={handleFileUpload} accept="image/jpeg,image/png" />
                                <p className="text-xs text-muted-foreground mt-2">PNG, JPG up to 5MB.</p>
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <Label htmlFor="name">Full Name</Label>
                                    <div className="relative flex items-center">
                                        <User className="absolute left-3 h-4 w-4 md:h-5 md:w-5 text-muted-foreground"/>
                                        <FormControl>
                                            <Input id="name" className="pl-10" {...field} />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                         <div className="space-y-2">
                            <Label htmlFor="email">Work Email Address (Login)</Label>
                            <div className="relative flex items-center">
                                <Mail className="absolute left-3 h-4 w-4 md:h-5 md:w-5 text-muted-foreground"/>
                                <Input id="email" value={userProfile?.email || ''} disabled className="pl-10 bg-muted/50 cursor-not-allowed" />
                            </div>
                        </div>
                        
                        <FormField
                            control={form.control}
                            name="personalEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Personal Email Address</Label>
                                    <div className="relative flex items-center">
                                        <Mail className="absolute left-3 h-4 w-4 md:h-5 md:w-5 text-muted-foreground"/>
                                        <FormControl>
                                            <Input className="pl-10" placeholder="For account recovery" {...field} />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Phone Number</Label>
                                    <div className="relative flex items-center">
                                        <Phone className="absolute left-3 h-4 w-4 md:h-5 md:w-5 text-muted-foreground"/>
                                        <FormControl>
                                            <Input className="pl-10" placeholder="Your contact number" {...field} />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <CardDescription className="pt-4 !mb-4 !mt-8 text-base">Bank Details for Withdrawals</CardDescription>

                        <FormField
                            control={form.control}
                            name="bankDetails.bankName"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Bank Name</Label>
                                    <div className="relative flex items-center">
                                        <Landmark className="absolute left-3 h-4 w-4 md:h-5 md:w-5 text-muted-foreground"/>
                                        <FormControl>
                                          <Input className="pl-10" placeholder="e.g. Big Bank Inc." {...field} />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="bankDetails.accountHolder"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Account Holder Name</Label>
                                    <div className="relative flex items-center">
                                        <User className="absolute left-3 h-4 w-4 md:h-5 md:w-5 text-muted-foreground"/>
                                        <FormControl>
                                          <Input className="pl-10" placeholder="Must match your full name" {...field} />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="bankDetails.accountNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Account Number</Label>
                                    <div className="relative flex items-center">
                                        <CreditCard className="absolute left-3 h-4 w-4 md:h-5 md:w-5 text-muted-foreground"/>
                                        <FormControl>
                                          <Input className="pl-10" placeholder="Keep this updated" {...field} />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isValid}>
                              {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
