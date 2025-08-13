
import { Helmet } from 'react-helmet-async';
import FoodieSpotLayout from '@/components/FoodieSpotLayout';

export default function FoodieSpot() {
  return (
    <>
      <Helmet>
        <title>FoodieSpot - Delivery de Comida</title>
        <meta name="description" content="Encuentra los mejores restaurantes para delivery cerca de ti" />
      </Helmet>
      
      <FoodieSpotLayout>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Restaurantes Disponibles</h2>
          <p className="text-muted-foreground">Aquí se mostrarán los restaurantes disponibles...</p>
        </div>
      </FoodieSpotLayout>
    </>
  );
}
