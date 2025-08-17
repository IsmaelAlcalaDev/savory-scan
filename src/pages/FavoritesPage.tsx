
import { useEffect } from "react";

const FavoritesPage = () => {
  useEffect(() => {
    console.log("FavoritesPage mounted");
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">My Favorites</h1>
        <p className="text-muted-foreground">Your favorite restaurants and dishes will appear here...</p>
      </div>
    </div>
  );
};

export default FavoritesPage;
