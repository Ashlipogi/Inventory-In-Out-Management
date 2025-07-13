
import React from 'react';
import { Layout } from '@/Components/Layout';
import { Home } from 'lucide-react';

export default function Dashboard() {
  return (
    <Layout
      header={
                       <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Home className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">Edit your Profile Information</p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Welcome Message */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-600">
            You're logged in! Here's what's happening with your application today.
          </p>
        </div>



      </div>
    </Layout>
  );
}
