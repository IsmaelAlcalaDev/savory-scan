import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import { useRestaurantMenu } from '@/hooks/useRestaurantMenu';
import { useIsMobile } from '@/hooks/use-mobile';
import MenuSectionTabs from '@/components/MenuSectionTabs';
import RestaurantMenuSection from '@/components/RestaurantMenuSection';
import MenuFilters from '@/components/MenuFilters';
import DishSearchBar from '@/components/DishSearchBar';
import type { DishVariant } from '@/types/dish';

interface Restaurant {
  id: string;
  name: string;
  address: string;
  city: string;
  cuisine: string;
  rating: number;
  cover_image: string;
  phone_number: string;
  website: string;
  latitude: number;
  longitude: number;
}

export default function RestaurantMenu() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  // Mock data para testing - eliminar cuando la BD esté lista
  const mockVariants: DishVariant[] = [
    {
      id: 1,
      dish_id: 1,
      name: 'Ración completa',
      price: 12.50,
      display_order: 0,
      is_default: true,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      dish_id: 1,
      name: 'Media ración',
      price: 8.00,
      display_order: 1,
      is_default: false,
      created_at: new Date().toISOString()
    }
  ];

  useEffect(() => {
    const fetchRestaurantAndDishes = async () => {
      setLoading(true);
      try {
        // Simulación de llamada a la API
        await new Promise(resolve => setTimeout(resolve, 500));

        const mockRestaurant: Restaurant = {
          id: restaurantId || '1',
          name: 'Delicious Italian Cuisine',
          address: '123 Main St, Anytown',
          city: 'Anytown',
          cuisine: 'Italian',
          rating: 4.5,
          cover_image: '/images/restaurant-cover.jpg',
          phone_number: '555-123-4567',
          website: 'https://example.com',
          latitude: 34.0522,
          longitude: -118.2437,
        };
        setRestaurant(mockRestaurant);

        const mockDishes: Dish[] = [
          {
            id: 1,
            name: 'Margherita Pizza',
            description: 'Classic pizza with tomato, mozzarella, and basil',
            base_price: 12.99,
            image_url: '/images/margherita-pizza.jpg',
            image_alt: 'Margherita Pizza',
            is_featured: true,
            is_vegetarian: true,
            is_vegan: false,
            is_gluten_free: false,
            is_lactose_free: false,
            is_healthy: false,
            spice_level: 0,
            preparation_time_minutes: 15,
            favorites_count: 25,
            category_name: 'Pizza',
            allergens: ['gluten', 'dairy'],
            custom_tags: ['popular'],
            variants: [
              {
                id: 1,
                name: 'Personal',
                price: 12.99,
                is_default: true
              },
              {
                id: 2,
                name: 'Familiar',
                price: 18.99,
                is_default: false
              }
            ]
          },
          {
            id: 2,
            name: 'Spaghetti Carbonara',
            description: 'Spaghetti with eggs, pancetta, Parmesan, and black pepper',
            base_price: 14.99,
            image_url: '/images/spaghetti-carbonara.jpg',
            image_alt: 'Spaghetti Carbonara',
            is_featured: false,
            is_vegetarian: false,
            is_vegan: false,
            is_gluten_free: false,
            is_lactose_free: false,
            is_healthy: false,
            spice_level: 0,
            preparation_time_minutes: 20,
            favorites_count: 18,
            category_name: 'Pasta',
            allergens: ['gluten', 'eggs', 'dairy'],
            custom_tags: ['classic'],
            variants: [
              {
                id: 3,
                name: 'Regular',
                price: 14.99,
                is_default: true
              }
            ]
          },
          {
            id: 3,
            name: 'Tiramisu',
            description: 'Coffee-flavored Italian dessert',
            base_price: 7.99,
            image_url: '/images/tiramisu.jpg',
            image_alt: 'Tiramisu',
            is_featured: false,
            is_vegetarian: true,
            is_vegan: false,
            is_gluten_free: false,
            is_lactose_free: false,
            is_healthy: false,
            spice_level: 0,
            preparation_time_minutes: 5,
            favorites_count: 32,
            category_name: 'Dessert',
            allergens: ['eggs', 'dairy', 'gluten'],
            custom_tags: ['dessert', 'coffee'],
            variants: [
              {
                id: 4,
                name: 'Individual',
                price: 7.99,
                is_default: true
              }
            ]
          },
        ];
        setDishes(mockDishes);
      } catch (error) {
        console.error('Failed to fetch restaurant or dishes', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantAndDishes();
  }, [restaurantId]);

  const filteredDishes = dishes.filter(dish =>
    dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dish.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const mockMenuSections = [
    {
      id: 1,
      name: 'Entrantes',
      dishes: [
        {
          id: 1,
          name: 'Croquetas de Jamón',
          description: 'Deliciosas croquetas caseras',
          base_price: 12.50,
          image_url: '/placeholder.svg',
          variants: [{
            id: 1,
            dish_id: 1,
            name: 'Ración completa',
            price: 12.50,
            display_order: 0,
            is_default: true,
            created_at: new Date().toISOString()
          }]
        }
      ]
    },
    {
      id: 2,
      name: 'Principales',
      dishes: [
        {
          id: 2,
          name: 'Paella Valenciana',
          description: 'Paella tradicional con ingredientes frescos',
          base_price: 18.00,
          image_url: '/placeholder.svg',
          variants: [{
            id: 2,
            dish_id: 2,
            name: 'Para 2 personas',
            price: 18.00,
            display_order: 0,
            is_default: true,
            created_at: new Date().toISOString()
          }]
        }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-10 w-32 mb-4" />
        <Skeleton className="h-40 w-full mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return <div className="container mx-auto p-4">Restaurant not found</div>;
  }

  return (
    <>
      <Helmet>
        <title>{restaurant?.name ? `Carta de ${restaurant.name}` : 'Carta del Restaurante'}</title>
        <meta name="description" content={`Descubre la carta completa de ${restaurant?.name || 'nuestro restaurante'} con todos sus platos y precios actualizados.`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Restaurant Cover */}
        <div className="relative">
          <img
            src={restaurant.cover_image}
            alt={restaurant.name}
            className="w-full h-64 object-cover"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 left-2 md:top-4 md:left-4 bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {loading ? (
            <div className="space-y-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Error al cargar la carta</p>
            </div>
          ) : (
            <>
              {/* Restaurant Info */}
              <div className="mb-6">
                <h1 className="text-3xl font-semibold mb-2">{restaurant.name}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Star className="h-4 w-4" />
                  <span>{restaurant.rating}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>{restaurant.cuisine}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{restaurant.address}, {restaurant.city}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <Button variant="outline" className="w-full md:w-auto">
                  <Phone className="h-4 w-4 mr-2" />
                  {restaurant.phone_number}
                </Button>
                <Button variant="outline" className="w-full md:w-auto">
                  <Globe className="h-4 w-4 mr-2" />
                  <a href={restaurant.website} target="_blank" rel="noopener noreferrer">
                    Website
                  </a>
                </Button>
              </div>

              {/* Search Bar */}
              <div className="mb-4">
                <DishSearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  placeholder="Buscar platos..."
                />
              </div>

              {/* Menu */}
              <div className="mb-4">
                <h2 className="text-2xl font-semibold mb-3">Menu</h2>
                <ScrollArea className="h-[400px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDishes.map(dish => (
                      <DishCard 
                        key={dish.id} 
                        dish={dish} 
                        restaurantId={parseInt(restaurantId || '1')}
                        expandedDishId={null}
                        onExpandedChange={() => {}}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {mockMenuSections.length > 0 && (
                <RestaurantMenuSection
                  sections={mockMenuSections}
                  searchQuery={searchQuery}
                  activeFilters={{}}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
