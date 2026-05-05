
'use client';
import { Button } from "@/components/ui/button";
import { Box, MessageSquare, LineChart, DollarSign, ShieldCheck, Wallet, Zap, ArrowRight, Globe, Users, Clock } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Box,
    title: "Project Management",
    description: "Accept or reject projects with ease. View project details, deadlines, and requirements all in one place.",
  },
  {
    icon: MessageSquare,
    title: "Direct Communication",
    description: "Communicate directly with Averon Workforce management. Get project updates and announcements instantly.",
  },
  {
    icon: LineChart,
    title: "Earnings Tracking",
    description: "Track your earnings in real-time. View payment history, pending payments, and total earnings.",
  },
  {
    icon: DollarSign,
    title: "Secure Withdrawals",
    description: "Withdraw your funds securely when you're ready. Simple, fast, and reliable payment processing.",
  },
  {
    icon: ShieldCheck,
    title: "Team Member Exclusive",
    description: "Designed exclusively for Averon Workforce team members with secure access and personalized experience.",
  },
  {
    icon: Wallet,
    title: "All-in-One Platform",
    description: "Everything you need for your freelance career with Averon Workforce in one convenient, easy-to-use platform."
  }
];

const stats = [
  { label: "Team Members", value: "5,000+" },
  { label: "Paid Out", value: "$2M+" },
  { label: "Uptime", value: "99.9%" },
  { label: "Countries", value: "50+" },
];

export default function HomePage() {
  return (
    <div className="bg-[#020817] text-foreground min-h-screen font-sans selection:bg-primary selection:text-primary-foreground">
      <div className="relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
        
        <header className="relative z-10 py-6 px-6 md:px-12 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
              <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/20">
                <Zap className="h-6 w-6 text-white fill-current"/>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                    AverPay
                </h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">by Averon Workforce</p>
              </div>
          </div>
          <nav className="flex items-center gap-4">
             <Link href="/login" className="hidden md:block text-sm font-medium text-muted-foreground hover:text-white transition-colors">
                Sign In
             </Link>
             <Link href="/signup" className="hidden md:block text-sm font-medium text-muted-foreground hover:text-white transition-colors">
                Sign Up
             </Link>
             <Link href="/signup">
                <Button variant="outline" className="border-primary/20 hover:bg-primary/10">Apply Now</Button>
             </Link>
          </nav>
        </header>

        <main className="relative z-10 container mx-auto px-6 pt-16 md:pt-24 lg:pt-32 text-center max-w-5xl">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
               Platform v4.0 is Live
            </div>
            
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[0.9]">
              Your Freelance Career <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-primary">In Your Hands</span>
            </h2>
            
            <p className="mt-8 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The official portal for Averon Workforce members. Accept projects, track live earnings, and execute secure international withdrawals on one high-performance platform.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-16 px-10 text-lg font-bold bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 group">
                  ACCESS DASHBOARD
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                 <Button variant="ghost" size="lg" className="w-full sm:w-auto h-16 px-10 text-lg font-bold text-white hover:bg-white/5 border border-white/10">
                    Learn More
                 </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid from Screenshot */}
          <div className="mt-24 md:mt-32 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 max-w-6xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="group p-8 md:p-10 rounded-[2rem] bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-white/[0.08] transition-all duration-300 text-center">
                 <div className="text-4xl md:text-5xl font-black text-white mb-2 group-hover:scale-110 transition-transform duration-500">
                  {stat.value}
                 </div>
                 <div className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
                   {stat.label}
                 </div>
              </div>
            ))}
          </div>
        </main>

        <section id="features" className="py-24 md:py-40 bg-[#030a1c] mt-24">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mb-16 md:mb-24">
                <h3 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">Everything You Need</h3>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  All the tools for your freelance career with Averon Workforce, consolidated into one high-performance, secure, and intuitive dashboard.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="p-10 rounded-[2rem] border border-white/5 flex flex-col items-start gap-8 text-left bg-[#050f26] hover:border-primary/30 hover:translate-y-[-8px] transition-all duration-500">
                  <div className="bg-primary/10 text-primary p-4 rounded-2xl">
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-white">{feature.title}</h4>
                    <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 md:py-40 relative overflow-hidden">
             <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
            <div className="container mx-auto px-6 text-center relative z-10">
                <div className="max-w-4xl mx-auto">
                    <h3 className="text-4xl md:text-7xl font-bold tracking-tighter text-white">Join the Global Workforce</h3>
                    <p className="mt-8 text-xl text-muted-foreground leading-relaxed">
                        Become part of the most secure and reliable freelance management ecosystem. Access premium projects and track your global earnings with ease.
                    </p>
                    <div className="mt-12">
                        <Link href="/signup">
                            <Button size="lg" className="h-16 px-12 text-xl font-black shadow-2xl shadow-primary/20">
                                START YOUR APPLICATION
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
      </div>
    </div>
  );
}
