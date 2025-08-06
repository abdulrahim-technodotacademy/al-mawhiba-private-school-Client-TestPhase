import NewRegistrationForPublic from '@/components/dashboard/NewRegistrationForPublic'
import NewStudentRegistrationForm from '@/components/dashboard/NewStudentRegistrationForm'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Home } from 'lucide-react'
import React from 'react'

function PublicRegistration() {
  return (
    <>
     {/* <DashboardLayout> */}
    {/* <NewRegistrationForPublic/> */}
      <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <img
                    className="h-8 w-auto"
                    src="/assets/logobr.png" // Replace with your logo path
                    alt="School Logo"
                  />
                 <span className="ml-2 text-base font-semibold text-gray-900 md:text-lg lg:text-xl">
      AL-MAWHIBA PRIVATE SCHOOL
    </span>
                </div>
              </div>
              <nav className="flex space-x-8">
                <a
                  href="/"
                  className="text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium"
                >
                  <Home className="h-5 w-5 mr-1" />
                  Home
                </a>
    
              </nav>
            </div>
          </div>
        </header>
    <NewStudentRegistrationForm/>
    {/* </DashboardLayout> */}
    </>
  )
}

export default PublicRegistration