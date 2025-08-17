
import { useEffect } from "react";

const NotificationsPanel = () => {
  useEffect(() => {
    console.log("NotificationsPanel mounted");
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Notifications will be rendered here */}
    </div>
  );
};

export default NotificationsPanel;
