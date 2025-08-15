
import { useEffect } from 'react';

export const useMobileScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (!isLocked) return;

    // Store original styles
    const originalStyle = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      touchAction: document.body.style.touchAction,
    };

    // Get current scroll position
    const scrollY = window.scrollY;

    // Apply mobile-optimized scroll lock
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.touchAction = 'none'; // Prevent iOS bounce scrolling

    // Add data attribute for CSS targeting
    document.body.setAttribute('data-mobile-scroll-locked', 'true');

    // Cleanup function
    return () => {
      // Restore original styles
      Object.entries(originalStyle).forEach(([key, value]) => {
        if (value) {
          (document.body.style as any)[key] = value;
        } else {
          (document.body.style as any)[key] = '';
        }
      });

      // Remove data attribute
      document.body.removeAttribute('data-mobile-scroll-locked');

      // Restore scroll position
      if (scrollY) {
        window.scrollTo(0, scrollY);
      }
    };
  }, [isLocked]);
};
