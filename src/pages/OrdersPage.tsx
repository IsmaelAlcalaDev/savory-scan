
import { useEffect } from "react";

const OrdersPage = () => {
  useEffect(() => {
    console.log("OrdersPage mounted");
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">My Orders</h1>
        <p className="text-muted-foreground">Your order history will appear here...</p>
      </div>
    </div>
  );
};

export default OrdersPage;
