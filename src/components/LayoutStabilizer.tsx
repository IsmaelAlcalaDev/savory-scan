
import { useEffect, useState } from 'react';

interface LayoutStabilizerProps {
  children: React.ReactNode;
  className?: string;
  minHeight?: number;
}

export default function LayoutStabilizer({ 
  children, 
  className = "",
  minHeight = 200 
}: LayoutStabilizerProps) {
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Small delay to allow content to render
    const timer = setTimeout(() => {
      setHasLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`transition-all duration-300 ${className}`}
      style={{ 
        minHeight: hasLoaded ? 'auto' : `${minHeight}px`,
        opacity: hasLoaded ? 1 : 0.8
      }}
    >
      {children}
    </div>
  );
}
