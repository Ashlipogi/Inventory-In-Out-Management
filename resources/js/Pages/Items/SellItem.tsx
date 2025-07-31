import React, { useState, useMemo } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Layout } from '@/Components/Layout';
import { ShoppingCart, Package, AlertCircle, DollarSign, X, Search, ChevronLeft, ChevronRight, TrendingUp, Clock, TrendingDown, Calculator, Target } from 'lucide-react';

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
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface SellLogEntry {
  id: number;
  item_id: number;
  quantity: number;
  selling_price: number;
  total_amount: number;
  notes: string;
  created_at: string;
  item: Item;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface SellItemProps {
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
    todaySold: number;
    thisWeekSold: number;
    todayRevenue: number;
    thisWeekRevenue: number;
    totalItems: number;
    totalCostValue: number;
    totalSellingValue: number;
    totalPotentialProfit: number;
  };
  recentActivity: SellLogEntry[];
  lowStockItems: Item[];
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function SellItem({ auth, systemSettings, items, units, statistics, recentActivity, lowStockItems, flash }: SellItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { data, setData, post, processing, errors, reset } = useForm({
    item_id: '',
    quantity: '',
    selling_price: '',
    notes: '',
  });

  // Filter items based on search term
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    post(route('items.sell'), {
      onSuccess: () => {
        setIsModalOpen(false);
        setSelectedItem(null);
        reset();
      },
    });
  };

  const handleSellItem = (item: Item) => {
    setSelectedItem(item);
    setData({
      item_id: item.id.toString(),
      quantity: '',
      selling_price: item.price.toString(),
      notes: '',
    });
    setIsModalOpen(true);
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

  const calculateTotalAmount = () => {
    if (data.quantity && data.selling_price) {
      return parseFloat(data.quantity) * parseFloat(data.selling_price);
    }
    return 0;
  };

  const calculateProfit = () => {
    if (selectedItem && data.quantity && data.selling_price) {
      const quantity = parseFloat(data.quantity);
      const sellingPrice = parseFloat(data.selling_price);
      const costPrice = selectedItem.costprice;
      return quantity * (sellingPrice - costPrice);
    }
    return 0;
  };

  return (
    <Layout
      header={
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <ShoppingCart className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sell Item</h1>
            <p className="text-sm text-gray-600">Sell items from your inventory</p>
          </div>
        </div>
      }
    >
      <Head title="Sell Item" />

      <div className="max-w-7xl mx-auto">
        {/* Success/Error Messages */}
        {flash?.success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-green-400" />
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
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{flash.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 bg-green-100 rounded-md">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Today's Sales</dt>
                  <dd className="text-lg font-medium text-gray-900">{statistics.todaySold}</dd>
                </dl>
              </div>
              <div className="flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 bg-blue-100 rounded-md">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">This Week</dt>
                  <dd className="text-lg font-medium text-gray-900">{statistics.thisWeekSold}</dd>
                </dl>
              </div>
              <div className="flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 bg-emerald-100 rounded-md">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Today's Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">₱{statistics.todayRevenue?.toFixed(2) ?? '0.00'}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 bg-purple-100 rounded-md">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Week Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">₱{statistics.thisWeekRevenue?.toFixed(2) ?? '0.00'}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 bg-yellow-100 rounded-md">
                  <Package className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Available Items</dt>
                  <dd className="text-lg font-medium text-gray-900">{statistics.totalItems}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 bg-indigo-100 rounded-md">
                  <Calculator className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Potential Value</dt>
                  <dd className="text-lg font-medium text-gray-900">₱{statistics.totalSellingValue?.toFixed(2) ?? '0.00'}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

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
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 sm:text-sm w-full sm:w-64"
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
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
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

        {/* Items Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md mb-8">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Available Items</h3>
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
                    `${items.length} items available for sale`
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Potential Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ₱{statistics.totalSellingValue?.toFixed(2) ?? '0.00'}
                </p>
                <p className="text-sm text-gray-500">
                  Potential Profit: ₱{statistics.totalPotentialProfit?.toFixed(2) ?? '0.00'}
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
                {searchTerm ? 'Try adjusting your search terms.' : 'No items are currently available for sale.'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-sm text-green-600 hover:text-green-500"
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
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cost Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Profit/Unit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.description || 'No description'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {parseFloat(item.amount.toString()).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {units[item.unit] || item.unit}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₱{parseFloat(item.price.toString()).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                          ₱{parseFloat(item.costprice.toString()).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-emerald-600">
                            ₱{(parseFloat(item.price.toString()) - parseFloat(item.costprice.toString())).toFixed(2)}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                            parseFloat(calculateProfitMargin(item.price, item.costprice)) > 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {calculateProfitMargin(item.price, item.costprice)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          ₱{(parseFloat(item.amount.toString()) * parseFloat(item.price.toString())).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleSellItem(item)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Sell
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
                                ? 'z-10 bg-green-50 border-green-500 text-green-600'
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

        {/* Recent Sales Activity */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Sales Activity</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Latest item sales and transactions</p>
          </div>
          {recentActivity.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent sales</h3>
              <p className="mt-1 text-sm text-gray-500">Start selling items to see activity here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {recentActivity.map((sale) => (
                <li key={sale.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <ShoppingCart className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          Sold: {sale.item.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Quantity: {parseFloat(sale.quantity.toString()).toFixed(2)} {units[sale.item.unit] || sale.item.unit}
                          • Price: ₱{parseFloat(sale.selling_price.toString()).toFixed(2)}
                          • Revenue: ₱{parseFloat(sale.total_amount.toString()).toFixed(2)}
                          • by {sale.user.name}
                        </div>
                        {sale.notes && (
                          <div className="text-xs text-gray-400 mt-1">
                            Notes: {sale.notes}
                          </div>
                        )}
                        <div className="flex space-x-2 mt-1">
                          <span className="text-xs bg-green-100 px-2 py-1 rounded text-green-800">
                            Revenue: ₱{parseFloat(sale.total_amount.toString()).toFixed(2)}
                          </span>
                          <span className="text-xs bg-emerald-100 px-2 py-1 rounded text-emerald-800">
                            Profit: ₱{(parseFloat(sale.quantity.toString()) * (parseFloat(sale.selling_price.toString()) - parseFloat(sale.item.costprice.toString()))).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{formatRelativeTime(sale.created_at)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Sell Modal */}
        {isModalOpen && selectedItem && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleSubmit}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Sell Item: {selectedItem.name}
                      </h3>
                      <button
                        type="button"
                        onClick={closeModal}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Item Details */}
                      <div className="bg-gray-50 p-4 rounded-md">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Available Stock:</span>
                          <span className="font-medium text-gray-900">
                            {parseFloat(selectedItem.amount.toString()).toFixed(2)} {units[selectedItem.unit] || selectedItem.unit}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Recommended Price:</span>
                          <span className="font-medium text-gray-900">
                            ₱{parseFloat(selectedItem.price.toString()).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Cost Price:</span>
                          <span className="font-medium text-gray-900">
                            ₱{parseFloat(selectedItem.costprice.toString()).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Quantity */}
                      <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                          Quantity to Sell
                        </label>
                        <input
                          type="number"
                          id="quantity"
                          step="0.01"
                          min="0.01"
                          max={selectedItem.amount}
                          value={data.quantity}
                          onChange={(e) => setData('quantity', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          placeholder={`Max: ${selectedItem.amount}`}
                          required
                        />
                        {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
                      </div>

                      {/* Selling Price */}
                      <div>
                        <label htmlFor="selling_price" className="block text-sm font-medium text-gray-700">
                          Selling Price per Unit
                        </label>
                        <input
                          type="number"
                          id="selling_price"
                          step="0.01"
                          min="0"
                          value={data.selling_price}
                          onChange={(e) => setData('selling_price', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          required
                        />
                        {errors.selling_price && <p className="mt-1 text-sm text-red-600">{errors.selling_price}</p>}
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
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          placeholder="Add any notes about this sale..."
                        />
                        {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                      </div>

                      {/* Sale Summary */}
                      {data.quantity && data.selling_price && (
                        <div className="bg-green-50 p-4 rounded-md">
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-gray-600">Total Amount:</span>
                            <span className="font-bold text-green-600">
                              ₱{calculateTotalAmount().toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-gray-600">Expected Profit:</span>
                            <span className={`font-medium ${calculateProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ₱{calculateProfit().toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Profit Margin:</span>
                            <span className="font-medium text-gray-900">
                              {selectedItem.costprice > 0
                                ? (((parseFloat(data.selling_price) - selectedItem.costprice) / selectedItem.costprice) * 100).toFixed(1)
                                : '0.0'}%
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
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                      {processing ? 'Selling...' : 'Sell Item'}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
