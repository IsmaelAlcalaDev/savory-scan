
import { useEffect } from "react";

export const ImprintPage = () => {
  useEffect(() => {
    console.log("ImprintPage mounted");
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Imprint</h1>
        <p className="text-muted-foreground">Imprint information coming soon...</p>
      </div>
    </div>
  );
};
