<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'category',
        'unit',
        'amount',
        'price',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'amount' => 'decimal:2',
    ];

    // Available units for dropdown
    public static function getAvailableUnits()
    {
        return [
            'pcs' => 'Pieces',
            'kg' => 'Kilograms',
            'g' => 'Grams',
            'l' => 'Liters',
            'ml' => 'Milliliters',
            'box' => 'Box',
            'pack' => 'Pack',
            'bottle' => 'Bottle',
            'bag' => 'Bag',
            'roll' => 'Roll',
            'meter' => 'Meter',
            'cm' => 'Centimeter',
            'set' => 'Set',
            'pair' => 'Pair',
            'dozen' => 'Dozen',
        ];
    }


}
