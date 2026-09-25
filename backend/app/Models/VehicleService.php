<?php

namespace App\Models;

use App\Enums\VehicleServiceType;
use Illuminate\Database\Eloquent\Model;

class VehicleService extends Model
{
    protected $fillable = [
        'vehicle_id',
        'service_date',
        'mileage',
        'type',
        'cost',
        'notes',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    protected function casts(): array
    {
        return [
            'service_date' => 'date',
            'mileage' => 'integer',
            'cost' => 'float',
            'type' => VehicleServiceType::class,
        ];
    }
}
