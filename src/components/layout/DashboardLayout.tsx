import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, LogOut, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    // Remove access token from localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-16'}`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className=" p-2 rounded-lg">
              <img src="/assets/logobr.png" alt="School Logo" width={'40px'} />
            </div>
            {isSidebarOpen && (
              <div>
                <h1 className="text-lg font-bold text-gray-900">School Portal</h1>
                <p className="text-sm text-gray-600" dir="rtl">بوابة المدرسة</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate("/")}
          >
            <Home className="h-4 w-4" />
            {isSidebarOpen && <span className="ml-2">Home | الرئيسية</span>}
          </Button>
        </div>

        {/* <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {isSidebarOpen && <span className="ml-2">Logout | تسجيل خروج</span>}
          </Button>
        </div> */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            
            <div className="text-right">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Logout</span>
              </Button>

              <p className="text-sm text-gray-600">Welcome to School Management System</p>
              <p className="text-xs text-gray-500" dir="rtl">مرحباً بك في نظام إدارة المدرسة</p>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;