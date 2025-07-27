import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import {ChevronLeft,} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
interface LayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
}

export function Layout({ children, header }: LayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { auth, systemSettings, flash } = usePage().props as any; // ✅ get both auth and systemSettings from Inertia props


useEffect(() => {
  if (flash?.success) {
    toast.success(flash.success);
  }

  if (flash?.error) {
    toast.error(flash.error);
  }
}, [flash]);

  return (
    <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" reverseOrder={false}/>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        user={auth?.user} // ✅ pass user to Sidebar
        systemSettings={systemSettings}
      />

      <div className={isSidebarCollapsed ? "pl-16" : "pl-64"}>
        {/* Header */}
        {header && (
          <header className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b border-gray-200" style={{ marginLeft: isSidebarCollapsed ? '4rem' : '16rem' }}>

            <div className="px-6 py-4 flex items-center">
              {/* Toggle button at the start when sidebar is collapsed */}
                <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors mr-4"
                >
                {isSidebarCollapsed ? (
                    <Menu className="h-5 w-5" />
                ) : (
                    <ChevronLeft className="h-5 w-5" />
                )}
                </button>
              {/* Header content */}
              <div className="flex-1">
                {header}
              </div>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className="p-6 pt-24">
          {children}
        </main>
      </div>
    </div>
  );
}
