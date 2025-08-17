
import { useParams } from "react-router-dom";
import { useEffect } from "react";

const RestaurantPage = () => {
  const { restaurantSlug } = useParams();

  useEffect(() => {
    console.log("RestaurantPage mounted for slug:", restaurantSlug);
  }, [restaurantSlug]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Restaurant Details</h1>
        <p className="text-muted-foreground">Restaurant slug: {restaurantSlug}</p>
      </div>
    </div>
  );
};

export default RestaurantPage;
