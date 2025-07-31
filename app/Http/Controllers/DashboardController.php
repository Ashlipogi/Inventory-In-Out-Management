<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\PullInLog;
use App\Models\PullOutLog;
use App\Models\SellLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        // Get date range from request parameters
        $startDate = $request->get('start_date', Carbon::today()->toDateString());
        $endDate = $request->get('end_date', Carbon::today()->toDateString());

        // Validate and parse dates
        try {
            $startDate = Carbon::parse($startDate)->startOfDay();
            $endDate = Carbon::parse($endDate)->endOfDay();
        } catch (\Exception $e) {
            $startDate = Carbon::today()->startOfDay();
            $endDate = Carbon::today()->endOfDay();
        }

        // Ensure end date is not before start date
        if ($endDate->lt($startDate)) {
            $endDate = $startDate->copy()->endOfDay();
        }

        // Get current date ranges for traditional statistics
        $today = Carbon::today();
        $thisWeek = Carbon::now()->startOfWeek();
        $thisMonth = Carbon::now()->startOfMonth();

        // Get inventory statistics (these remain static as they're current inventory state)
        $totalItems = Item::count();
        $totalValue = Item::sum(DB::raw('amount * price'));
        $totalCostValue = Item::sum(DB::raw('amount * costprice'));
        $totalProfit = Item::sum(DB::raw('amount * (price - costprice)'));

        // Get actual sales profit (from SellLog) - filtered by date range
        $actualProfit = SellLog::with('item')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get()
            ->sum(function ($log) {
                return $log->quantity * ($log->selling_price - $log->item->costprice);
            });

        $lowStockItems = Item::where('amount', '<=', 10)->count();
        $outOfStockItems = Item::where('amount', '<=', 0)->count();

        // Get pull-in statistics (traditional + filtered)
        $todayPullIns = PullInLog::whereDate('created_at', $today)->count();
        $weeklyPullIns = PullInLog::where('created_at', '>=', $thisWeek)->count();
        $monthlyPullIns = PullInLog::where('created_at', '>=', $thisMonth)->count();

        // Filtered pull-in value for selected date range
        $totalPullInValue = PullInLog::with('item')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get()
            ->sum(function ($log) {
                return $log->quantity * $log->item->price;
            });

        // Get pull-out statistics (traditional + filtered)
        $todayPullOuts = PullOutLog::whereDate('created_at', $today)->count();
        $weeklyPullOuts = PullOutLog::where('created_at', '>=', $thisWeek)->count();
        $monthlyPullOuts = PullOutLog::where('created_at', '>=', $thisMonth)->count();

        // Filtered pull-out value for selected date range
        $totalPullOutValue = PullOutLog::with('item')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get()
            ->sum(function ($log) {
                return $log->quantity * $log->item->price;
            });

        // Get recent activities filtered by date range
        $recentPullIns = PullInLog::with(['item', 'user'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $recentPullOuts = PullOutLog::with(['item', 'user'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Get top items by value (current inventory - not date filtered)
        $topItemsByValue = Item::orderByRaw('amount * price DESC')
            ->limit(5)
            ->get();

        // Get top items by profit (current inventory - not date filtered)
        $topItemsByProfit = Item::orderByRaw('amount * (price - costprice) DESC')
            ->limit(5)
            ->get();

        // Get low stock items (current inventory - not date filtered)
        $lowStockItemsList = Item::where('amount', '<=', 10)
            ->where('amount', '>', 0)
            ->orderBy('amount')
            ->limit(5)
            ->get();

        // Get category breakdown (current inventory - not date filtered)
        $categoryStats = Item::select('category')
            ->selectRaw('COUNT(*) as count')
            ->selectRaw('SUM(amount * price) as total_value')
            ->selectRaw('SUM(amount) as total_quantity')
            ->groupBy('category')
            ->orderBy('total_value', 'desc')
            ->get();

        // Get monthly trends (last 6 months - this remains unchanged for trend analysis)
// In the monthly trends section of DashboardController.php
$monthlyTrends = [];
for ($i = 5; $i >= 0; $i--) {
    $month = Carbon::now()->subMonths($i);
    $monthStart = $month->copy()->startOfMonth();
    $monthEnd = $month->copy()->endOfMonth();

    $pullIns = PullInLog::whereBetween('created_at', [$monthStart, $monthEnd])->count();
    $pullOuts = PullOutLog::whereBetween('created_at', [$monthStart, $monthEnd])->count();
    $soldItems = SellLog::whereBetween('created_at', [$monthStart, $monthEnd])->count();

    $monthlyTrends[] = [
        'month' => $month->format('M Y'),
        'pull_ins' => $pullIns,
        'pull_outs' => $pullOuts,
        'sold_items' => $soldItems,
    ];
}

        // Format date range for frontend
        $dateRange = [
            'startDate' => $startDate->toDateString(),
            'endDate' => $endDate->toDateString(),
        ];

        // Add label for common ranges
        if ($startDate->toDateString() === $endDate->toDateString()) {
            if ($startDate->isToday()) {
                $dateRange['label'] = 'Today';
            } elseif ($startDate->isYesterday()) {
                $dateRange['label'] = 'Yesterday';
            }
        }

        return Inertia::render('Dashboard', [
            'statistics' => [
                'inventory' => [
                    'total_items' => $totalItems,
                    'total_value' => $totalValue,
                    'total_cost_value' => $totalCostValue,
                    'total_profit' => $totalProfit,
                    'actual_profit' => $actualProfit, // This is now filtered by date range
                    'low_stock_items' => $lowStockItems,
                    'out_of_stock_items' => $outOfStockItems,
                ],
                'pull_ins' => [
                    'today' => $todayPullIns,
                    'weekly' => $weeklyPullIns,
                    'monthly' => $monthlyPullIns,
                    'total_value' => $totalPullInValue, // Filtered by date range
                ],
                'pull_outs' => [
                    'today' => $todayPullOuts,
                    'weekly' => $weeklyPullOuts,
                    'monthly' => $monthlyPullOuts,
                    'total_value' => $totalPullOutValue, // Filtered by date range
                ],
            ],
            'recent_activities' => [
                'pull_ins' => $recentPullIns, // Filtered by date range
                'pull_outs' => $recentPullOuts, // Filtered by date range
            ],
            'top_items_by_value' => $topItemsByValue,
            'top_items_by_profit' => $topItemsByProfit,
            'low_stock_items' => $lowStockItemsList,
            'category_stats' => $categoryStats,
            'monthly_trends' => $monthlyTrends,
            'units' => Item::getAvailableUnits(),
            'dateRange' => $dateRange, // Pass current date range to frontend
        ]);
    }
}
