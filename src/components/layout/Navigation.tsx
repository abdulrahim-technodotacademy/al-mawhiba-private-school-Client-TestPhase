import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X, Globe } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [{ label: "Home", labelAr: "الرئيسية", href: "/" }];

  const isActive = (href: string) => location.pathname === href;

  const handleLogin = () => {
    navigate("/admin/login");
  };

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-lg z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className=" p-2 rounded-lg">
              {/* <img src="/assets/logo.png" alt="School Logo" width={'80px'} /> */}
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
                    ? "text-[rgb(102,42,20)] border-b-2  pb-1"
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
            <Button
              onClick={handleLogin}
              className="bg-[#79361C] hover:bg-[#662A14] text-white"
            >
              Login | دخول
            </Button>
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
                  style={{ backgroundColor: "rgb(102,42,20)", color: "white"   }}
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
                <Button
                  onClick={handleLogin}
                  className="text-[rgb(102,42,20)] hover:bg-blue-700 text-white"
                >
                  Login | دخول
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
