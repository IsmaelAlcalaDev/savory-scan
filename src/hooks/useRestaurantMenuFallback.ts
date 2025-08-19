
import { useState, useEffect } from 'react';
import type { MenuSection, Dish, DishVariant } from '@/types/dish';

interface UseRestaurantMenuFallbackProps {
  restaurantSlug: string;
}

export const useRestaurantMenuFallback = ({ restaurantSlug }: UseRestaurantMenuFallbackProps) => {
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simular carga de datos de prueba
    const loadFallbackData = () => {
      setLoading(true);
      
      // Crear variantes de prueba
      const createVariant = (id: number, dishId: number, name: string, price: number, isDefault: boolean = false): DishVariant => ({
        id,
        dish_id: dishId,
        name,
        price,
        display_order: 0,
        is_default: isDefault,
        created_at: new Date().toISOString()
      });

      // Crear platos de prueba
      const createDish = (id: number, name: string, description: string, price: number, variants: DishVariant[]): Dish => ({
        id,
        restaurant_id: 1,
        category_id: 1,
        section_id: 1,
        name,
        description,
        base_price: price,
        image_url: `/placeholder.svg`,
        image_alt: name,
        is_featured: false,
        is_active: true,
        is_healthy: false,
        is_vegetarian: false,
        is_vegan: false,
        is_gluten_free: false,
        is_lactose_free: false,
        spice_level: 0,
        preparation_time_minutes: 15,
        allergens: [],
        diet_types: [],
        custom_tags: [],
        favorites_count: 0,
        favorites_count_week: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        variants
      });

      const fallbackSections: MenuSection[] = [
        {
          id: 1,
          restaurant_id: 1,
          name: 'Entrantes',
          description: 'Deliciosos entrantes para comenzar',
          display_order: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          dishes: [
            createDish(1, 'Croquetas de Jamón', 'Croquetas caseras de jamón ibérico', 8.5, [
              createVariant(1, 1, 'Ración (6 unidades)', 8.5, true),
              createVariant(2, 1, 'Media ración (3 unidades)', 5.0, false)
            ]),
            createDish(2, 'Patatas Bravas', 'Patatas con salsa brava y alioli', 6.0, [
              createVariant(3, 2, 'Ración completa', 6.0, true)
            ])
          ]
        },
        {
          id: 2,
          restaurant_id: 1,
          name: 'Principales',
          description: 'Platos principales',
          display_order: 2,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          dishes: [
            createDish(3, 'Paella Valenciana', 'Paella tradicional con pollo y verduras', 16.0, [
              createVariant(4, 3, 'Para 2 personas', 16.0, true)
            ])
          ]
        }
      ];

      setTimeout(() => {
        setSections(fallbackSections);
        setLoading(false);
      }, 1000);
    };

    loadFallbackData();
  }, [restaurantSlug]);

  return {
    sections,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      // Recargar datos fallback
      setTimeout(() => setLoading(false), 1000);
    }
  };
};
