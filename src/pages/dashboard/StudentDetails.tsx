import StudentDetailsPage from '@/components/dashboard/StudentDetailsPage'
import DashboardLayout from '@/components/layout/DashboardLayout'
import React from 'react'

function StudentDetails() {
  return (
    <>
     <DashboardLayout>
   <StudentDetailsPage/>
    </DashboardLayout>
    </>
  )
}

export default StudentDetails