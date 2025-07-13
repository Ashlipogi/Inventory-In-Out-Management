<?php

namespace App\Http\Controllers;

use App\Models\Item;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class ItemController extends Controller
{
    public function addItem(): Response
    {
        $items = Item::orderBy('created_at', 'desc')->get();

        return Inertia::render('Items/AddItem', [
            'items' => $items,
            'units' => Item::getAvailableUnits(),
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
        ]);

        Item::create([
            'name' => $request->name,
            'description' => $request->description,
            'category' => $request->category,
            'unit' => $request->unit,
            'amount' => $request->amount,
            'price' => $request->price,
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
        ]);

        $item->update([
            'name' => $request->name,
            'description' => $request->description,
            'category' => $request->category,
            'unit' => $request->unit,
            'amount' => $request->amount,
            'price' => $request->price,
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
        return Inertia::render('Items/PullIn');
    }

    public function pullOut(): Response
    {
        return Inertia::render('Items/PullOut');
    }
}
