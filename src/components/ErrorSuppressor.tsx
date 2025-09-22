'use client';

import { useEffect } from 'react';

export function ErrorSuppressor() {
  useEffect(() => {
    // Hide Next.js error overlay
    const hideErrorOverlay = () => {
      // Hide Next.js error dialogs
      const errorElements = [
        '[data-nextjs-dialog]',
        '[data-nextjs-dialog-overlay]',
        '[data-nextjs-toast]',
        '#__next-build-watcher',
        'nextjs-portal'
      ];

      errorElements.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.display = 'none';
          }
        });
      });

      // Hide iframes (React error boundary)
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        const style = iframe.getAttribute('style') || '';
        if (style.includes('position: fixed')) {
          iframe.style.display = 'none';
        }
      });

      // Hide any fixed positioned elements in bottom left
      const fixedElements = document.querySelectorAll('[style*="position: fixed"]');
      fixedElements.forEach(el => {
        const style = el.getAttribute('style') || '';
        if (style.includes('bottom') && style.includes('left')) {
          (el as HTMLElement).style.display = 'none';
        }
      });
    };

    // Run immediately
    hideErrorOverlay();

    // Run on DOM changes
    const observer = new MutationObserver(hideErrorOverlay);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    // Run periodically as fallback
    const interval = setInterval(hideErrorOverlay, 1000);

    // Override console errors for development (optional)
    if (process.env.NODE_ENV === 'development') {
      const originalError = console.error;
      console.error = (...args) => {
        // Filter out specific Next.js/React errors we want to hide
        const message = args.join(' ').toLowerCase();
        const shouldHide = [
          'missing required authentication environment variables',
          'password mismatch',
          'invalid username or password'
        ].some(phrase => message.includes(phrase.toLowerCase()));

        if (!shouldHide) {
          originalError.apply(console, args);
        }
      };

      return () => {
        console.error = originalError;
        observer.disconnect();
        clearInterval(interval);
      };
    }

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return null; // This component doesn't render anything
} 