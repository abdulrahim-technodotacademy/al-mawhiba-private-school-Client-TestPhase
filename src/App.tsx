import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Academics from "./pages/Academics";
import Admissions from "./pages/Admissions";
import Contact from "./pages/Contact";
import Registration from "./pages/dashboard/Registration";
import Financial from "./pages/dashboard/Financial";
import Accountant from "./pages/dashboard/Accountant";
import StudentList from "./pages/dashboard/StudentList";
import Admin from "./pages/dashboard/Admin";
import NotFound from "./pages/NotFound";
import LoginModal from "./components/auth/LoginModal";
import NewStudentRegistrationForm from "./components/dashboard/NewStudentRegistrationForm";
import { RoleRouteWrapper } from "./components/auth/RoleRouteWrapper";
import StudentDetails from "./pages/dashboard/StudentDetails";
import StudentPromotion from "./pages/dashboard/StudentPromotion";
import PublicRegistration from "./pages/PublicRegistration";
import { TokenService } from "./services/tokenService";
import { useEffect } from "react";
import { AuthWrapper } from "./components/auth/AuthWrapper";
import NotAuthorized from "./pages/NotAuthorized";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize token refresh when app loads if user is logged in
    if (TokenService.getAccessToken()) {
      TokenService.scheduleTokenRefresh();
    }

    return () => {
      // Cleanup on unmount if needed
    };
  }, []);

  return (
       <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/academics" element={<Academics />} />
            <Route path="/admissions" element={<Admissions />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin/login" element={<LoginModal />} />
            <Route path="/student/newregisterforpublic" element={<PublicRegistration />} />

            {/* Protected routes */}
            <Route element={<AuthWrapper><Outlet /></AuthWrapper>}>
              <Route 
                path="/dashboard/registration" 
                element={
                  <RoleRouteWrapper allowedRoles={["Registration Officer"]}>
                    <Registration />
                  </RoleRouteWrapper>
                } 
              />
              <Route 
                path="/dashboard/financial" 
                element={
                  <RoleRouteWrapper allowedRoles={["Financial Agreement Officer"]}>
                    <Financial />
                  </RoleRouteWrapper>
                } 
              />
              <Route 
                path="/dashboard/accountant" 
                element={
                  <RoleRouteWrapper allowedRoles={["Accountant Controller"]}>
                    <Accountant />
                  </RoleRouteWrapper>
                } 
              />
              <Route 
                path="/dashboard/admin" 
                element={
                  <RoleRouteWrapper allowedRoles={["Accountant"]}>
                    <Admin />
                  </RoleRouteWrapper>
                } 
              />
              <Route 
                path="/dashboard/student-list" 
                element={
                  <RoleRouteWrapper allowedRoles={["Student List"]}>
                    <StudentList />
                  </RoleRouteWrapper>
                } 
              />
              <Route path="/student/addmission" element={<NewStudentRegistrationForm />} />
              <Route path="/student/:id" element={<StudentDetails />} />
              <Route path="/student/promote/:id" element={<StudentPromotion />} />
              <Route path="/dashboard/not-authorized" element={<NotAuthorized />} />
            </Route>
            
            {/* Not found route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;