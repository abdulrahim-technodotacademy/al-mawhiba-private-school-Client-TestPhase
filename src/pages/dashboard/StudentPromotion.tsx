import React from 'react';
import StudentPromotionPage from '@/components/dashboard/StudentPromotionPage';
import DashboardLayout from '@/components/layout/DashboardLayout';

const StudentPromotion = () => {
  return (
    <DashboardLayout>
      <StudentPromotionPage />
    </DashboardLayout>
  );
};

export default StudentPromotion;
