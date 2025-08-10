
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
          <h1 className="text-2xl font-bold mb-4">Descubre Restaurantes</h1>
          <p className="text-muted-foreground">
            Usa los filtros de la izquierda para encontrar exactamente lo que buscas.
          </p>
        </div>
      </FoodieSpotLayout>
    </>
  );
}
