import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, X, CalendarDays } from 'lucide-react';

interface DateRange {
  startDate: string;
  endDate: string;
  label?: string;
}

interface DateRangeFilterProps {
  onDateRangeChange: (dateRange: DateRange) => void;
  currentRange: DateRange;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ onDateRangeChange, currentRange }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(currentRange.startDate);
  const [tempEndDate, setTempEndDate] = useState(currentRange.endDate);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const presetRanges = [
    {
      label: 'Today',
      getValue: () => {
        const today = new Date().toISOString().split('T')[0];
        return { startDate: today, endDate: today, label: 'Today' };
      }
    },
    {
      label: 'Yesterday',
      getValue: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateStr = yesterday.toISOString().split('T')[0];
        return { startDate: dateStr, endDate: dateStr, label: 'Yesterday' };
      }
    },
    {
      label: 'This Month',
      getValue: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0],
          label: 'This Month'
        };
      }
    },
    {
      label: 'Last Month',
      getValue: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0],
          label: 'Last Month'
        };
      }
    },
    {
      label: 'This Year',
      getValue: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const end = new Date(now.getFullYear(), 11, 31);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0],
          label: 'This Year'
        };
      }
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setShowCustomPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateRange = (range: DateRange) => {
    if (range.label) return range.label;

    const start = new Date(range.startDate);
    const end = new Date(range.endDate);

    if (range.startDate === range.endDate) {
      return start.toLocaleDateString();
    }

    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };

  const handlePresetSelect = (preset: any) => {
    const range = preset.getValue();
    onDateRangeChange(range);
    setShowDropdown(false);
    setShowCustomPicker(false);
  };

  const handleCustomApply = () => {
    if (tempStartDate && tempEndDate) {
      onDateRangeChange({
        startDate: tempStartDate,
        endDate: tempEndDate,
        label: undefined
      });
      setShowDropdown(false);
      setShowCustomPicker(false);
    }
  };

  const handleCustomCancel = () => {
    setTempStartDate(currentRange.startDate);
    setTempEndDate(currentRange.endDate);
    setShowCustomPicker(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px] justify-between"
      >
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>{formatDateRange(currentRange)}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
          {!showCustomPicker ? (
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Select Date Range</h3>
              <div className="space-y-1">
                {presetRanges.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handlePresetSelect(preset)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  onClick={() => setShowCustomPicker(true)}
                  className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center space-x-2"
                >
                  <CalendarDays className="h-4 w-4" />
                  <span>Custom Range</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">Custom Date Range</h3>
                <button
                  onClick={handleCustomCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={tempStartDate}
                    onChange={(e) => setTempStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={tempEndDate}
                    onChange={(e) => setTempEndDate(e.target.value)}
                    min={tempStartDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={handleCustomCancel}
                    className="flex-1 px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCustomApply}
                    disabled={!tempStartDate || !tempEndDate}
                    className="flex-1 px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
