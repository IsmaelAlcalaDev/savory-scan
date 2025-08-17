
import { useEffect } from "react";

export const PrivacyPolicyPage = () => {
  useEffect(() => {
    console.log("PrivacyPolicyPage mounted");
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground">Privacy policy content coming soon...</p>
      </div>
    </div>
  );
};
