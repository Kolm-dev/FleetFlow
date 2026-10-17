<?php

namespace App\Models\Drivers;

use App\Enums\DriverStatus;
use App\Models\Trips\Trip;
use App\Models\Vehicles\Vehicle;
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

    public function trips()
    {
        return $this->hasMany(Trip::class);
    }
}
