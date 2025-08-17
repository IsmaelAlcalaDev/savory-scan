
import { useEffect } from "react";

export const TermsOfServicePage = () => {
  useEffect(() => {
    console.log("TermsOfServicePage mounted");
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground">Terms of service content coming soon...</p>
      </div>
    </div>
  );
};
