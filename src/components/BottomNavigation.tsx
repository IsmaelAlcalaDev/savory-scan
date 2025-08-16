
import { Home, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  activeTab: 'restaurants' | 'dishes';
  onTabChange: (tab: 'restaurants' | 'dishes') => void;
}

const navigationItems = [
  {
    id: 'restaurants' as const,
    label: 'Restaurantes',
    icon: Home,
  },
  {
    id: 'dishes' as const,  
    label: 'Platos',
    icon: UtensilsCrossed,
  },
];

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex items-center justify-around py-1 px-2">
        {navigationItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-all duration-200",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className={cn(
                "text-xs font-medium",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
