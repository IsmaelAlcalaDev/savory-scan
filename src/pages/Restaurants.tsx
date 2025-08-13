
import { Helmet } from 'react-helmet-async';
import FoodieSpotLayout from '@/components/FoodieSpotLayout';

export default function Restaurants() {
  return (
    <>
      <Helmet>
        <title>Restaurantes - FoodieSpot</title>
        <meta name="description" content="Encuentra los mejores restaurantes para delivery cerca de ti" />
        <meta property="og:title" content="Restaurantes - FoodieSpot" />
        <meta property="og:description" content="Encuentra los mejores restaurantes para delivery cerca de ti" />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <FoodieSpotLayout initialTab="restaurants" />
    </>
  );
}
