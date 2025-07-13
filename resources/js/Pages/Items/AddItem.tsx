import React from 'react';
import { Head } from '@inertiajs/react';
import { Layout } from '@/Components/Layout';
import { Plus, Package, AlertCircle } from 'lucide-react';

interface AddItemProps {
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

export default function AddItem({ auth, systemSettings }: AddItemProps) {
  return (
    <Layout
      header={
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Plus className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Item</h1>
            <p className="text-sm text-gray-600">Create new items in your inventory</p>
          </div>
        </div>
      }
    >
      <Head title="Add Item" />

      <div className="max-w-4xl mx-auto">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">This is Add Item</h2>
              <p className="text-gray-600 mt-1">
                Welcome to the Add Item page. Here you can create and manage new items for your inventory system.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Plus className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900">Quick Add</h3>
            </div>
            <p className="text-sm text-gray-600">
              Quickly add new items to your inventory with essential information.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900">Bulk Import</h3>
            </div>
            <p className="text-sm text-gray-600">
              Import multiple items at once using CSV or Excel files.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="font-medium text-gray-900">Categories</h3>
            </div>
            <p className="text-sm text-gray-600">
              Organize your items by creating and assigning categories.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Add New Item
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Import Items
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Manage Categories
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
