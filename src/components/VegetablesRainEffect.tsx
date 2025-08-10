
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface VegetablesRainEffectProps {
  isActive: boolean;
  onComplete?: () => void;
}

const vegetableEmojis = ['🥬', '🥕', '🥒', '🥦', '🍅', '🌽', '🫑', '🥑', '🍆', '🥰'];

interface Vegetable {
  id: number;
  emoji: string;
  x: number;
  animationDuration: number;
  delay: number;
}

export default function VegetablesRainEffect({ isActive, onComplete }: VegetablesRainEffectProps) {
  const [vegetables, setVegetables] = useState<Vegetable[]>([]);

  useEffect(() => {
    if (isActive) {
      // Generate random vegetables
      const newVegetables: Vegetable[] = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        emoji: vegetableEmojis[Math.floor(Math.random() * vegetableEmojis.length)],
        x: Math.random() * 100, // Random horizontal position
        animationDuration: 2 + Math.random() * 1.5, // 2-3.5 seconds
        delay: Math.random() * 0.8, // Stagger the start
      }));

      setVegetables(newVegetables);

      // Clean up after animation completes
      const timeout = setTimeout(() => {
        setVegetables([]);
        onComplete?.();
      }, 4000);

      return () => clearTimeout(timeout);
    } else {
      setVegetables([]);
    }
  }, [isActive, onComplete]);

  if (!isActive || vegetables.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {vegetables.map((vegetable) => (
        <div
          key={vegetable.id}
          className={cn(
            "absolute text-2xl select-none",
            "animate-[fall_var(--duration)_ease-in_var(--delay)_forwards]"
          )}
          style={{
            left: `${vegetable.x}%`,
            top: '-10%',
            '--duration': `${vegetable.animationDuration}s`,
            '--delay': `${vegetable.delay}s`,
            animationName: 'fall',
          } as React.CSSProperties}
        >
          {vegetable.emoji}
        </div>
      ))}
      
      <style>
        {`
          @keyframes fall {
            0% {
              transform: translateY(-100px) rotate(0deg);
              opacity: 1;
            }
            80% {
              opacity: 1;
            }
            100% {
              transform: translateY(calc(100vh + 100px)) rotate(360deg);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
}
