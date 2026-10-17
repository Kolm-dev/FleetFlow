<?php

namespace App\Models\Vehicles;

use App\Enums\VehicleServiceType;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    public function vehicle() : BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function attachments() : HasMany
    {
        return $this->hasMany(VehicleServiceAttachment::class, 'vehicle_service_id');
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
