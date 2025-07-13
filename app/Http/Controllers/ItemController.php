<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class ItemController extends Controller
{
    public function addItem(): Response
    {
        return Inertia::render('Items/AddItem');
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
