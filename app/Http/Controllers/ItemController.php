<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\ItemAddLog;
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

        $todayAdded = ItemAddLog::whereDate('created_at', $today)->count();
        $thisWeekAdded = ItemAddLog::where('created_at', '>=', $thisWeek)->count();

        // Get recent item additions from ItemAddLog
        $recentAdditions = ItemAddLog::with(['item', 'user'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Items/AddItem', [
            'items' => $items,
            'units' => Item::getAvailableUnits(),
            'statistics' => [
                'todayAdded' => $todayAdded,
                'thisWeekAdded' => $thisWeekAdded,
                'totalItems' => $items->count(),
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
        ]);

        // Create the item
        $item = Item::create([
            'name' => $request->name,
            'description' => $request->description,
            'category' => $request->category,
            'unit' => $request->unit,
            'amount' => $request->amount,
        ]);

        // Log the item addition
        ItemAddLog::create([
            'item_id' => $item->id,
            'initial_quantity' => $request->amount,
            'notes' => 'Initial item creation',
            'user_id' => auth()->id(),
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
        ]);

        $item->update([
            'name' => $request->name,
            'description' => $request->description,
            'category' => $request->category,
            'unit' => $request->unit,
            'amount' => $request->amount,
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

