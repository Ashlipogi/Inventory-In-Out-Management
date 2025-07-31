import React, { useState, useMemo } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Layout } from '@/Components/Layout';
import { ArrowUpFromLine, Package, TrendingDown, AlertTriangle, Search, Minus, X, ChevronLeft, ChevronRight, DollarSign, TrendingUp } from 'lucide-react';

interface Item {
  id: number;
  name: string;
  description: string;
  category: string;
  unit: string;
  amount: number;
  price: number;
  costprice: number;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
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
  items: Item[];
  units: Record<string, string>;
  statistics: {
    todayDispatched: number;
    thisWeekDispatched: number;
    lowStockAlerts: number;
    totalCostValue: number;
    totalSellingValue: number;
    totalPotentialProfit: number;
  };
  recentActivity: PullOutLog[];
  lowStockItems: Item[];
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function PullOut({ auth, systemSettings, items, units, statistics, recentActivity, lowStockItems, flash }: PullOutProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { data, setData, post, processing, errors, reset } = useForm({
    item_id: '',
    quantity: '',
    notes: '',
  });

const filteredItems = useMemo(() => {
  if (!searchTerm) return items;

  const term = searchTerm.toLowerCase();
  return items.filter(item => {
    const name = item.name?.toLowerCase() || '';
    const description = item.description?.toLowerCase() || '';
    const category = item.category?.toLowerCase() || '';
    const unit = (units[item.unit] || item.unit)?.toLowerCase() || '';

    return (
      name.includes(term) ||
      description.includes(term) ||
      category.includes(term) ||
      unit.includes(term)
    );
  });
}, [items, searchTerm, units]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, rowsPerPage]);

  const handlePullOut = (item: Item) => {
    setSelectedItem(item);
    setData('item_id', item.id.toString());
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    post(route('items.pull-out'), {
      onSuccess: () => {
        setIsModalOpen(false);
        setSelectedItem(null);
        reset();
      },
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    reset();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPaginationRange = () => {
    const range = [];
    const showPages = 5;
    let start = Math.max(1, currentPage - Math.floor(showPages / 2));
    let end = Math.min(totalPages, start + showPages - 1);

    if (end - start < showPages - 1) {
      start = Math.max(1, end - showPages + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  };

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

  const calculateProfitMargin = (price: number, costprice: number) => {
    if (costprice > 0) {
      return (((price - costprice) / costprice) * 100).toFixed(1);
    }
    return '0.0';
  };

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

      <div className="max-w-7xl mx-auto">
        {/* Success/Error Messages */}
        {flash?.success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <Package className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{flash.success}</p>
              </div>
            </div>
          </div>
        )}

        {flash?.error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{flash.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 bg-red-100 rounded-md">
                  <Package className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Today's Dispatched</dt>
                  <dd className="text-lg font-medium text-gray-900">{statistics.todayDispatched}</dd>
                </dl>
              </div>
              <div className="flex-shrink-0">
                <TrendingDown className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 bg-blue-100 rounded-md">
                  <TrendingDown className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">This Week</dt>
                  <dd className="text-lg font-medium text-gray-900">{statistics.thisWeekDispatched}</dd>
                </dl>
              </div>
              <div className="flex-shrink-0">
                <TrendingDown className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 bg-yellow-100 rounded-md">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Low Stock Alerts</dt>
                  <dd className="text-lg font-medium text-gray-900">{statistics.lowStockAlerts}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 bg-orange-100 rounded-md">
                  <TrendingDown className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Cost Value</dt>
                  <dd className="text-lg font-medium text-gray-900">₱{statistics.totalCostValue?.toFixed(2) || '0.00'}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 bg-green-100 rounded-md">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Selling Value</dt>
                  <dd className="text-lg font-medium text-gray-900">₱{statistics.totalSellingValue?.toFixed(2) || '0.00'}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 bg-emerald-100 rounded-md">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Potential Profit</dt>
                  <dd className="text-lg font-medium text-gray-900">₱{statistics.totalPotentialProfit?.toFixed(2) || '0.00'}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-3 mb-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <h3 className="font-medium text-yellow-800">Low Stock Items</h3>
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              The following items are running low and may need restocking soon.
            </p>
            <div className="space-y-2">
              {lowStockItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex justify-between items-center py-1">
                  <div className="flex-1">
                    <span className="text-sm text-yellow-800">{item.name}</span>
                    <span className="ml-2 text-xs text-yellow-600">
                      (Cost: ₱{parseFloat(item.costprice.toString()).toFixed(2)} •
                      Selling: ₱{parseFloat(item.price.toString()).toFixed(2)})
                    </span>
                  </div>
                  <span className="text-sm text-yellow-600">
                    {parseFloat(item.amount.toString()).toFixed(2)} {units[item.unit] || item.unit} left
                  </span>
                </div>
              ))}
              {lowStockItems.length > 5 && (
                <div className="text-sm text-yellow-700 pt-2">
                  And {lowStockItems.length - 5} more items...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Controls Section */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm w-full sm:w-64"
              />
            </div>

            {/* Rows per page selector */}
            <div className="flex items-center space-x-2">
              <label htmlFor="rowsPerPage" className="text-sm text-gray-700 whitespace-nowrap">
                Rows per page:
              </label>
              <select
                id="rowsPerPage"
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Items Selection Section */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md mb-8">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Select Items to Pull Out</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {searchTerm ? (
                    <>
                      {filteredItems.length} of {items.length} items
                      {searchTerm && (
                        <span className="ml-1">
                          matching "{searchTerm}"
                        </span>
                      )}
                    </>
                  ) : (
                    `${items.length} items available for dispatch`
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Available Inventory Value</p>
                <p className="text-2xl font-bold text-green-600">
                  ₱{items.reduce((total, item) => total + (parseFloat(item.amount.toString()) * parseFloat(item.price.toString())), 0).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  Cost: ₱{items.reduce((total, item) => total + (parseFloat(item.amount.toString()) * parseFloat(item.costprice.toString())), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? 'No items found' : 'No items available'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search terms.' : 'All items are out of stock.'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-500"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Available Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cost Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Selling Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Profit Margin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.description || 'No description'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`text-sm font-medium ${
                              parseFloat(item.amount.toString()) <= 10
                                ? 'text-red-600'
                                : parseFloat(item.amount.toString()) <= 20
                                  ? 'text-yellow-600'
                                  : 'text-gray-900'
                            }`}>
                              {parseFloat(item.amount.toString()).toFixed(2)}
                            </span>
                            {parseFloat(item.amount.toString()) <= 10 && (
                              <AlertTriangle className="h-4 w-4 text-red-500 ml-1" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {units[item.unit] || item.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₱{parseFloat(item.costprice.toString()).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₱{parseFloat(item.price.toString()).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            parseFloat(calculateProfitMargin(item.price, item.costprice)) > 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {calculateProfitMargin(item.price, item.costprice)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handlePullOut(item)}
                            disabled={parseFloat(item.amount.toString()) <= 0}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            <Minus className="h-4 w-4 mr-1" />
                            Pull Out
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(endIndex, filteredItems.length)}</span> of{' '}
                        <span className="font-medium">{filteredItems.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        {getPaginationRange().map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Pull Out Activity</h3>
          </div>
          {recentActivity.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
              <p className="mt-1 text-sm text-gray-500">Pull out some items to see activity here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <li key={activity.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ArrowUpFromLine className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {activity.item.name} - {parseFloat(activity.quantity.toString()).toFixed(2)} {units[activity.item.unit] || activity.item.unit}
                        </div>
                        <div className="text-sm text-gray-500">
                          {activity.item.category} • by {activity.user.name}
                          {activity.notes && (
                            <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                              {activity.notes}
                            </span>
                          )}
                          <span className="ml-2 text-xs bg-red-100 px-2 py-1 rounded text-red-800">
                            Cost: ₱{(parseFloat(activity.quantity.toString()) * parseFloat(activity.item.costprice.toString())).toFixed(2)}
                          </span>
                          <span className="ml-2 text-xs bg-green-100 px-2 py-1 rounded text-green-800">
                            Value: ₱{(parseFloat(activity.quantity.toString()) * parseFloat(activity.item.price.toString())).toFixed(2)}
                          </span>
                          <span className="ml-2 text-xs bg-blue-100 px-2 py-1 rounded text-blue-800">
                            Profit: ₱{(parseFloat(activity.quantity.toString()) * (parseFloat(activity.item.price.toString()) - parseFloat(activity.item.costprice.toString()))).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{formatRelativeTime(activity.created_at)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pull Out Modal */}
        {isModalOpen && selectedItem && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleSubmit}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Pull Out Item</h3>
                      <button
                        type="button"
                        onClick={closeModal}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Item Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{selectedItem.name}</h4>
                          <p className="text-sm text-gray-600">{selectedItem.description || 'No description'}</p>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <span>Category: {selectedItem.category}</span>
                            <span className={`font-medium ${
                              parseFloat(selectedItem.amount.toString()) <= 10 ? 'text-red-600' : 'text-gray-900'
                            }`}>
                              Available: {parseFloat(selectedItem.amount.toString()).toFixed(2)} {units[selectedItem.unit] || selectedItem.unit}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center space-x-4 text-sm">
                            <span className="text-gray-600">Cost: ₱{parseFloat(selectedItem.costprice.toString()).toFixed(2)}</span>
                            <span className="text-gray-600">Selling: ₱{parseFloat(selectedItem.price.toString()).toFixed(2)}</span>
                            <span className={`font-medium ${
                              parseFloat(calculateProfitMargin(selectedItem.price, selectedItem.costprice)) > 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}>
                              Margin: {calculateProfitMargin(selectedItem.price, selectedItem.costprice)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Quantity */}
                      <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                          Quantity to Pull Out
                        </label>
                        <input
                          type="number"
                          id="quantity"
                          step="0.01"
                          min="0.01"
                          max={selectedItem.amount}
                          value={data.quantity}
                          onChange={(e) => setData('quantity', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                          placeholder="Enter quantity"
                          required
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Maximum available: {parseFloat(selectedItem.amount.toString()).toFixed(2)} {units[selectedItem.unit] || selectedItem.unit}
                        </p>
                        {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
                      </div>

                      {/* Notes */}
                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                          Notes (Optional)
                        </label>
                        <textarea
                          id="notes"
                          value={data.notes}
                          onChange={(e) => setData('notes', e.target.value)}
                          rows={3}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                          placeholder="Add any notes about this pull out..."
                        />
                        {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                      </div>

                      {/* Summary */}
                      {data.quantity && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-red-800">
                              Remaining Stock:
                            </span>
                            <span className="text-sm font-bold text-red-800">
                              {(parseFloat(selectedItem.amount.toString()) - parseFloat(data.quantity || '0')).toFixed(2)} {units[selectedItem.unit] || selectedItem.unit}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-red-700">
                              Cost of Goods:
                            </span>
                            <span className="text-sm font-medium text-red-700">
                              ₱{(parseFloat(data.quantity || '0') * parseFloat(selectedItem.costprice.toString())).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-red-700">
                              Value Dispatched:
                            </span>
                            <span className="text-sm font-medium text-red-700">
                              ₱{(parseFloat(data.quantity || '0') * parseFloat(selectedItem.price.toString())).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-red-700">
                              Profit Realized:
                            </span>
                            <span className="text-sm font-bold text-red-700">
                              ₱{(parseFloat(data.quantity || '0') * (parseFloat(selectedItem.price.toString()) - parseFloat(selectedItem.costprice.toString()))).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                      {processing ? 'Processing...' : 'Pull Out Item'}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
