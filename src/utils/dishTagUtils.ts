
import type { Dish } from '@/hooks/useRestaurantMenu';

export interface PriorityTag {
  text: string;
  style: string;
  type: 'spice' | 'diet' | 'special';
}

export const generatePriorityTags = (dish: Dish): PriorityTag[] => {
  const tags: PriorityTag[] = [];

  // 1. Spice level tag (if > 0) - RED
  if (dish.spice_level > 0) {
    let spiceText = '';
    let spiceStyle = '';
    
    switch (dish.spice_level) {
      case 1:
        spiceText = 'Suave';
        spiceStyle = 'bg-red-100 text-red-800 border-red-200';
        break;
      case 2:
        spiceText = 'Medio';
        spiceStyle = 'bg-red-200 text-red-900 border-red-300';
        break;
      case 3:
        spiceText = 'Picante';
        spiceStyle = 'bg-red-300 text-red-900 border-red-400';
        break;
      default:
        spiceText = 'Muy Picante';
        spiceStyle = 'bg-red-400 text-red-900 border-red-500';
        break;
    }
    
    tags.push({
      text: spiceText,
      style: spiceStyle,
      type: 'spice'
    });
  }

  // 2. Diet tag (priority order: vegan > vegetarian > gluten_free > lactose_free > healthy) - GREEN
  if (dish.is_vegan) {
    tags.push({
      text: 'Vegano',
      style: 'bg-green-100 text-green-800 border-green-200',
      type: 'diet'
    });
  } else if (dish.is_vegetarian) {
    tags.push({
      text: 'Vegetariano',
      style: 'bg-green-200 text-green-900 border-green-300',
      type: 'diet'
    });
  } else if (dish.is_gluten_free) {
    tags.push({
      text: 'Sin Gluten',
      style: 'bg-green-100 text-green-800 border-green-200',
      type: 'diet'
    });
  } else if (dish.is_lactose_free) {
    tags.push({
      text: 'Sin Lactosa',
      style: 'bg-green-100 text-green-800 border-green-200',
      type: 'diet'
    });
  } else if (dish.is_healthy) {
    tags.push({
      text: 'Saludable',
      style: 'bg-green-100 text-green-800 border-green-200',
      type: 'diet'
    });
  }

  // 3. Special tag (first custom_tag if exists) - BLUE
  const customTags = Array.isArray(dish.custom_tags) ? dish.custom_tags : [];
  if (customTags.length > 0) {
    const specialTag = customTags[0];
    tags.push({
      text: specialTag,
      style: 'bg-blue-100 text-blue-800 border-blue-200',
      type: 'special'
    });
  }

  // Return maximum 3 tags
  return tags.slice(0, 3);
};
