
import { useEffect } from 'react';

export const useModalScrollLock = (isOpen: boolean) => {
  useEffect(() => {
    if (isOpen) {
      // Store current scroll position
      const scrollY = window.pageYOffset;
      
      // Add data attribute to body for CSS targeting
      document.body.setAttribute('data-scroll-locked', 'true');
      
      // Store scroll position as CSS custom property
      document.body.style.setProperty('--scroll-y', `${scrollY}px`);
      
      // Cleanup function
      return () => {
        document.body.removeAttribute('data-scroll-locked');
        document.body.style.removeProperty('--scroll-y');
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);
};
