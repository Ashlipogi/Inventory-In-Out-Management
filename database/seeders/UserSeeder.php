<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'inventory@gmail.com'],
            [
                'name' => 'Inventory User',
                'email' => 'inventory@gmail.com',
                'password' => Hash::make('inventory123'),
            ]
        );
    }
}
