
import { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export interface SortOption {
  id: string;
  name: string;
  label: string;
  icon?: string;
}

interface SortTagProps {
  options: SortOption[];
  selectedSort: string;
  onSortChange: (sortId: string) => void;
  defaultLabel?: string;
}

export default function SortTag({
  options,
  selectedSort,
  onSortChange,
  defaultLabel = "Ordenar"
}: SortTagProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedOption = options.find(option => option.id === selectedSort);
  const displayLabel = selectedOption ? selectedOption.label : defaultLabel;
  const hasSelection = selectedOption && selectedSort !== options[0]?.id;

  const handleSortChange = (sortId: string) => {
    onSortChange(sortId);
    setIsModalOpen(false);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`
            h-8 px-3 text-sm font-medium rounded-full border transition-all duration-200
            ${hasSelection 
              ? 'bg-black text-white border-black hover:bg-gray-800' 
              : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
            }
          `}
        >
          <ArrowUpDown className="w-3.5 h-3.5 mr-1.5" />
          {displayLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5" />
            Ordenar por
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup
            value={selectedSort}
            onValueChange={handleSortChange}
          >
            <div className="space-y-3">
              {options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={option.id} 
                    id={`sort-${option.id}`}
                  />
                  <Label 
                    htmlFor={`sort-${option.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                  >
                    {option.icon && <span>{option.icon}</span>}
                    {option.name}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      </DialogContent>
    </Dialog>
  );
}
