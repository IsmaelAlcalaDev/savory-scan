
import { useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LocationWelcomeScreen } from './guided-location/LocationWelcomeScreen';
import { LocationCitySelector } from './guided-location/LocationCitySelector';
import { LocationZoneSelector } from './guided-location/LocationZoneSelector';
import { LocationDistrictSelector } from './guided-location/LocationDistrictSelector';
import { LocationQuickSearch } from './guided-location/LocationQuickSearch';

interface GuidedLocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (location: { type: 'gps' | 'manual' | 'city' | 'suggestion'; data?: any }) => void;
}

type NavigationStep = 'welcome' | 'cities' | 'zones' | 'districts' | 'quicksearch';

interface NavigationState {
  step: NavigationStep;
  selectedCity?: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
  };
  breadcrumb: string[];
}

export default function GuidedLocationModal({ 
  open, 
  onOpenChange, 
  onLocationSelect 
}: GuidedLocationModalProps) {
  const [navigation, setNavigation] = useState<NavigationState>({
    step: 'welcome',
    breadcrumb: []
  });

  const handleBack = useCallback(() => {
    if (navigation.step === 'cities') {
      setNavigation({ step: 'welcome', breadcrumb: [] });
    } else if (navigation.step === 'zones') {
      setNavigation({ step: 'cities', breadcrumb: [] });
    } else if (navigation.step === 'districts') {
      setNavigation(prev => ({ 
        ...prev, 
        step: 'zones', 
        breadcrumb: prev.breadcrumb.slice(0, -1) 
      }));
    } else if (navigation.step === 'quicksearch') {
      setNavigation({ step: 'welcome', breadcrumb: [] });
    }
  }, [navigation.step]);

  const handleStepChange = useCallback((step: NavigationStep, data?: any) => {
    if (step === 'cities') {
      setNavigation({ step: 'cities', breadcrumb: [] });
    } else if (step === 'zones' && data) {
      setNavigation({ 
        step: 'zones', 
        selectedCity: data,
        breadcrumb: [data.name] 
      });
    } else if (step === 'districts' && data) {
      setNavigation(prev => ({ 
        ...prev,
        step: 'districts', 
        breadcrumb: [...prev.breadcrumb, 'Zona específica'] 
      }));
    } else if (step === 'quicksearch') {
      setNavigation({ step: 'quicksearch', breadcrumb: [] });
    } else if (step === 'welcome') {
      setNavigation({ step: 'welcome', breadcrumb: [] });
    }
  }, []);

  const handleLocationSelection = useCallback((location: any) => {
    onLocationSelect(location);
    onOpenChange(false);
    setNavigation({ step: 'welcome', breadcrumb: [] });
  }, [onLocationSelect, onOpenChange]);

  const renderContent = () => {
    switch (navigation.step) {
      case 'welcome':
        return (
          <LocationWelcomeScreen 
            onStepChange={handleStepChange}
            onLocationSelect={handleLocationSelection}
          />
        );
      case 'cities':
        return (
          <LocationCitySelector 
            onStepChange={handleStepChange}
            onLocationSelect={handleLocationSelection}
          />
        );
      case 'zones':
        return (
          <LocationZoneSelector 
            selectedCity={navigation.selectedCity!}
            onStepChange={handleStepChange}
            onLocationSelect={handleLocationSelection}
          />
        );
      case 'districts':
        return (
          <LocationDistrictSelector 
            selectedCity={navigation.selectedCity!}
            onLocationSelect={handleLocationSelection}
          />
        );
      case 'quicksearch':
        return (
          <LocationQuickSearch 
            onLocationSelect={handleLocationSelection}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md mx-auto bg-background border-border shadow-xl rounded-xl overflow-hidden p-0">
        {/* Simple Header */}
        <div className="px-6 py-4 border-b border-border/30">
          <div className="flex items-center gap-3">
            {navigation.step !== 'welcome' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-8 w-8 rounded-full hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">
                ¿Dónde buscas?
              </h2>
              {navigation.breadcrumb.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {navigation.breadcrumb.join(' > ')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
