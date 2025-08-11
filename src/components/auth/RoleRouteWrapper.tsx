// src/components/auth/RoleRouteWrapper.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TokenService } from '../../services/tokenService';

interface RoleRouteWrapperProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export const RoleRouteWrapper = ({ allowedRoles, children }: RoleRouteWrapperProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthorization = () => {
      const accessToken = TokenService.getAccessToken();
      const userData = localStorage.getItem('userData');
      
      if (!accessToken || !userData) {
        navigate('/admin/login');
        return;
      }

      try {
        const user = JSON.parse(userData);
        if (!allowedRoles.includes(user.role)) {
          
          navigate('/dashboard/not-authorized');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/admin/login');
      }
    };

    checkAuthorization();
  }, [navigate, allowedRoles]);

  return <>{children}</>;
};