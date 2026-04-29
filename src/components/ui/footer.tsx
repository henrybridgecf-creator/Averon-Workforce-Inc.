
'use client';
import { useState } from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Loader2, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const socialLinks = [
  { name: 'Facebook', icon: Facebook },
  { name: 'Twitter', icon: Twitter },
  { name: 'Instagram', icon: Instagram },
  { name: 'LinkedIn', icon: Linkedin },
];

export default function Footer() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSocialClick = (socialName: string) => {
    setLoading(socialName);

    setTimeout(() => {
      setLoading(null);
      toast({
        variant: 'destructive',
        title: 'Connection Error',
        description: `Could not connect to social network. Please try again later.`,
        
      });
    }, 2000);
  };

  return (
     <footer className="py-8 border-t bg-card mt-auto">
      <div className="container mx-auto px-6 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-muted-foreground text-sm gap-6">
          <p>&copy; {new Date().getFullYear()} Averon Workforce. All rights reserved.</p>
          
          <div className="flex items-center gap-4">
             <Link href="/terms-of-service" className="hover:text-foreground">Terms of Service</Link>
             <Link href="/privacy-policy" className="hover:text-foreground">Privacy Policy</Link>
          </div>
          
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <button
                key={social.name}
                onClick={() => handleSocialClick(social.name)}
                disabled={!!loading}
                className={cn(
                  "text-muted-foreground hover:text-primary transition-colors",
                  loading && "cursor-not-allowed opacity-50"
                )}
                aria-label={`Visit our ${social.name} page`}
              >
                {loading === social.name ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <social.icon className="h-5 w-5" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
