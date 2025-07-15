<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\PullInLog;
use App\Models\PullOutLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Carbon\Carbon;

class ItemController extends Controller
{
    public function addItem(): Response
    {
        $items = Item::orderBy('created_at', 'desc')->get();

        // Get item creation statistics
        $today = Carbon::today();
        $thisWeek = Carbon::now()->startOfWeek();

        $todayAdded = Item::whereDate('created_at', $today)->count();
        $thisWeekAdded = Item::where('created_at', '>=', $thisWeek)->count();

        // Get recent item additions
        $recentAdditions = Item::orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function($item) {
                // Since items don't have user_id by default, we'll use the current user
                // In a real scenario, you'd want to add user_id to items table
                $item->user = auth()->user();
                return $item;
            });

        return Inertia::render('Items/AddItem', [
            'items' => $items,
            'units' => Item::getAvailableUnits(),
            'statistics' => [
                'todayAdded' => $todayAdded,
                'thisWeekAdded' => $thisWeekAdded,
                'totalItems' => $items->count(),
                'totalValue' => $items->sum(function($item) {
                    return $item->amount * $item->price;
                }),
                'totalCostValue' => $items->sum(function($item) {
                    return $item->amount * $item->costprice;
                }),
                'totalProfit' => $items->sum(function($item) {
                    return $item->amount * ($item->price - $item->costprice);
                }),
            ],
            'recentAdditions' => $recentAdditions,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string|max:255',
            'unit' => 'required|string|max:50',
            'amount' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'costprice' => 'required|numeric|min:0',
        ]);

        Item::create([
            'name' => $request->name,
            'description' => $request->description,
            'category' => $request->category,
            'unit' => $request->unit,
            'amount' => $request->amount,
            'price' => $request->price,
            'costprice' => $request->costprice,
        ]);

        return redirect()->route('add-item')->with('success', 'Item added successfully!');
    }

    public function update(Request $request, Item $item): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string|max:255',
            'unit' => 'required|string|max:50',
            'amount' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'costprice' => 'required|numeric|min:0',
        ]);

        $item->update([
            'name' => $request->name,
            'description' => $request->description,
            'category' => $request->category,
            'unit' => $request->unit,
            'amount' => $request->amount,
            'price' => $request->price,
            'costprice' => $request->costprice,
        ]);

        return redirect()->route('add-item')->with('success', 'Item updated successfully!');
    }

    public function destroy(Item $item): RedirectResponse
    {
        $item->delete();

        return redirect()->route('add-item')->with('success', 'Item deleted successfully!');
    }

    public function pullIn(): Response
    {
        $items = Item::orderBy('name')->get();

        // Get pull-in statistics
        $today = Carbon::today();
        $thisWeek = Carbon::now()->startOfWeek();

        $todayReceived = PullInLog::whereDate('created_at', $today)->count();
        $thisWeekReceived = PullInLog::where('created_at', '>=', $thisWeek)->count();

        // Get recent pull-in activity
        $recentActivity = PullInLog::with(['item', 'user'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Items/PullIn', [
            'items' => $items,
            'units' => Item::getAvailableUnits(),
            'statistics' => [
                'todayReceived' => $todayReceived,
                'thisWeekReceived' => $thisWeekReceived,
                'totalItems' => $items->count(),
                'totalCostValue' => $items->sum(function($item) {
                    return $item->amount * $item->costprice;
                }),
                'totalSellingValue' => $items->sum(function($item) {
                    return $item->amount * $item->price;
                }),
                'totalPotentialProfit' => $items->sum(function($item) {
                    return $item->amount * ($item->price - $item->costprice);
                }),
            ],
            'recentActivity' => $recentActivity,
        ]);
    }

    public function storePullIn(Request $request): RedirectResponse
    {
        $request->validate([
            'item_id' => 'required|exists:items,id',
            'quantity' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string',
        ]);

        $item = Item::findOrFail($request->item_id);

        // Update the item amount by adding the new quantity
        $item->update([
            'amount' => $item->amount + $request->quantity,
        ]);

        // Log the pull-in activity
        PullInLog::create([
            'item_id' => $item->id,
            'quantity' => $request->quantity,
            'notes' => $request->notes,
            'user_id' => auth()->id(),
        ]);

        return redirect()->route('pull-in')->with('success', 'Item pulled in successfully!');
    }

    public function pullOut(): Response
    {
        $items = Item::where('amount', '>', 0)->orderBy('name')->get();

        // Get pull-out statistics
        $today = Carbon::today();
        $thisWeek = Carbon::now()->startOfWeek();

        $todayDispatched = PullOutLog::whereDate('created_at', $today)->count();
        $thisWeekDispatched = PullOutLog::where('created_at', '>=', $thisWeek)->count();

        // Get recent pull-out activity
        $recentActivity = PullOutLog::with(['item', 'user'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Get low stock items (items with amount <= 10)
        $lowStockItems = Item::where('amount', '<=', 10)
            ->where('amount', '>', 0)
            ->orderBy('amount')
            ->get();

        return Inertia::render('Items/PullOut', [
            'items' => $items,
            'units' => Item::getAvailableUnits(),
            'statistics' => [
                'todayDispatched' => $todayDispatched,
                'thisWeekDispatched' => $thisWeekDispatched,
                'lowStockAlerts' => $lowStockItems->count(),
                'totalCostValue' => $items->sum(function($item) {
                    return $item->amount * $item->costprice;
                }),
                'totalSellingValue' => $items->sum(function($item) {
                    return $item->amount * $item->price;
                }),
                'totalPotentialProfit' => $items->sum(function($item) {
                    return $item->amount * ($item->price - $item->costprice);
                }),
            ],
            'recentActivity' => $recentActivity,
            'lowStockItems' => $lowStockItems,
        ]);
    }

    public function storePullOut(Request $request): RedirectResponse
    {
        $request->validate([
            'item_id' => 'required|exists:items,id',
            'quantity' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string',
        ]);

        $item = Item::findOrFail($request->item_id);

        // Check if we have enough stock
        if ($item->amount < $request->quantity) {
            return redirect()->route('pull-out')->with('error', 'Insufficient stock! Available: ' . $item->amount . ' ' . $item->unit);
        }

        // Update the item amount by subtracting the quantity
        $item->update([
            'amount' => $item->amount - $request->quantity,
        ]);

        // Log the pull-out activity
        PullOutLog::create([
            'item_id' => $item->id,
            'quantity' => $request->quantity,
            'notes' => $request->notes,
            'user_id' => auth()->id(),
        ]);

        return redirect()->route('pull-out')->with('success', 'Item pulled out successfully!');
    }
}
