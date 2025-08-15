
import type { Dish } from '@/hooks/useRestaurantMenu';

export interface PriorityTag {
  text: string;
  style: string;
  type: 'spice' | 'diet' | 'special';
}

export const generatePriorityTags = (dish: Dish): PriorityTag[] => {
  const tags: PriorityTag[] = [];

  // 1. Spice level tag (if > 0)
  if (dish.spice_level > 0) {
    let spiceText = '';
    let spiceStyle = '';
    
    switch (dish.spice_level) {
      case 1:
        spiceText = '🌶️ Suave';
        spiceStyle = 'bg-orange-100 text-orange-800 border-orange-200';
        break;
      case 2:
        spiceText = '🌶️ Medio';
        spiceStyle = 'bg-orange-200 text-orange-900 border-orange-300';
        break;
      case 3:
        spiceText = '🌶️ Picante';
        spiceStyle = 'bg-red-100 text-red-800 border-red-200';
        break;
      default:
        spiceText = '🌶️ Muy Picante';
        spiceStyle = 'bg-red-200 text-red-900 border-red-300';
        break;
    }
    
    tags.push({
      text: spiceText,
      style: spiceStyle,
      type: 'spice'
    });
  }

  // 2. Diet tag (priority order: vegan > vegetarian > gluten_free > lactose_free > healthy)
  if (dish.is_vegan) {
    tags.push({
      text: '🌱 Vegano',
      style: 'bg-green-100 text-green-800 border-green-200',
      type: 'diet'
    });
  } else if (dish.is_vegetarian) {
    tags.push({
      text: '🥬 Vegetariano',
      style: 'bg-green-50 text-green-700 border-green-200',
      type: 'diet'
    });
  } else if (dish.is_gluten_free) {
    tags.push({
      text: '🌾 Sin Gluten',
      style: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      type: 'diet'
    });
  } else if (dish.is_lactose_free) {
    tags.push({
      text: '🥛 Sin Lactosa',
      style: 'bg-blue-100 text-blue-800 border-blue-200',
      type: 'diet'
    });
  } else if (dish.is_healthy) {
    tags.push({
      text: '💚 Saludable',
      style: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      type: 'diet'
    });
  }

  // 3. Special tag (first custom_tag if exists)
  const customTags = Array.isArray(dish.custom_tags) ? dish.custom_tags : [];
  if (customTags.length > 0) {
    const specialTag = customTags[0];
    tags.push({
      text: specialTag,
      style: getSpecialTagStyle(specialTag),
      type: 'special'
    });
  }

  // Return maximum 3 tags
  return tags.slice(0, 3);
};

const getSpecialTagStyle = (tag: string): string => {
  const tagLower = tag.toLowerCase();
  
  if (tagLower.includes('chef') || tagLower.includes('recomendado')) {
    return 'bg-amber-100 text-amber-800 border-amber-200';
  }
  if (tagLower.includes('premiado') || tagLower.includes('premio')) {
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  }
  if (tagLower.includes('especialidad') || tagLower.includes('casa')) {
    return 'bg-blue-100 text-blue-800 border-blue-200';
  }
  if (tagLower.includes('nuevo') || tagLower.includes('novedad')) {
    return 'bg-red-100 text-red-800 border-red-200';
  }
  if (tagLower.includes('popular') || tagLower.includes('favorito')) {
    return 'bg-purple-100 text-purple-800 border-purple-200';
  }
  
  return 'bg-gray-100 text-gray-800 border-gray-200';
};
