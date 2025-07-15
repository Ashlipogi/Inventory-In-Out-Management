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
        'costprice',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'costprice' => 'decimal:2',
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
            'sks' => 'Sack',
        ];
    }

    // Calculate profit margin
    public function getProfitMarginAttribute()
    {
        if ($this->costprice > 0) {
            return (($this->price - $this->costprice) / $this->costprice) * 100;
        }
        return 0;
    }

    // Calculate profit amount
    public function getProfitAmountAttribute()
    {
        return $this->price - $this->costprice;
    }

    // Calculate total cost value
    public function getTotalCostValueAttribute()
    {
        return $this->amount * $this->costprice;
    }

    // Calculate total selling value
    public function getTotalSellingValueAttribute()
    {
        return $this->amount * $this->price;
    }

    // Calculate total profit
    public function getTotalProfitAttribute()
    {
        return $this->amount * ($this->price - $this->costprice);
    }
}
