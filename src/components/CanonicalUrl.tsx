
import { useEffect } from 'react';

interface CanonicalUrlProps {
  url: string;
}

export default function CanonicalUrl({ url }: CanonicalUrlProps) {
  useEffect(() => {
    // Remove any existing canonical links
    const existingLinks = document.querySelectorAll('link[rel="canonical"]');
    existingLinks.forEach(link => link.remove());

    // Add new canonical link
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = url;
    document.head.appendChild(link);

    console.log('CanonicalUrl: Set canonical URL to:', url);

    // Cleanup function
    return () => {
      const linkToRemove = document.querySelector(`link[rel="canonical"][href="${url}"]`);
      if (linkToRemove) {
        linkToRemove.remove();
      }
    };
  }, [url]);

  return null; // This component doesn't render anything visible
}
