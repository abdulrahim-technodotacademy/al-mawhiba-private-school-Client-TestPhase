import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Home, User, LayoutDashboard, Globe, ChevronLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserData {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const userDataString = localStorage.getItem("userData");
    if (userDataString) {
      try {
        setUserData(JSON.parse(userDataString));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className="h-20 bg-white border-b border-gray-100 px-4 sm:px-8 flex items-center shrink-0 shadow-sm z-10">
        <div className="flex-1 flex items-center justify-between">
          <div className="flex items-center space-x-4">
             {/* Global Back Button */}
             {location.pathname !== "/" && location.pathname !== "/dashboard" && location.pathname !== "/dashboard/registration" && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate(-1)}
                  className="rounded-full hover:bg-gray-100 mr-2 border border-gray-100 shadow-sm"
                  title="Go Back | الرجوع"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </Button>
             )}
             
             <div 
               className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity" 
               onClick={() => navigate("/")}
             >
               <img src="/assets/logobr.png" alt="School Logo" className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
               <div className="hidden xs:block">
                 <h1 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">AL-MAWHIBA PRIVATE SCHOOL</h1>
                 <p className="text-[10px] sm:text-xs text-gray-500 leading-tight font-medium" dir="rtl">مدرسة الموهبة الخاصة</p>
               </div>
             </div>
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-6">
            <div className="hidden lg:block text-right border-r border-gray-200 pr-6 mr-2">
              <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">School Management System</p>
              <p className="text-[10px] text-gray-500 font-medium" dir="rtl">نظام إدارة المدرسة</p>
            </div>
            
            {userData && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-11 w-11 rounded-full ring-2 ring-[rgb(102,42,20)]/10 hover:ring-[rgb(102,42,20)]/30 transition-all p-0 overflow-hidden ring-offset-2">
                    <Avatar className="h-full w-full">
                      <AvatarFallback className="bg-[rgb(102,42,20)] text-white text-sm font-bold">
                        {userData.first_name?.charAt(0)}{userData.last_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 mt-2 p-2" align="end">
                  <DropdownMenuLabel className="font-normal p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none text-gray-900">
                        {userData.first_name} {userData.last_name}
                      </p>
                      <p className="text-[11px] leading-none text-[rgb(102,42,20)] font-bold uppercase tracking-tighter mt-1 bg-[rgb(102,42,20)]/5 py-1 px-2 rounded inline-block w-fit">
                        {userData.role}
                      </p>
                      <p className="text-[10px] leading-none text-gray-400 mt-2 truncate">
                        {userData.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate("/")}
                    className="cursor-pointer py-3 rounded-md hover:bg-gray-50 focus:bg-gray-50 group"
                  >
                    <Home className="h-4 w-4 mr-3 text-gray-500 group-hover:text-[rgb(102,42,20)] transition-colors" />
                    <span className="font-medium">Home | الرئيسية</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer py-3 rounded-md text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600 group"
                  >
                    <LogOut className="h-4 w-4 mr-3 text-red-500 group-hover:text-red-600 transition-colors" />
                    <span className="font-bold">Sign Out | خروج</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;