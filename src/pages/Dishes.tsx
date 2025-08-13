
import { Helmet } from 'react-helmet-async';
import FoodieSpotLayout from '@/components/FoodieSpotLayout';

export default function Dishes() {
  return (
    <>
      <Helmet>
        <title>Platos - FoodieSpot</title>
        <meta name="description" content="Descubre los mejores platos cerca de ti. Explora una gran variedad de comidas deliciosas de restaurantes locales." />
        <meta property="og:title" content="Platos - FoodieSpot" />
        <meta property="og:description" content="Descubre los mejores platos cerca de ti. Explora una gran variedad de comidas deliciosas de restaurantes locales." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <FoodieSpotLayout>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Platos Disponibles</h2>
          <p className="text-muted-foreground">Aquí se mostrarán los platos disponibles...</p>
        </div>
      </FoodieSpotLayout>
    </>
  );
}
