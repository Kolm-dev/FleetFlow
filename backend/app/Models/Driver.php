<?php

namespace App\Models;

use App\Enums\DriverStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'phone_number', 'status', 'photo',
    ];

    protected function casts(): array
    {
        return [
            'status' => DriverStatus::class,
        ];
    }

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }
}
