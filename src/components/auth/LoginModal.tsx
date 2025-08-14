import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, User, Lock, Building, X } from "lucide-react";
import { api } from "@/utils/axiosInterceptor";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navigation from "@/components/layout/Navigation";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { TokenService } from "@/services/tokenService";

interface TokenPayload {
  token_type: string;
  exp: number;
  iat: number;
  jti: string;
  user_id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  role_id: number;
  phone_number: string;
  is_admin: boolean;
  is_staff: boolean;
  is_superadmin: boolean;
  is_active: boolean;
  is_deleted: boolean;
  is_otp_enabled: boolean;
  permissions: string[];
}

// Token refresh threshold (5 minutes before expiration)
const REFRESH_THRESHOLD = 5 * 60 * 1000;

const userRoles = [
  {
    value: "registration",
    label: "Registration Officer",
    labelAr: "موظف تسجيل",
  },
  {
    value: "financial-Admin",
    label: "Financial Agreement Officer",
    labelAr: "موظف العقود المالية",
  },
  { 
    value: "School-admin", 
    label: "Accountant", 
    labelAr: "محاسب"
  },
  { 
    value: "accountant-Admin", 
    label: "Accountant Controller", 
    labelAr: "مراقب مالي" 
  },
  {
    value: "student-list",
    label: "Student List",
    labelAr: "قوائم الطلاب",
  },
];

const LoginPage = () => {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTimeout, setRefreshTimeout] = useState<NodeJS.Timeout | null>(null);

  // Clean up timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, [refreshTimeout]);

  const handleRoleClick = (role: string) => {
    if (role === "Addmission") {
      navigate("/student/addmission");
    } else {
      setActiveRole(role);
      setCredentials({
        email: "",
        password: "",
      });
    }
  };


const handleLogin = async (e: React.FormEvent, role: string) => {
  e.preventDefault();
  setIsLoading(true);

  if (!credentials.email || !credentials.password) {
    toast.error("Please fill in all fields");
    setIsLoading(false);
    return;
  }

  try {
    const response = await api.post("/accounts/login/", {
      email: credentials.email,
      password: credentials.password,
    });

    const { access, refresh } = response.data;
    const decoded: TokenPayload = jwtDecode(access);

     // Verify the user's role matches what they're trying to access
    const targetRole = userRoles.find(r => r.value === activeRole)?.label;
    if (decoded.role !== targetRole) {
      toast.error(`You are not authorized as a ${targetRole}`);
      throw new Error('Role mismatch');
    }

    // Use TokenService to handle tokens
    TokenService.setTokens(access, refresh);
    localStorage.setItem("userData", JSON.stringify(decoded));
    TokenService.scheduleTokenRefresh();

    toast.success(`Welcome ${decoded.first_name}!`);
    redirectBasedOnRole(decoded.role);

  } catch (error) {
    console.error("Login error:", error);
    if (axios.isAxiosError(error)) {
      toast.error(error.response?.data?.detail || "Invalid email or password");
    } else {
      toast.error(`You are not authorized as a your selected role`);
      toast.error("Login failed. Please try again.");
    }
  } finally {
    setIsLoading(false);
    setActiveRole(null);
  }
};

  const scheduleTokenRefresh = (expirationTime: number, refreshToken: string) => {
    // Clear any existing timeout
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }

    const now = Date.now();
    const expiresAt = expirationTime * 1000; // Convert to milliseconds
    const timeUntilRefresh = expiresAt - now - REFRESH_THRESHOLD;

    if (timeUntilRefresh > 0) {
      const timeout = setTimeout(() => {
        refreshTokenSilently(refreshToken);
      }, timeUntilRefresh);

      setRefreshTimeout(timeout);
    } else {
      // Token is already expired or about to expire, refresh immediately
      refreshTokenSilently(refreshToken);
    }
  };

  const refreshTokenSilently = async (refreshToken: string) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/accounts/token/refresh/`, {
        refresh: refreshToken,
      });

      const newAccessToken = response.data.access;
      localStorage.setItem("accessToken", newAccessToken);

      // Decode new token and schedule next refresh
      const decoded: TokenPayload = jwtDecode(newAccessToken);
      scheduleTokenRefresh(decoded.exp, refreshToken);

    } catch (error) {
      console.error("Token refresh failed:", error);
      // If refresh fails, try again after 1 minute
      setTimeout(() => {
        const storedRefresh = localStorage.getItem("refreshToken");
        if (storedRefresh) {
          refreshTokenSilently(storedRefresh);
        }
      }, 60000);
    }
  };

  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case "Registration Officer":
        navigate("/dashboard/registration");
        break;
      case "Financial Agreement Officer":
        navigate("/dashboard/financial");
        break;
      case "Accountant":
        navigate("/dashboard/admin");
        break;
      case "Accountant Controller":
        navigate("/dashboard/accountant");
        break;
      default:
        navigate("/dashboard");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />

      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col items-center mb-8 pt-4">
            <div className="bg-gradient-to-br mb-4 mt-6">
              <img src="/assets/logobr.png" alt="School Logo" width={"80px"} />
            </div>
            <h1 className="text-3xl font-bold text-center">
              School Management Portal
            </h1>
            <p className="text-center text-gray-600" dir="rtl">
              بوابة إدارة المدرسة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {userRoles.map((role) => (
              <Button
                key={role.value}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => handleRoleClick(role.value)}
              >
                <Building className="h-6 w-6" />
                <div>
                  <div>{role.label}</div>
                  <div className="text-sm" dir="rtl">
                    {role.labelAr}
                  </div>
                </div>
              </Button>
            ))}
          </div>

          <div className="text-center text-sm text-gray-500 mt-8">
            <p>Secure access to school management system</p>
            <p dir="rtl">وصول آمن لنظام إدارة المدرسة</p>
          </div>
        </div>

        {/* Modal for login form */}
        {activeRole && activeRole !== "Addmission" && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 p-1 h-8 w-8"
                onClick={() => setActiveRole(null)}
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </Button>

              <CardContent className="p-6 pt-10">
                <div className="flex items-center gap-2 mb-4">
                  <Building className="h-5 w-5" />
                  <h2 className="text-xl font-semibold">
                    {userRoles.find((r) => r.value === activeRole)?.label}
                  </h2>
                </div>

                <form
                  onSubmit={(e) => handleLogin(e, activeRole)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Email | البريد الإلكتروني
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email"
                      value={credentials.email}
                      onChange={(e) =>
                        setCredentials({
                          ...credentials,
                          email: e.target.value,
                        })
                      }
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password | كلمة المرور
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={credentials.password}
                      onChange={(e) =>
                        setCredentials({
                          ...credentials,
                          password: e.target.value,
                        })
                      }
                      className="h-12"
                    />
                  </div>

                  <Button
                    style={{ backgroundColor: "rgb(102,42,20)" }}
                    type="submit"
                    className="w-full h-12 text-white text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login | دخول"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default LoginPage;