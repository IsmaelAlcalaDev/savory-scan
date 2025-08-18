
import { useState } from 'react';
import { ArrowUpDown, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SortOption {
  value: string;
  label: string;
  description?: string;
}

interface SortTagProps {
  options: SortOption[];
  currentValue: string;
  onSortChange: (value: string) => void;
  label?: string;
}

export default function SortTag({ options, currentValue, onSortChange, label = "Ordenar" }: SortTagProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentOption = options.find(option => option.value === currentValue);
  const isActive = currentValue !== options[0]?.value; // Active if not default

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`
          inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium
          transition-all duration-200 hover:shadow-sm border
          ${isActive 
            ? 'bg-black text-white border-black' 
            : 'bg-[#F3F3F3] text-gray-700 border-transparent hover:bg-gray-200'
          }
        `}
      >
        <ArrowUpDown className="w-4 h-4" />
        <span>{isActive ? currentOption?.label : label}</span>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ordenar por</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-2">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onSortChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full text-left p-3 rounded-lg border transition-colors
                  hover:bg-gray-50 flex items-center justify-between
                  ${currentValue === option.value 
                    ? 'border-black bg-gray-50' 
                    : 'border-gray-200'
                  }
                `}
              >
                <div>
                  <div className="font-medium">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-gray-500">{option.description}</div>
                  )}
                </div>
                {currentValue === option.value && (
                  <Check className="w-5 h-5 text-black" />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
