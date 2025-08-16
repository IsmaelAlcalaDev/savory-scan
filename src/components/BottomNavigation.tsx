
import { Home, UtensilsCrossed, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  activeTab: 'restaurants' | 'dishes' | 'account';
  onTabChange: (tab: 'restaurants' | 'dishes' | 'account') => void;
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
  {
    id: 'account' as const,
    label: 'Mi Cuenta',
    icon: User,
    hideOnTabletAndDesktop: true, // Hide this item on tablet and desktop
  },
];

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden">
      <div className="flex items-center justify-around py-1 px-2">
        {navigationItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          // Hide account tab on tablet and desktop (md and above)
          if (item.hideOnTabletAndDesktop) {
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
          }
          
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
