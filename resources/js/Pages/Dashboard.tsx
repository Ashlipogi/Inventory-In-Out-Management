
import React from 'react';
import { Layout } from '@/Components/Layout';
import { Users, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  return (
    <Layout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Dashbasdoard
        </h2>
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
