
'use client';
import { useState } from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const socialLinks = [
  { name: 'Facebook', icon: Facebook, url: 'https://facebook.com/averonworkforce' },
  { name: 'Twitter', icon: Twitter, url: 'https://twitter.com/averonworkforce' },
  { name: 'Instagram', icon: Instagram, url: 'https://instagram.com/averonworkforce' },
  { name: 'LinkedIn', icon: Linkedin, url: 'https://linkedin.com/company/averonworkforce' },
];

export default function Footer() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSocialClick = (socialName: string, url: string) => {
    setLoading(socialName);
    
    // Open social link in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
    
    setTimeout(() => {
      setLoading(null);
      toast({
        title: 'Opening Social Media',
        description: `Redirecting you to our ${socialName} page...`,
      });
    }, 500);
  };

  return (
     <footer className="py-8 border-t bg-card mt-auto">
      <div className="container mx-auto px-6 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-muted-foreground text-sm gap-6">
          <p>&copy; {new Date().getFullYear()} Averon Workforce. All rights reserved.</p>
          
          <div className="flex items-center gap-4">
             <Link href="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</Link>
             <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          </div>
          
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <button
                key={social.name}
                onClick={() => handleSocialClick(social.name, social.url)}
                disabled={!!loading}
                className={cn(
                  "text-muted-foreground hover:text-primary transition-colors",
                  loading && "cursor-not-allowed opacity-50"
                )}
                aria-label={`Visit our ${social.name} page`}
                type="button"
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
