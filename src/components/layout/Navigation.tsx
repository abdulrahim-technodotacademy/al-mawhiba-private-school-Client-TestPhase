import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X, Globe, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{userData?.first_name || "Account"}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={handleDashboard}
                      className="cursor-pointer"
                    >
                      {language === "en" ? "Dashboard" : "لوحة التحكم"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="cursor-pointer text-red-600"
                    >
                      {language === "en" ? "Sign Out" : "تسجيل خروج"}
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
                  style={{ backgroundColor: "rgb(102,42,20)", color: "white" }}
                  key={item.href}
                  to={item.href}
                  className={`transition-colors duration-200 font-medium px-2 py-1 ${
                    isActive(item.href)
                      ? "text-[rgb(102,42,20)]"
                      : "text-gray-700 hover:text-[rgb(102,42,20)]"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {language === "en" ? item.label : item.labelAr}
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
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => {
                        handleDashboard();
                        setIsMenuOpen(false);
                      }}
                      className="bg-[#79361C] hover:bg-[#662A14] text-white"
                    >
                      {language === "en" ? "Dashboard" : "لوحة التحكم"}
                    </Button>
                    <Button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      variant="outline"
                      className="text-[#79361C] hover:bg-[#f3e9e5] border-[#79361C]"
                    >
                      {language === "en" ? "Sign Out" : "تسجيل خروج"}
                    </Button>
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