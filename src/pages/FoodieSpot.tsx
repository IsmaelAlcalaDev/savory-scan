
import { Helmet } from 'react-helmet-async';
import FoodieSpotLayout from '@/components/FoodieSpotLayout';

export default function FoodieSpot() {
  return (
    <>
      <Helmet>
        <title>FoodieSpot - Delivery de Comida</title>
        <meta name="description" content="Encuentra los mejores restaurantes para delivery cerca de ti" />
      </Helmet>
      
      <FoodieSpotLayout initialTab="restaurants" />
    </>
  );
}
