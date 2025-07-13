import React from 'react';
import { Head } from '@inertiajs/react';
import { Layout } from '@/Components/Layout';
import {
  Home,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface Item {
  id: number;
  name: string;
  description: string;
  category: string;
  unit: string;
  amount: number;
  price: number;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface PullInLog {
  id: number;
  item_id: number;
  quantity: number;
  notes: string;
  created_at: string;
  item: Item;
  user: User;
}

interface PullOutLog {
  id: number;
  item_id: number;
  quantity: number;
  notes: string;
  created_at: string;
  item: Item;
  user: User;
}

interface CategoryStat {
  category: string;
  count: number;
  total_value: number;
  total_quantity: number;
}

interface MonthlyTrend {
  month: string;
  pull_ins: number;
  pull_outs: number;
}

interface DashboardProps {
  auth: {
    user: {
      name: string;
      email: string;
      profile_picture_url?: string;
    };
  };
  systemSettings?: {
    id: number;
    system_name: string;
    system_image: string | null;
    system_image_url: string | null;
  };
  statistics: {
    inventory: {
      total_items: number;
      total_value: number;
      low_stock_items: number;
      out_of_stock_items: number;
    };
    pull_ins: {
      today: number;
      weekly: number;
      monthly: number;
      total_value: number;
    };
    pull_outs: {
      today: number;
      weekly: number;
      monthly: number;
      total_value: number;
    };
  };
  recent_activities: {
    pull_ins: PullInLog[];
    pull_outs: PullOutLog[];
  };
  top_items_by_value: Item[];
  low_stock_items: Item[];
  category_stats: CategoryStat[];
  monthly_trends: MonthlyTrend[];
  units: Record<string, string>;
}

export default function Dashboard({
  auth,
  systemSettings,
  statistics,
  recent_activities,
  top_items_by_value,
  low_stock_items,
  category_stats,
  monthly_trends,
  units
}: DashboardProps) {
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Layout
      header={
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Home className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">Overview of your inventory management system</p>
          </div>
        </div>
      }
    >
      <Head title="Dashboard" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Message */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Welcome back, {auth.user.name}!
          </h2>
          <p className="text-gray-600">
            Here's what's happening with your inventory today.
          </p>
        </div>

        {/* Main Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.inventory.total_items}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Inventory Value */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">₱{parseFloat(statistics.inventory.total_value.toString()).toFixed(2)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Low Stock Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{statistics.inventory.low_stock_items}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Out of Stock */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{statistics.inventory.out_of_stock_items}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Package className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Pull In/Out Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pull In Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <ArrowDownRight className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Pull In Statistics</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Today</span>
                <span className="text-sm font-medium text-gray-900">{statistics.pull_ins.today} items</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Week</span>
                <span className="text-sm font-medium text-gray-900">{statistics.pull_ins.weekly} items</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="text-sm font-medium text-gray-900">{statistics.pull_ins.monthly} items</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-600">Total Value</span>
                <span className="text-sm font-bold text-green-600">₱{parseFloat(statistics.pull_ins.total_value.toString()).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Pull Out Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <ArrowUpRight className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Pull Out Statistics</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Today</span>
                <span className="text-sm font-medium text-gray-900">{statistics.pull_outs.today} items</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Week</span>
                <span className="text-sm font-medium text-gray-900">{statistics.pull_outs.weekly} items</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="text-sm font-medium text-gray-900">{statistics.pull_outs.monthly} items</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-600">Total Value</span>
                <span className="text-sm font-bold text-red-600">₱{parseFloat(statistics.pull_outs.total_value.toString()).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Monthly Trends</h3>
            </div>
            <div className="space-y-3">
              {monthly_trends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{trend.month}</span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-500">In: {trend.pull_ins}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-xs text-gray-500">Out: {trend.pull_outs}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <PieChart className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Category Breakdown</h3>
            </div>
            <div className="space-y-3">
              {category_stats.slice(0, 5).map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">{category.category}</span>
                      <span className="text-sm text-gray-500">{category.count} items</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">₱{parseFloat(category.total_value.toString()).toFixed(2)}</span>
                      <span className="text-xs text-gray-500">{parseFloat(category.total_quantity.toString()).toFixed(2)} units</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Items and Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Items by Value */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Top Items by Value</h3>
            </div>
            <div className="space-y-3">
              {top_items_by_value.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                      <span className="text-sm font-bold text-green-600">
                        ₱{(parseFloat(item.amount.toString()) * parseFloat(item.price.toString())).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">{item.category}</span>
                      <span className="text-xs text-gray-500">
                        {parseFloat(item.amount.toString()).toFixed(2)} {units[item.unit] || item.unit}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Low Stock Items</h3>
            </div>
            {low_stock_items.length === 0 ? (
              <p className="text-sm text-gray-500">No low stock items</p>
            ) : (
              <div className="space-y-3">
                {low_stock_items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                        <span className="text-sm font-medium text-red-600">
                          {parseFloat(item.amount.toString()).toFixed(2)} {units[item.unit] || item.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">{item.category}</span>
                        <span className="text-xs text-yellow-600">Low Stock</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Pull Ins */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Recent Pull Ins</h3>
            </div>
            {recent_activities.pull_ins.length === 0 ? (
              <p className="text-sm text-gray-500">No recent pull in activity</p>
            ) : (
              <div className="space-y-3">
                {recent_activities.pull_ins.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">{activity.item.name}</span>
                        <span className="text-sm text-green-600">
                          +{parseFloat(activity.quantity.toString()).toFixed(2)} {units[activity.item.unit] || activity.item.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">by {activity.user.name}</span>
                        <span className="text-xs text-gray-500">{formatRelativeTime(activity.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Pull Outs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Activity className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Recent Pull Outs</h3>
            </div>
            {recent_activities.pull_outs.length === 0 ? (
              <p className="text-sm text-gray-500">No recent pull out activity</p>
            ) : (
              <div className="space-y-3">
                {recent_activities.pull_outs.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">{activity.item.name}</span>
                        <span className="text-sm text-red-600">
                          -{parseFloat(activity.quantity.toString()).toFixed(2)} {units[activity.item.unit] || activity.item.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">by {activity.user.name}</span>
                        <span className="text-xs text-gray-500">{formatRelativeTime(activity.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
