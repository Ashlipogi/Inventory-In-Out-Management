import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
}

export function Layout({ children, header }: LayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { auth, systemSettings } = usePage().props as any; // ✅ get both auth and systemSettings from Inertia props

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        user={auth?.user} // ✅ pass user to Sidebar
        systemSettings={systemSettings} // ✅ pass systemSettings to Sidebar
      />

      <div className={isSidebarCollapsed ? "pl-16" : "pl-64"}>
        {/* Header */}
        {header && (
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4 flex items-center">
              {/* Toggle button at the start when sidebar is collapsed */}
              {isSidebarCollapsed && (
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors mr-4"
                >
                  <Menu className="h-5 w-5" />
                </button>
              )}

              {/* Header content */}
              <div className="flex-1">
                {header}
              </div>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
