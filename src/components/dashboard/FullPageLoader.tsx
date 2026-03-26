import { Loader2 } from 'lucide-react'
import React from 'react'

function FullPageLoader() {
  return (
    <div className="fixed inset-0 bg-white/70 dark:bg-gray-900/70 z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Outer transparent circle */}
          <div className="w-20 h-20 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
          
          {/* Spinning inner circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  )
}

export default FullPageLoader