// src/components/auth/AuthWrapper.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TokenService } from '../../services/tokenService';


export const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      if (TokenService.isAccessTokenValid()) {
        TokenService.scheduleTokenRefresh();
        setIsChecking(false);
        return;
      }

      // Try to refresh token if access token is expired
      const refreshSuccess = await TokenService.refreshToken();
      if (refreshSuccess) {
        setIsChecking(false);
      } else {
        TokenService.clearTokens();
        navigate('/admin/login');
      }
    };

    checkAuth();
  }, [navigate]);

  if (isChecking) {
    return (
      // <div className="flex items-center justify-center h-screen">
      //   <Spinner className="h-12 w-12" />
      // </div>
      <>
      </>
    );
  }

  return <>{children}</>;
};