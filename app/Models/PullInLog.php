<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PullInLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_id',
        'quantity',
        'notes',
        'user_id',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
    ];

    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
