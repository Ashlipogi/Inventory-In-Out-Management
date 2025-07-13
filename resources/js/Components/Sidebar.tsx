import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import {
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Building2,
  Package,
  ChevronDown,
  Plus
} from 'lucide-react';

interface SystemSettings {
  id: number;
  system_name: string;
  system_image: string | null;
  system_image_url: string | null;
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  user?: {
    name: string;
    email: string;
    profile_picture_url?: string;
  };
  systemSettings?: SystemSettings;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function Sidebar({ isCollapsed, onToggle, user, systemSettings }: SidebarProps) {
  const [imageError, setImageError] = useState(false);
  const [systemImageError, setSystemImageError] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Debug: Log systemSettings to console
  console.log('Current systemSettings:', systemSettings);
  console.log('Current pathname:', window.location.pathname);

  const handleNavClick = (href: string) => {
    router.visit(href);
  };

  const handleLogout = () => {
    router.post('/logout');
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleSystemImageError = () => {
    setSystemImageError(true);
  };

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const isActive = (routes: string | string[]) => {
    const currentPath = window.location.pathname;
    if (typeof routes === 'string') {
      return currentPath === routes;
    }
    return routes.some(route => currentPath === route);
  };

  // Use a fallback system name if systemSettings is undefined or system_name is not available
  const displaySystemName = systemSettings?.system_name || 'System';
  const displaySystemImage = systemSettings?.system_image_url;

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-screen z-40 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center p-4 border-b border-gray-200 min-w-0">
        {!isCollapsed && (
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
              {displaySystemImage && !systemImageError ? (
                <img
                  src={displaySystemImage}
                  alt={displaySystemName}
                  className="w-full h-full object-cover rounded"
                  onError={handleSystemImageError}
                />
              ) : (
                <div className="w-full h-full bg-gray-800 text-white rounded flex items-center justify-center">
                  <span className="font-bold text-sm">
                    {displaySystemName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <span
              className="text-lg font-semibold text-gray-800 truncate min-w-0"
              title={displaySystemName}
            >
              {displaySystemName}
            </span>
          </div>
        )}

        {isCollapsed && (
          <div className="flex items-center justify-center w-full">
            <div className="w-6 h-6 rounded flex items-center justify-center overflow-hidden">
              {displaySystemImage && !systemImageError ? (
                <img
                  src={displaySystemImage}
                  alt={displaySystemName}
                  className="w-full h-full object-cover rounded"
                  onError={handleSystemImageError}
                />
              ) : (
                <div className="w-full h-full bg-gray-800 text-white rounded flex items-center justify-center">
                  <span className="font-bold text-xs">
                    {displaySystemName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Toggle button only shows when sidebar is expanded */}
        {!isCollapsed && (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors flex-shrink-0 ml-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-0.5">
        {navigationItems.map((item) => {
          const isActiveItem = window.location.pathname === item.href;
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              onClick={() => handleNavClick(item.href)}
              className={cn(
                "w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
                isActiveItem
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="ml-3">{item.name}</span>
              )}
            </button>
          );
        })}

        {/* Add Item Dropdown */}
        <div className="space-y-0.5">
  <button
    onClick={() => toggleDropdown("Item")}
    className={cn(
      "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
      isActive(["/add-item", "/pull-in", "/pull-out"]) || activeDropdown === "Item"
        ? "bg-gray-100 text-gray-900"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    )}
  >
    <div className="flex items-center">
      <Plus className="h-5 w-5 flex-shrink-0" />
      {!isCollapsed && <span className="ml-3">Item</span>}
    </div>
    {!isCollapsed && (
      <ChevronDown
        className={cn(
          "h-4 w-4 transition-transform",
          activeDropdown === "Item" ? "rotate-180" : ""
        )}
      />
    )}
  </button>

  {activeDropdown === "Item" && !isCollapsed && (
    <div className="ml-5 mt-2 border-l border-gray-300 pl-4 space-y-1">
      <button
        onClick={() => router.get('/add-item')}
        className={cn(
          "relative block w-full px-4 py-2 rounded-md text-sm text-left transition-colors hover:bg-gray-50",
          isActive("/add-item")
            ? "bg-gray-100 text-gray-500"
            : "text-gray-600 hover:text-gray-900",
          "before:absolute before:-left-4 before:top-1/2 before:h-0.5 before:w-3 before:bg-gray-300"
        )}
      >
        Add Item
      </button>

      <button
        onClick={() => router.get('/pull-in')}
        className={cn(
          "relative block w-full px-4 py-2 rounded-md text-sm text-left transition-colors hover:bg-gray-50",
          isActive("/pull-in")
            ? "bg-gray-100 text-gray-500"
            : "text-gray-600 hover:text-gray-900",
          "before:absolute before:-left-4 before:top-1/2 before:h-0.5 before:w-3 before:bg-gray-300"
        )}
      >
        Pull In
      </button>

      <button
        onClick={() => router.get('/pull-out')}
        className={cn(
          "relative block w-full px-4 py-2 rounded-md text-sm text-left transition-colors hover:bg-gray-50",
          isActive("/pull-out")
            ? "bg-gray-100 text-gray-500"
            : "text-gray-600 hover:text-gray-900",
          "before:absolute before:-left-4 before:top-1/2 before:h-0.5 before:w-3 before:bg-gray-300"
        )}
      >
        Pull Out
      </button>
    </div>
  )}
</div>
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-200 p-2 pt-1">
        <div className={cn(
          "flex items-center rounded-md transition-colors",
          isCollapsed ? "justify-center p-2" : "p-3"
        )}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
            {user?.profile_picture_url && !imageError ? (
              <img
                src={user.profile_picture_url}
                alt={user.name || 'User'}
                className="w-full h-full object-cover rounded-full"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
            )}
          </div>
          {!isCollapsed && user && (
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors",
            isCollapsed ? "justify-center p-2" : "px-3 py-2"
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span className="ml-3">Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
