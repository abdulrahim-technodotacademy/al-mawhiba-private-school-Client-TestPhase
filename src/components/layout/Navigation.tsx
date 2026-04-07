import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X, Globe, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutDashboard, LogOut as LogOutIcon, User as UserIcon, Settings } from "lucide-react";

interface UserData {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  // other fields from your token
}

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userDataString = localStorage.getItem("userData");
    
    setIsLoggedIn(!!token);
    
    if (userDataString) {
      try {
        const data: UserData = JSON.parse(userDataString);
        setUserData(data);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [location]);

  const navItems = [{ label: "Home", labelAr: "الرئيسية", href: "/" }];

  const isActive = (href: string) => location.pathname === href;

  const handleLogin = () => {
    navigate("/admin/login");
  };

  const getDashboardPath = (role: string) => {
    const rolePaths: Record<string, string> = {
      "Registration Officer": "/dashboard/registration",
      "Financial Agreement Officer": "/dashboard/financial",
      "Accountant": "/dashboard/admin",
      "Accountant Controller": "/dashboard/accountant",
      "Student List": "/dashboard/student-list"
    };
    return rolePaths[role] || "/dashboard";
  };

  const handleDashboard = () => {
    if (userData?.role) {
      navigate(getDashboardPath(userData.role));
    } else {
      navigate("/dashboard");
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
    setUserData(null);
    navigate("/");
  };

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-lg z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="p-2 rounded-lg">
              <img src="/assets/logobr.png" alt="School Logo" width={"80px"} />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-gray-900">
                AL-MAWHIBA PRIVATE SCHOOL
              </h1>
              <p className="text-xs sm:text-sm text-gray-600" dir="rtl">
                مدرسة دول مجلس التعاون
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                style={{
                  borderBottom: isActive(item.href)
                    ? "2px solid rgb(102,42,20)"
                    : "none",
                }}
                className={`transition-colors duration-200 font-medium ${
                  isActive(item.href)
                    ? "text-[rgb(102,42,20)] border-b-2 pb-1"
                    : "text-gray-700 hover:text-[rgb(102,42,20)]"
                }`}
              >
                {language === "en" ? item.label : item.labelAr}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === "en" ? "ar" : "en")}
              className="text-gray-600 hover:text-[rgb(102,42,20)]"
            >
              <Globe className="h-4 w-4 mr-1" />
              {language === "en" ? "عربي" : "English"}
            </Button>
            
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-[rgb(102,42,20)]/10 hover:ring-[rgb(102,42,20)]/30 transition-all p-0 overflow-hidden">
                      <Avatar className="h-full w-full">
                        <AvatarFallback className="bg-[rgb(102,42,20)] text-white text-xs font-bold">
                          {userData?.first_name?.charAt(0)}{userData?.last_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 mt-2 p-2" align="end">
                    <DropdownMenuLabel className="font-normal p-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none text-gray-900">
                          {userData?.first_name} {userData?.last_name}
                        </p>
                        <p className="text-xs leading-none text-gray-500 italic">
                          {userData?.role}
                        </p>
                        <p className="text-[10px] leading-none text-gray-400 mt-1">
                          {userData?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleDashboard}
                      className="cursor-pointer py-2.5 rounded-md hover:bg-gray-50 focus:bg-gray-50 group"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-3 text-gray-500 group-hover:text-[rgb(102,42,20)] transition-colors" />
                      <span className="font-medium">{language === "en" ? "Dashboard" : "لوحة التحكم"}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="cursor-pointer py-2.5 rounded-md text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600 group"
                    >
                      <LogOutIcon className="h-4 w-4 mr-3 text-red-500 group-hover:text-red-600 transition-colors" />
                      <span className="font-bold">{language === "en" ? "Sign Out" : "تسجيل خروج"}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button
                onClick={handleLogin}
                className="bg-[#79361C] hover:bg-[#662A14] text-white"
              >
                {language === "en" ? "Login" : "دخول"} | {language === "en" ? "دخول" : "Login"}
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 mt-4">
            <div className="flex flex-col space-y-4 pt-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`transition-all duration-200 font-bold px-4 py-3 rounded-lg flex items-center justify-between ${
                    isActive(item.href)
                      ? "bg-[rgb(102,42,20)] text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>{language === "en" ? item.label : item.labelAr}</span>
                  {isActive(item.href) && <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
                </Link>
              ))}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLanguage(language === "en" ? "ar" : "en")}
                  className="text-gray-600 hover:text-[rgb(102,42,20)]"
                >
                  <Globe className="h-4 w-4 mr-1" />
                  {language === "en" ? "عربي" : "English"}
                </Button>
                
                {isLoggedIn ? (
                  <div className="flex flex-col space-y-3 w-full">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <Avatar className="h-10 w-10 ring-2 ring-[rgb(102,42,20)]/20">
                        <AvatarFallback className="bg-[rgb(102,42,20)] text-white text-xs font-bold">
                          {userData?.first_name?.charAt(0)}{userData?.last_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{userData?.first_name} {userData?.last_name}</span>
                        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{userData?.role}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => {
                          handleDashboard();
                          setIsMenuOpen(false);
                        }}
                        className="bg-[rgb(102,42,20)] hover:bg-[rgb(80,30,15)] text-white font-bold h-11"
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        {language === "en" ? "Dashboard" : "لوحة التحكم"}
                      </Button>
                      <Button
                        onClick={() => {
                          handleSignOut();
                          setIsMenuOpen(false);
                        }}
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 border-red-200 font-bold h-11"
                      >
                        <LogOutIcon className="h-4 w-4 mr-2" />
                        {language === "en" ? "Sign Out" : "خروج"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      handleLogin();
                      setIsMenuOpen(false);
                    }}
                    className="bg-[#79361C] hover:bg-[#662A14] text-white"
                  >
                    {language === "en" ? "Login" : "دخول"} | {language === "en" ? "دخول" : "Login"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;