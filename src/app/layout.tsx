import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';
import PageLoader from '@/components/ui/page-loader';
import Footer from '@/components/ui/footer';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });


export const metadata: Metadata = {
  title: 'AverPay',
  description: 'Freelance Management Platform by Averon Workforce',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💰</text></svg>" />
      </head>
      <body className={inter.className + ' antialiased flex flex-col min-h-screen'}>
          <div className="flex-grow">
            <PageLoader />
            {children}
          </div>
          <Footer />
          <Toaster />
          <Script 
            src="//code.jivosite.com/widget/nC1IrUfwd4" 
            strategy="lazyOnload" 
          />
      </body>
    </html>
  );
}
