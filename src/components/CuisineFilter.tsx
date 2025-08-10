
import { useState } from 'react';
import { Utensils, Coffee, Pizza, Soup, Cookie, Fish, Sun, ChefHat, Globe, Salad } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CuisineOption {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const cuisineOptions: CuisineOption[] = [
  { id: 'americana', name: 'Americana', icon: <Utensils className="h-6 w-6" /> },
  { id: 'arabe', name: 'Árabe', icon: <Coffee className="h-6 w-6" /> },
  { id: 'argentina', name: 'Argentina', icon: <ChefHat className="h-6 w-6" /> },
  { id: 'china', name: 'China', icon: <Soup className="h-6 w-6" /> },
  { id: 'espanola', name: 'Española', icon: <Sun className="h-6 w-6" /> },
  { id: 'francesa', name: 'Francesa', icon: <Cookie className="h-6 w-6" /> },
  { id: 'fusion', name: 'Fusión', icon: <Globe className="h-6 w-6" /> },
  { id: 'india', name: 'India', icon: <ChefHat className="h-6 w-6" /> },
  { id: 'italiana', name: 'Italiana', icon: <Pizza className="h-6 w-6" /> },
  { id: 'japonesa', name: 'Japonesa', icon: <Fish className="h-6 w-6" /> },
];

interface CuisineFilterProps {
  selectedCuisines: string[];
  onCuisineChange: (cuisines: string[]) => void;
}

export default function CuisineFilter({ selectedCuisines, onCuisineChange }: CuisineFilterProps) {
  const handleCuisineClick = (cuisineId: string) => {
    const newSelection = selectedCuisines.includes(cuisineId)
      ? selectedCuisines.filter(id => id !== cuisineId)
      : [...selectedCuisines, cuisineId];
    onCuisineChange(newSelection);
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {cuisineOptions.map((cuisine) => (
        <div
          key={cuisine.id}
          onClick={() => handleCuisineClick(cuisine.id)}
          className={cn(
            "flex flex-col items-center min-w-[80px] cursor-pointer p-3 rounded-lg transition-all",
            selectedCuisines.includes(cuisine.id)
              ? "bg-primary text-primary-foreground"
              : "bg-secondary hover:bg-secondary/80"
          )}
        >
          {cuisine.icon}
          <span className="text-xs mt-1 text-center">{cuisine.name}</span>
        </div>
      ))}
    </div>
  );
}
