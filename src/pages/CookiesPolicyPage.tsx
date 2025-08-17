
import { useEffect } from "react";

export const CookiesPolicyPage = () => {
  useEffect(() => {
    console.log("CookiesPolicyPage mounted");
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Cookies Policy</h1>
        <p className="text-muted-foreground">Cookies policy content coming soon...</p>
      </div>
    </div>
  );
};
