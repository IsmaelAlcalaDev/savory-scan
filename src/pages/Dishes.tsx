
import { Helmet } from 'react-helmet-async';
import UpdatedDishes from './UpdatedDishes';

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
      
      <UpdatedDishes />
    </>
  );
}
