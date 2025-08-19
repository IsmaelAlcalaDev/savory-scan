
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Phone, Globe, ChevronLeft, Star, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import DishCard from '@/components/DishCard';
import DishSearchBar from '@/components/DishSearchBar';
import OrderSimulatorModal from '@/components/OrderSimulatorModal';
import { Separator } from "@/components/ui/separator"
import { useNavigate } from 'react-router-dom';
import type { Dish } from '@/hooks/useRestaurantMenu';

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
  const navigate = useNavigate();

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

      <div className="container mx-auto p-4 md:p-8">
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

        {/* Order Simulator Modal */}
        <OrderSimulatorModal />
      </div>
    </div>
  );
}
