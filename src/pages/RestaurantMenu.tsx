import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Utensils, Search } from 'lucide-react';
import { useRestaurantProfile } from '@/hooks/useRestaurantProfile';
import { useRestaurantMenuFallback } from '@/hooks/useRestaurantMenuFallback';
import RestaurantMenuSection from '@/components/RestaurantMenuSection';
import MenuSectionTabs from '@/components/MenuSectionTabs';
import InlineSearchBar from '@/components/InlineSearchBar';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { OrderSimulatorProvider } from '@/contexts/OrderSimulatorContext';
import OrderSimulatorSummary from '@/components/OrderSimulatorSummary';
import OrderSimulatorModal from '@/components/OrderSimulatorModal';
import AddDinersModal from '@/components/AddDinersModal';
import { useOrderSimulator } from '@/contexts/OrderSimulatorContext';

function RestaurantMenuContent() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { restaurant, loading: restaurantLoading, error: restaurantError } = useRestaurantProfile(slug || '');
  const { sections, loading: sectionsLoading, error: sectionsError } = useRestaurantMenuFallback(restaurant?.id || 0);
  const { isSimulatorOpen, closeSimulator, isDinersModalOpen, closeDinersModal } = useOrderSimulator();

  // Filter states
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [selectedDietTypes, setSelectedDietTypes] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<number | undefined>();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Reference point for active section detection (150px from top)
  const REFERENCE_POINT = 150;

  // Filter sections and dishes based on active filters
  const filteredSections = useMemo(() => {
    if (!sections) return [];
    return sections.map(section => {
      let filteredDishes = section.dishes;

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filteredDishes = filteredDishes.filter(dish => dish.name.toLowerCase().includes(query) || dish.description?.toLowerCase().includes(query));
      }

      // Apply allergen filter (exclude dishes that contain selected allergens)
      if (selectedAllergens.length > 0) {
        filteredDishes = filteredDishes.filter(dish => {
          const dishAllergens = dish.allergens || [];
          return !selectedAllergens.some(allergen => dishAllergens.includes(allergen));
        });
      }

      // Apply diet type filter
      if (selectedDietTypes.length > 0) {
        filteredDishes = filteredDishes.filter(dish => {
          return selectedDietTypes.some(dietTypeId => {
            switch (dietTypeId) {
              case 1:
                return dish.is_vegetarian;
              case 2:
                return dish.is_vegan;
              case 3:
                return dish.is_gluten_free;
              case 4:
                return dish.is_lactose_free;
              case 5:
                return dish.is_healthy;
              default:
                return false;
            }
          });
        });
      }
      return {
        ...section,
        dishes: filteredDishes
      };
    }).filter(section => section.dishes.length > 0);
  }, [sections, searchQuery, selectedAllergens, selectedDietTypes]);

  const handleGoBack = () => {
    navigate(`/restaurant/${slug}`);
  };

  const handleSectionClick = (sectionId: number) => {
    console.log('Section clicked:', sectionId);
    setActiveSection(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      // Calculate offset for sticky header + navigation (approximately 110px)
      const stickyOffset = 110;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset - stickyOffset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setSearchQuery(''); // Clear search when closing
  };

  // Simplified scroll handler to detect active section
  const handleScroll = useCallback(() => {
    if (filteredSections.length === 0) return;

    let activeId = null;
    let closestDistance = Infinity;
    
    filteredSections.forEach(section => {
      const element = document.getElementById(`section-${section.id}`);
      if (element) {
        const rect = element.getBoundingClientRect();
        const distanceFromReference = REFERENCE_POINT - rect.top;
        
        // If the section has passed the reference point and is closer than previous ones
        if (distanceFromReference >= 0 && distanceFromReference < closestDistance) {
          closestDistance = distanceFromReference;
          activeId = section.id;
        }
      }
    });
    
    // If no section has passed the reference point, use the first one
    if (activeId === null && filteredSections.length > 0) {
      activeId = filteredSections[0].id;
    }
    
    if (activeId !== activeSection) {
      console.log('Active section changed to:', activeId);
      setActiveSection(activeId);
    }
  }, [filteredSections, activeSection, REFERENCE_POINT]);

  // Throttle scroll events for better performance
  const throttledHandleScroll = useCallback(() => {
    let ticking = false;
    
    const update = () => {
      handleScroll();
      ticking = false;
    };
    
    return () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };
  }, [handleScroll]);

  // Set initial active section when filteredSections are loaded
  useEffect(() => {
    if (filteredSections.length > 0 && activeSection === undefined) {
      console.log('Setting initial active section:', filteredSections[0].id);
      setActiveSection(filteredSections[0].id);
    }
  }, [filteredSections, activeSection]);

  // Set up scroll listener for active section detection
  useEffect(() => {
    if (filteredSections.length === 0) return;

    console.log('Setting up scroll listener for sections:', filteredSections.map(s => s.id));
    
    const scrollHandler = throttledHandleScroll();
    window.addEventListener('scroll', scrollHandler, { passive: true });
    
    // Initial check
    handleScroll();

    return () => {
      console.log('Cleaning up scroll listener');
      window.removeEventListener('scroll', scrollHandler);
    };
  }, [filteredSections, throttledHandleScroll, handleScroll]);

  if (restaurantLoading || sectionsLoading) {
    return <div className="min-h-screen bg-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({
            length: 6
          }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
          </div>
        </div>
      </div>;
  }

  if (restaurantError || sectionsError || !restaurant) {
    return <div className="min-h-screen bg-gray-100">
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Restaurante no encontrado</h1>
            <p className="text-muted-foreground mb-4">Error: {restaurantError || sectionsError}</p>
            <Button onClick={() => navigate('/restaurantes')}>
              Volver a restaurantes
            </Button>
          </div>
        </div>
      </div>;
  }

  console.log('Rendering with activeSection:', activeSection, 'filteredSections:', filteredSections.length);

  return (
    <>
      <Helmet>
        <title>Carta de {restaurant.name} | SavorySearch</title>
        <meta name="description" content={`Explora la carta completa de ${restaurant.name}. Descubre todos nuestros platos y encuentra tu favorito.`} />
      </Helmet>

      <div className="min-h-screen bg-gray-100 pb-20">
        {/* Sticky Header with Inline Search */}
        <div className="sticky top-0 z-50">
          <InlineSearchBar
            isOpen={isSearchOpen}
            onClose={handleSearchClose}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            placeholder="Buscar platos..."
            restaurantName={restaurant.name}
            restaurantLogo={restaurant.logo_url}
            onGoBack={handleGoBack}
            onSearchToggle={handleSearchToggle}
          />

          {/* Section Navigation - only show when search is not active */}
          {!isSearchOpen && (
            <div className="bg-white border-b">
              <MenuSectionTabs 
                sections={filteredSections} 
                activeSection={activeSection} 
                onSectionClick={handleSectionClick}
                selectedAllergens={selectedAllergens}
                selectedDietTypes={selectedDietTypes}
                onAllergenChange={setSelectedAllergens}
                onDietTypeChange={setSelectedDietTypes}
              />
            </div>
          )}
        </div>

        {/* Menu Content - Full width container */}
        <div className="w-full">
          {filteredSections.length === 0 ? (
            <div className="max-w-6xl mx-auto px-4 py-8">
              <div className="text-center py-12 bg-white rounded-lg">
                <Utensils className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron platos</h3>
                <p className="text-muted-foreground">
                  {searchQuery || selectedAllergens.length > 0 || selectedDietTypes.length > 0 
                    ? 'Intenta ajustar los filtros o la búsqueda' 
                    : 'Este restaurante aún no tiene platos disponibles'}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full">
              {filteredSections.map(section => (
                <RestaurantMenuSection key={section.id} section={section} restaurantId={restaurant.id} />
              ))}
            </div>
          )}
        </div>

        {/* Order Simulator Components */}
        <OrderSimulatorSummary />
        
        <OrderSimulatorModal isOpen={isSimulatorOpen} onClose={closeSimulator} />
        
        <AddDinersModal isOpen={isDinersModalOpen} onClose={closeDinersModal} />
      </div>
    </>
  );
}

export default function RestaurantMenu() {
  return (
    <OrderSimulatorProvider>
      <RestaurantMenuContent />
    </OrderSimulatorProvider>
  );
}
