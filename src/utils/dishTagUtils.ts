import type { Dish } from '@/hooks/useRestaurantMenu';

export interface PriorityTag {
  text: string;
  style: string;
  type: 'spice' | 'special';
}

export interface DietaryIcon {
  type: 'vegetarian' | 'vegan' | 'gluten-free';
  style: string;
}

export const generateSpecialTags = (dish: Dish): PriorityTag[] => {
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

  // 2. Special tag (first custom_tag if exists) - BLUE
  const customTags = Array.isArray(dish.custom_tags) ? dish.custom_tags : [];
  if (customTags.length > 0) {
    const specialTag = customTags[0];
    tags.push({
      text: specialTag,
      style: 'bg-blue-100 text-blue-800 border-blue-200',
      type: 'special'
    });
  }

  // Return maximum 2 special tags
  return tags.slice(0, 2);
};

export const generateDietaryIcons = (dish: Dish): DietaryIcon[] => {
  const icons: DietaryIcon[] = [];

  // Priority order: vegan > vegetarian > gluten_free
  if (dish.is_vegan) {
    icons.push({
      type: 'vegan',
      style: 'text-green-600'
    });
  } else if (dish.is_vegetarian) {
    icons.push({
      type: 'vegetarian',
      style: 'text-green-500'
    });
  }

  if (dish.is_gluten_free) {
    icons.push({
      type: 'gluten-free',
      style: 'text-blue-600'
    });
  }

  return icons;
};

// Keep backward compatibility
export const generatePriorityTags = (dish: Dish): PriorityTag[] => {
  return generateSpecialTags(dish);
};
