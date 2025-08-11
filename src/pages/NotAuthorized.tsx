// src/pages/NotAuthorized.tsx
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotAuthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">403 - Not Authorized</h1>
      <p>You don't have permission to access this page.</p>
      <Button onClick={() => navigate('/')}>Go to Home</Button>
    </div>
  );
};

export default NotAuthorized;