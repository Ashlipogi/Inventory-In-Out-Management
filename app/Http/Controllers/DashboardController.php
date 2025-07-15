<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\PullInLog;
use App\Models\PullOutLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // Get current date ranges
        $today = Carbon::today();
        $thisWeek = Carbon::now()->startOfWeek();
        $thisMonth = Carbon::now()->startOfMonth();

        // Get inventory statistics
        $totalItems = Item::count();
        $totalValue = Item::sum(\DB::raw('amount * price'));
        $totalCostValue = Item::sum(\DB::raw('amount * costprice'));
        $totalProfit = Item::sum(\DB::raw('amount * (price - costprice)'));

        // Calculate average profit margin
        $averageProfitMargin = 0;
        if ($totalCostValue > 0) {
            $averageProfitMargin = ($totalProfit / $totalCostValue) * 100;
        }

        $lowStockItems = Item::where('amount', '<=', 10)->count();
        $outOfStockItems = Item::where('amount', '<=', 0)->count();

        // Get pull-in statistics
        $todayPullIns = PullInLog::whereDate('created_at', $today)->count();
        $weeklyPullIns = PullInLog::where('created_at', '>=', $thisWeek)->count();
        $monthlyPullIns = PullInLog::where('created_at', '>=', $thisMonth)->count();
        $totalPullInValue = PullInLog::with('item')
            ->get()
            ->sum(function ($log) {
                return $log->quantity * $log->item->price;
            });

        // Get pull-out statistics
        $todayPullOuts = PullOutLog::whereDate('created_at', $today)->count();
        $weeklyPullOuts = PullOutLog::where('created_at', '>=', $thisWeek)->count();
        $monthlyPullOuts = PullOutLog::where('created_at', '>=', $thisMonth)->count();
        $totalPullOutValue = PullOutLog::with('item')
            ->get()
            ->sum(function ($log) {
                return $log->quantity * $log->item->price;
            });

        // Get recent activities (last 10 of each)
        $recentPullIns = PullInLog::with(['item', 'user'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recentPullOuts = PullOutLog::with(['item', 'user'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get top items by value
        $topItemsByValue = Item::orderByRaw('amount * price DESC')
            ->limit(5)
            ->get();

        // Get top items by profit
        $topItemsByProfit = Item::orderByRaw('amount * (price - costprice) DESC')
            ->limit(5)
            ->get();

        // Get low stock items
        $lowStockItemsList = Item::where('amount', '<=', 10)
            ->where('amount', '>', 0)
            ->orderBy('amount')
            ->limit(5)
            ->get();

        // Get category breakdown
        $categoryStats = Item::select('category')
            ->selectRaw('COUNT(*) as count')
            ->selectRaw('SUM(amount * price) as total_value')
            ->selectRaw('SUM(amount) as total_quantity')
            ->groupBy('category')
            ->orderBy('total_value', 'desc')
            ->get();

        // Get monthly trends (last 6 months)
        $monthlyTrends = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $monthStart = $month->copy()->startOfMonth();
            $monthEnd = $month->copy()->endOfMonth();

            $pullIns = PullInLog::whereBetween('created_at', [$monthStart, $monthEnd])->count();
            $pullOuts = PullOutLog::whereBetween('created_at', [$monthStart, $monthEnd])->count();

            $monthlyTrends[] = [
                'month' => $month->format('M Y'),
                'pull_ins' => $pullIns,
                'pull_outs' => $pullOuts,
            ];
        }

        return Inertia::render('Dashboard', [
            'statistics' => [
                'inventory' => [
                    'total_items' => $totalItems,
                    'total_value' => $totalValue,
                    'total_cost_value' => $totalCostValue,
                    'total_profit' => $totalProfit,
                    'average_profit_margin' => $averageProfitMargin,
                    'low_stock_items' => $lowStockItems,
                    'out_of_stock_items' => $outOfStockItems,
                ],
                'pull_ins' => [
                    'today' => $todayPullIns,
                    'weekly' => $weeklyPullIns,
                    'monthly' => $monthlyPullIns,
                    'total_value' => $totalPullInValue,
                ],
                'pull_outs' => [
                    'today' => $todayPullOuts,
                    'weekly' => $weeklyPullOuts,
                    'monthly' => $monthlyPullOuts,
                    'total_value' => $totalPullOutValue,
                ],
            ],
            'recent_activities' => [
                'pull_ins' => $recentPullIns,
                'pull_outs' => $recentPullOuts,
            ],
            'top_items_by_value' => $topItemsByValue,
            'top_items_by_profit' => $topItemsByProfit,
            'low_stock_items' => $lowStockItemsList,
            'category_stats' => $categoryStats,
            'monthly_trends' => $monthlyTrends,
            'units' => Item::getAvailableUnits(),
        ]);
    }
}
