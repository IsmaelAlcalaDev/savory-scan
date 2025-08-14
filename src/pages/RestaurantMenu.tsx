
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Star, MapPin, Utensils } from 'lucide-react';
import { useRestaurantProfile } from '@/hooks/useRestaurantProfile';
import { useRestaurantMenuFallback } from '@/hooks/useRestaurantMenuFallback';
import { type Dish } from '@/hooks/useRestaurantMenu';
import DishModal from '@/components/DishModal';
import RestaurantMenuSection from '@/components/RestaurantMenuSection';
import MenuFilters from '@/components/MenuFilters';
import DishSearchBar from '@/components/DishSearchBar';
import MenuSectionTabs from '@/components/MenuSectionTabs';
import LanguageSelector from '@/components/LanguageSelector';
import { useState, useEffect, useMemo } from 'react';

export default function RestaurantMenu() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { restaurant, loading: restaurantLoading, error: restaurantError } = useRestaurantProfile(slug || '');
  const { sections, loading: sectionsLoading, error: sectionsError } = useRestaurantMenuFallback(restaurant?.id || 0);
  
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  
  // Filter states
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [selectedDietTypes, setSelectedDietTypes] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<number | undefined>();

  const handleDishClick = (dish: Dish) => {
    setSelectedDish(dish);
    setIsDishModalOpen(true);
  };

  const closeDishModal = () => {
    setIsDishModalOpen(false);
    setSelectedDish(null);
  };

  const handleGoBack = () => {
    navigate(`/restaurant/${slug}`);
  };

  const handleSectionClick = (sectionId: number) => {
    setActiveSection(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Filter sections and dishes based on active filters
  const filteredSections = useMemo(() => {
    if (!sections) return [];

    return sections.map(section => {
      let filteredDishes = section.dishes;

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filteredDishes = filteredDishes.filter(dish =>
          dish.name.toLowerCase().includes(query) ||
          dish.description?.toLowerCase().includes(query)
        );
      }

      // Apply allergen filter (exclude dishes that contain selected allergens)
      if (selectedAllergens.length > 0) {
        filteredDishes = filteredDishes.filter(dish => {
          const dishAllergens = dish.allergens || [];
          return !selectedAllergens.some(allergen => 
            dishAllergens.includes(allergen)
          );
        });
      }

      // Apply diet type filter
      if (selectedDietTypes.length > 0) {
        filteredDishes = filteredDishes.filter(dish => {
          return selectedDietTypes.some(dietTypeId => {
            switch (dietTypeId) {
              case 1: return dish.is_vegetarian; // Assuming ID 1 is vegetarian
              case 2: return dish.is_vegan; // Assuming ID 2 is vegan
              case 3: return dish.is_gluten_free; // Assuming ID 3 is gluten-free
              case 4: return dish.is_lactose_free; // Assuming ID 4 is lactose-free
              case 5: return dish.is_healthy; // Assuming ID 5 is healthy
              default: return false;
            }
          });
        });
      }

      return {
        ...section,
        dishes: filteredDishes
      };
    }).filter(section => section.dishes.length > 0); // Only show sections with dishes
  }, [sections, searchQuery, selectedAllergens, selectedDietTypes]);

  // Set initial active section
  useEffect(() => {
    if (filteredSections.length > 0 && !activeSection) {
      setActiveSection(filteredSections[0].id);
    }
  }, [filteredSections, activeSection]);

  console.log('RestaurantMenu: Rendering with slug:', slug);
  console.log('RestaurantMenu: Restaurant data:', { restaurant, restaurantLoading, restaurantError });
  console.log('RestaurantMenu: Sections data:', { sections, sectionsLoading, sectionsError });

  if (restaurantLoading || sectionsLoading) {
    console.log('RestaurantMenu: Showing loading state');
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (restaurantError || sectionsError || !restaurant) {
    console.log('RestaurantMenu: Showing error state:', restaurantError || sectionsError);
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Restaurante no encontrado</h1>
            <p className="text-muted-foreground mb-4">Error: {restaurantError || sectionsError}</p>
            <Button onClick={() => navigate('/restaurantes')}>
              Volver a restaurantes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  console.log('RestaurantMenu: Restaurant found, ID:', restaurant.id);

  return (
    <>
      <Helmet>
        <title>Carta de {restaurant.name} | SavorySearch</title>
        <meta name="description" content={`Explora la carta completa de ${restaurant.name}. Descubre todos nuestros platos y encuentra tu favorito.`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header Navigation */}
        <div className="bg-muted/30 border-b sticky top-0 z-40 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Button>

                {restaurant.logo_url && (
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-border flex-shrink-0">
                    <img 
                      src={restaurant.logo_url} 
                      alt={`${restaurant.name} logo`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div>
                  <h1 className="text-lg font-bold flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-primary" />
                    {restaurant.name}
                  </h1>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{restaurant.address}</span>
                    {restaurant.google_rating && (
                      <>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{restaurant.google_rating}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <LanguageSelector />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-background border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2 w-full sm:w-auto">
                <MenuFilters
                  selectedAllergens={selectedAllergens}
                  selectedDietTypes={selectedDietTypes}
                  onAllergenChange={setSelectedAllergens}
                  onDietTypeChange={setSelectedDietTypes}
                />
              </div>
              
              <div className="w-full sm:w-80">
                <DishSearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  placeholder="Buscar platos..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        <MenuSectionTabs
          sections={filteredSections}
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
        />

        {/* Menu Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {filteredSections.length === 0 ? (
            <div className="text-center py-12">
              <Utensils className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron platos</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedAllergens.length > 0 || selectedDietTypes.length > 0
                  ? 'Intenta ajustar los filtros o la búsqueda'
                  : 'Este restaurante aún no tiene platos disponibles'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {filteredSections.map((section) => (
                <div key={section.id} id={`section-${section.id}`}>
                  <RestaurantMenuSection
                    section={section}
                    restaurantId={restaurant.id}
                    onDishClick={handleDishClick}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dish Modal */}
        <DishModal
          dish={selectedDish}
          restaurantId={restaurant.id}
          isOpen={isDishModalOpen}
          onClose={closeDishModal}
        />
      </div>
    </>
  );
}
