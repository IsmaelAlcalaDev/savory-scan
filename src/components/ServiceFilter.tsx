
import { useState } from 'react';
import { ChevronDown, Utensils } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useServices } from '@/hooks/useServices';
import { Skeleton } from '@/components/ui/skeleton';

interface ServiceFilterProps {
  selectedServices: number[];
  onServiceChange: (services: number[]) => void;
}

export default function ServiceFilter({ selectedServices, onServiceChange }: ServiceFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { services, loading, error } = useServices();

  const handleServiceToggle = (serviceId: number) => {
    const newSelected = selectedServices.includes(serviceId)
      ? selectedServices.filter(id => id !== serviceId)
      : [...selectedServices, serviceId];
    onServiceChange(newSelected);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Error loading services:', error);
    return null;
  }

  return (
    <div className="space-y-3">
      {services.map((service) => (
        <div key={service.id} className="flex items-center space-x-2">
          <Checkbox 
            id={`service-${service.id}`}
            checked={selectedServices.includes(service.id)}
            onCheckedChange={() => handleServiceToggle(service.id)}
          />
          <label 
            htmlFor={`service-${service.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
          >
            <span>{service.icon}</span>
            {service.name}
          </label>
        </div>
      ))}
    </div>
  );
}
