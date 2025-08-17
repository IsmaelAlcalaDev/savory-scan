
import { useEffect } from "react";

const SearchPage = () => {
  useEffect(() => {
    console.log("SearchPage mounted");
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Search Restaurants</h1>
        <p className="text-muted-foreground">Search functionality coming soon...</p>
      </div>
    </div>
  );
};

export default SearchPage;
