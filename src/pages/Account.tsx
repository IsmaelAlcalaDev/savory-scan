
import { Helmet } from 'react-helmet-async';
import FoodieSpotLayout from '@/components/FoodieSpotLayout';

export default function Account() {
  return (
    <>
      <Helmet>
        <title>Mi Cuenta - FoodieSpot</title>
        <meta name="description" content="Gestiona tu cuenta de FoodieSpot" />
      </Helmet>
      
      <FoodieSpotLayout />
    </>
  );
}
