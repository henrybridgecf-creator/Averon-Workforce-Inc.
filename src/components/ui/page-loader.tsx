
'use client';

import { useState, useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import LoadingSpinner from './loading-spinner';

function PageLoaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Using anchor click listening as a proxy for route change start
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLAnchorElement;
      const anchor = target.closest('a');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href && href.startsWith('/')) {
           // Prevent loader on same-page links with different hash
          if (href.split('#')[0] !== window.location.pathname.split('#')[0]) {
             setIsLoading(true);
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    
    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };

  }, []);

  return isLoading ? <LoadingSpinner /> : null;
}

export default function PageLoader() {
  return (
    <Suspense fallback={null}>
      <PageLoaderInner />
    </Suspense>
  );
}
