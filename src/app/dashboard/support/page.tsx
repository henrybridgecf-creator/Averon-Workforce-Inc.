
'use client';
import DashboardLayout from "@/components/ui/dashboard-layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HelpCircle, Mail, BookText } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const faqs = [
    {
        question: "How do I activate my account?",
        answer: "Account activation requires completing your profile and paying the one-time profile activation fee. Once completed, your account will be reviewed and activated by an admin, usually within 24 hours."
    },
    {
        question: "Why are my withdrawals locked?",
        answer: "Withdrawals are locked for accounts with a 'pending' status. To unlock withdrawals, your account must be fully activated. Please complete all the steps in your profile settings."
    },
    {
        question: "What is the IMF code and why is it required?",
        answer: "The IMF (International Monetary Fund) code is a security measure for authorizing financial transactions. It is provided by your account manager to ensure that withdrawal requests are legitimate and secure."
    },
    {
        question: "How long does it take for a submitted project to be approved?",
        answer: "Project review times can vary, but our team typically reviews submissions within 2-3 business days. You will receive a notification once your project status is updated."
    },
    {
        question: "What happens if I decline a new project?",
        answer: "If you decline a project, it will be removed from your 'New Projects' list and may be offered to another freelancer. Declining projects does not negatively impact your account status."
    }
];

export default function SupportPage() {
    return (
        <DashboardLayout>
            <div className="flex-1 space-y-8 p-4 sm:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Support Center</h2>
                        <p className="text-muted-foreground">Find help and answers to your questions.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <HelpCircle className="h-6 w-6" />
                                    Frequently Asked Questions
                                </CardTitle>
                                <CardDescription>
                                    Find quick answers to common questions about your account and projects.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    {faqs.map((faq, index) => (
                                        <AccordionItem key={index} value={`item-${index}`}>
                                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                                            <AccordionContent>
                                                {faq.answer}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-8">
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-6 w-6" />
                                    Contact Support
                                </CardTitle>
                                <CardDescription>
                                    Can't find the answer? Our support team is here to help.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold">Technical & Account Support</h4>
                                    <p className="text-sm text-muted-foreground mb-2">For issues with your account, login problems, or technical errors.</p>
                                    <a href="mailto:cafemedia.hrdesk@outlook.com">
                                        <Button className="w-full">Email Support</Button>
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                 <CardTitle className="flex items-center gap-2">
                                    <BookText className="h-6 w-6" />
                                    Helpful Resources
                                </CardTitle>
                                <CardDescription>
                                    Review our platform policies and guidelines.
                                </CardDescription>
                            </CardHeader>
                             <CardContent className="space-y-2">
                                <Link href="/terms-of-service" passHref>
                                    <Button variant="outline" className="w-full justify-start">Terms of Service</Button>
                                </Link>
                                <Link href="/privacy-policy" passHref>
                                    <Button variant="outline" className="w-full justify-start">Privacy Policy</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
