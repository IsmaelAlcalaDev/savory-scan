
import { Helmet } from 'react-helmet-async';
import FoodieSpotLayout from '@/components/FoodieSpotLayout';

export default function Index() {
  return (
    <>
      <Helmet>
        <title>FoodieSpot - Descubre los mejores restaurantes y platos</title>
        <meta name="description" content="Encuentra los mejores restaurantes y platos cerca de ti. Explora reseñas, horarios y ofertas especiales." />
        <meta property="og:title" content="FoodieSpot - Descubre los mejores restaurantes y platos" />
        <meta property="og:description" content="Encuentra los mejores restaurantes y platos cerca de ti. Explora reseñas, horarios y ofertas especiales." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <FoodieSpotLayout />
    </>
  );
}
