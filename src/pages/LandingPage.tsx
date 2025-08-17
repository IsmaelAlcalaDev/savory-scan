
import { useEffect } from "react";

const LandingPage = () => {
  useEffect(() => {
    console.log("LandingPage mounted");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to FoodieSpot</h1>
        <p className="text-xl text-muted-foreground mb-4">Discover amazing restaurants and dishes</p>
        <a href="/search" className="text-primary hover:text-primary/80 underline">
          Start Exploring
        </a>
      </div>
    </div>
  );
};

export default LandingPage;
