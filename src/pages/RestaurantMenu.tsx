import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Utensils, Search } from 'lucide-react';
import { useRestaurantProfile } from '@/hooks/useRestaurantProfile';
import { useRestaurantMenuFallback } from '@/hooks/useRestaurantMenuFallback';
import RestaurantMenuSection from '@/components/RestaurantMenuSection';
import MenuSectionTabs from '@/components/MenuSectionTabs';
import ExpandableSearchBar from '@/components/ExpandableSearchBar';
import { useState, useEffect, useMemo, useRef } from 'react';
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
  const [isExpandableSearchOpen, setIsExpandableSearchOpen] = useState(false);

  // Ref for intersection observer
  const sectionsRefs = useRef<{ [key: number]: HTMLElement | null }>({});

  const handleGoBack = () => {
    navigate(`/restaurant/${slug}`);
  };

  const handleSectionClick = (sectionId: number) => {
    setActiveSection(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      // Fixed offset for sticky header (74px) + sticky nav (59px)
      const headerOffset = 133;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleSearchToggle = () => {
    setIsExpandableSearchOpen(!isExpandableSearchOpen);
  };

  const handleExpandableSearchClose = () => {
    setIsExpandableSearchOpen(false);
  };

  // Auto-detect active section on scroll using Intersection Observer
  useEffect(() => {
    if (filteredSections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = parseInt(entry.target.id.replace('section-', ''));
          sectionsRefs.current[sectionId] = entry.target as HTMLElement;
          
          if (entry.isIntersecting) {
            setActiveSection(sectionId);
          }
        });
      },
      {
        rootMargin: '-133px 0px -50% 0px', // Account for sticky headers
        threshold: 0.1
      }
    );

    // Observe all section elements
    filteredSections.forEach((section) => {
      const element = document.getElementById(`section-${section.id}`);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [filteredSections]);

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

  // Set initial active section
  useEffect(() => {
    if (filteredSections.length > 0 && !activeSection) {
      setActiveSection(filteredSections[0].id);
    }
  }, [filteredSections, activeSection]);

  if (restaurantLoading || sectionsLoading) {
    return <div className="min-h-screen bg-muted/20">
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
    return <div className="min-h-screen bg-muted/20">
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

  return (
    <>
      <Helmet>
        <title>Carta de {restaurant.name} | SavorySearch</title>
        <meta name="description" content={`Explora la carta completa de ${restaurant.name}. Descubre todos nuestros platos y encuentra tu favorito.`} />
      </Helmet>

      <div className="min-h-screen bg-muted/20 pb-20">
        {/* Sticky Header Navigation with Search - sin border-b */}
        <div className="bg-background sticky top-0 z-40 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button onClick={handleGoBack} variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                </Button>

                {restaurant.logo_url && (
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-border flex-shrink-0">
                    <img src={restaurant.logo_url} alt={`${restaurant.name} logo`} className="w-full h-full object-cover" />
                  </div>
                )}
                
                <h1 className="text-lg font-bold">
                  {restaurant.name}
                </h1>
              </div>

              {/* Right side: Search icon only */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSearchToggle}
                  className="p-2 border-0 bg-transparent hover:bg-gray-100 focus:bg-transparent text-gray-800 hover:text-gray-600 transition-colors rounded-full"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Expandable Search Bar */}
          <ExpandableSearchBar
            isOpen={isExpandableSearchOpen}
            onClose={handleExpandableSearchClose}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            placeholder="Buscar platos..."
          />
        </div>

        {/* Sticky Section Navigation - always positioned below header with border-b */}
        <div className="sticky top-[74px] z-30 bg-background border-b">
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

        {/* Menu Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {filteredSections.length === 0 ? (
            <div className="text-center py-12">
              <Utensils className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron platos</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedAllergens.length > 0 || selectedDietTypes.length > 0 
                  ? 'Intenta ajustar los filtros o la búsqueda' 
                  : 'Este restaurante aún no tiene platos disponibles'}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredSections.map(section => (
                <div key={section.id} id={`section-${section.id}`}>
                  <RestaurantMenuSection section={section} restaurantId={restaurant.id} />
                </div>
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
