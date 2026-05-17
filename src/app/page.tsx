import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: '📦',
      title: 'Project Management',
      description: 'Accept or reject projects with ease. View details and deadlines.',
    },
    {
      icon: '💬',
      title: 'Direct Communication',
      description: 'Chat directly with supervisors. Get instant updates.',
    },
    {
      icon: '📊',
      title: 'Earnings Tracking',
      description: 'Monitor your earnings in real-time. View payment history.',
    },
    {
      icon: '🔒',
      title: 'Secure Withdrawals',
      description: 'Request withdrawals safely. Admin approves and processes.',
    },
    {
      icon: '👥',
      title: 'Team Exclusive',
      description: 'Designed for Averon Workforce team members only.',
    },
    {
      icon: '⚡',
      title: 'All-in-One',
      description: 'Everything you need in one convenient platform.',
    },
  ];

  const stats = [
    { label: 'Active Members', value: '5,000+' },
    { label: 'Total Paid Out', value: '$2M+' },
    { label: 'Uptime', value: '99.9%' },
    { label: 'Countries', value: '50+' },
  ];

  return (
    <div className="min-h-screen bg-[#020817] text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Navigation */}
      <nav className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Zap className="h-6 w-6 text-white fill-current" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AverPay</h1>
              <p className="text-xs text-primary">by Averon Workforce</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Platform v4.0 is Live
          </div>

          <h2 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-tight mb-6">
            Your Freelance Career <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-primary">
              In Your Hands
            </span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            The official portal for Averon Workforce members. Accept projects, track earnings, and execute secure withdrawals.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/signup">
              <Button size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 group">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-[#050f26]">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-4xl font-bold text-white text-center mb-4">Everything You Need</h3>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            All the tools for your freelance career in one high-performance, secure platform.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-[#020817] border border-white/10 rounded-xl p-8 hover:border-primary/50 transition"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-bold text-white mb-2">{feature.title}</h4>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Ready to Grow Your Career?
          </h3>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of freelancers earning with Averon Workforce.
          </p>
          <Link href="/signup">
            <Button size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary/90">
              Start Your Application
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Averon Workforce. All rights reserved.</p>
      </footer>
    </div>
  );
}
