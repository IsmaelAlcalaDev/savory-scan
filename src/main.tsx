
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Import all three applications
import ClientApp from "./apps/client/App";
import RestaurantApp from "./apps/restaurant/App";
import AdminApp from "./apps/admin/App";

// Determine which app to render based on the current path
const getApp = () => {
  const path = window.location.pathname;
  
  if (path.startsWith('/admin')) {
    return <AdminApp />;
  } else if (path.startsWith('/restaurant-panel')) {
    return <RestaurantApp />;
  } else {
    return <ClientApp />;
  }
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {getApp()}
  </StrictMode>
);
