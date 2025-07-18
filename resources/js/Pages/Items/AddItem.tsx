import React, { useState, useMemo } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Layout } from '@/Components/Layout';
import { Plus, Package, AlertCircle, Edit2, Trash2, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';

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
  items: Item[];
  units: Record<string, string>;
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function AddItem({ auth, systemSettings, items, units, flash }: AddItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: '',
    description: '',
    category: '',
    unit: '',
    amount: '',
    price: '',
  });

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;

    const term = searchTerm.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term) ||
      (units[item.unit] || item.unit).toLowerCase().includes(term)
    );
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

    if (editingItem) {
      put(route('items.update', editingItem.id), {
        onSuccess: () => {
          setIsModalOpen(false);
          setEditingItem(null);
          reset();
        },
      });
    } else {
      post(route('items.store'), {
        onSuccess: () => {
          setIsModalOpen(false);
          reset();
        },
      });
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setData({
      name: item.name,
      description: item.description || '',
      category: item.category,
      unit: item.unit,
      amount: item.amount.toString(),
      price: item.price.toString(),
    });
    setIsModalOpen(true);
  };

  const handleDelete = (item: Item) => {
    if (confirm('Are you sure you want to delete this item?')) {
      router.delete(route('items.destroy', item.id));
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
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

      <div className="max-w-6xl mx-auto">
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

        {/* Controls Section */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Item
          </button>

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

        {/* Items Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Items List</h3>
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
                    `${items.length} items in inventory`
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Grand Total</p>
                <p className="text-2xl font-bold text-green-600">
                  ₱{items.reduce((total, item) => total + (parseFloat(item.amount.toString()) * parseFloat(item.price.toString())), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? 'No items found' : 'No items'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new item.'}
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
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {item.description || 'No description'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {units[item.unit] || item.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {parseFloat(item.amount.toString()).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₱{parseFloat(item.price.toString()).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          ₱{(parseFloat(item.amount.toString()) * parseFloat(item.price.toString())).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
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

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleSubmit}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {editingItem ? 'Edit Item' : 'Add New Item'}
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
                      {/* Item Name */}
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Item Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={data.name}
                          onChange={(e) => setData('name', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                      </div>

                      {/* Description */}
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          id="description"
                          value={data.description}
                          onChange={(e) => setData('description', e.target.value)}
                          rows={3}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                      </div>

                      {/* Category */}
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                          Category
                        </label>
                        <input
                          type="text"
                          id="category"
                          value={data.category}
                          onChange={(e) => setData('category', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Enter category"
                          required
                        />
                        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                      </div>

                      {/* Unit */}
                      <div>
                        <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                          Unit
                        </label>
                        <select
                          id="unit"
                          value={data.unit}
                          onChange={(e) => setData('unit', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                        >
                          <option value="">Select Unit</option>
                          {Object.entries(units).map(([key, value]) => (
                            <option key={key} value={key}>
                              {value}
                            </option>
                          ))}
                        </select>
                        {errors.unit && <p className="mt-1 text-sm text-red-600">{errors.unit}</p>}
                      </div>

                      {/* Amount */}
                      <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                          Amount
                        </label>
                        <input
                          type="number"
                          id="amount"
                          step="0.01"
                          min="0"
                          value={data.amount}
                          onChange={(e) => setData('amount', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Enter amount"
                          required
                        />
                        {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                      </div>

                      {/* Price */}
                      <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                          Price
                        </label>
                        <input
                          type="number"
                          id="price"
                          step="0.01"
                          min="0"
                          value={data.price}
                          onChange={(e) => setData('price', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                        />
                        {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                      {processing ? 'Saving...' : (editingItem ? 'Update Item' : 'Add Item')}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
