import React from 'react';
import { Head } from '@inertiajs/react';
import { Layout } from '@/Components/Layout';
import { ArrowUpFromLine, Package, TrendingDown, AlertTriangle } from 'lucide-react';

interface PullOutProps {
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
}

export default function PullOut({ auth, systemSettings }: PullOutProps) {
  return (
    <Layout
      header={
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <ArrowUpFromLine className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pull Out</h1>
            <p className="text-sm text-gray-600">Dispatch and track outgoing inventory</p>
          </div>
        </div>
      }
    >
      <Head title="Pull Out" />

      <div className="max-w-4xl mx-auto">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-100 rounded-full">
              <ArrowUpFromLine className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">This is Pull Out</h2>
              <p className="text-gray-600 mt-1">
                Welcome to the Pull Out page. Here you can dispatch items, track outgoing shipments, and manage inventory distribution.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Dispatched</p>
                <p className="text-2xl font-bold text-gray-900">18</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Package className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">89</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingDown className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <ArrowUpFromLine className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="font-medium text-gray-900">Quick Dispatch</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Quickly dispatch items by scanning barcodes or entering requisition details.
            </p>
            <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Start Dispatching
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900">Bulk Dispatch</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Process multiple items at once for large orders or department requests.
            </p>
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Bulk Process
            </button>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h3 className="font-medium text-yellow-800">Low Stock Items</h3>
          </div>
          <p className="text-sm text-yellow-700 mb-3">
            The following items are running low and may need restocking soon.
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-yellow-800">Office Paper A4</span>
              <span className="text-sm text-yellow-600">5 units left</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-yellow-800">Printer Cartridge</span>
              <span className="text-sm text-yellow-600">3 units left</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-yellow-800">USB Cables</span>
              <span className="text-sm text-yellow-600">2 units left</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Pull Out Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-900">IT Equipment - 15 units</span>
              </div>
              <span className="text-sm text-gray-500">1 hour ago</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-900">Stationery - 20 units</span>
              </div>
              <span className="text-sm text-gray-500">3 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-900">Cleaning Supplies - 10 units</span>
              </div>
              <span className="text-sm text-gray-500">Yesterday</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
