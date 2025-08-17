
import { useEffect } from "react";

const ProfilePage = () => {
  useEffect(() => {
    console.log("ProfilePage mounted");
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">User Profile</h1>
        <p className="text-muted-foreground">Profile settings coming soon...</p>
      </div>
    </div>
  );
};

export default ProfilePage;
