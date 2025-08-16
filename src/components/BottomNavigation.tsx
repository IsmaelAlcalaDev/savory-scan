
import React from 'react';
import { Home, UtensilsCrossed } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: "restaurants" | "dishes";
  onTabChange: (tab: "restaurants" | "dishes") => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="flex justify-around items-center py-2">
        <button
          onClick={() => onTabChange('restaurants')}
          className={`flex flex-col items-center justify-center px-3 py-2 text-xs font-medium transition-colors ${
            activeTab === 'restaurants'
              ? 'text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Home className="h-6 w-6 mb-1" />
          <span>Restaurantes</span>
        </button>

        <button
          onClick={() => onTabChange('dishes')}
          className={`flex flex-col items-center justify-center px-3 py-2 text-xs font-medium transition-colors ${
            activeTab === 'dishes'
              ? 'text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <UtensilsCrossed className="h-6 w-6 mb-1" />
          <span>Platos</span>
        </button>
      </div>
    </nav>
  );
}
