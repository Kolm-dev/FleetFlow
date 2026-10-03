<?php

namespace App\Models;

use App\Enums\TripStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trip extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'distance',
        'price',
        'status',
        'driver_id',
        'vehicle_id',
        'completed_at',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class, 'driver_id');
    }

    protected function casts(): array
    {
        return [
            'price' => 'float',
            'status' => TripStatus::class,
            'completed_at' => 'datetime',
        ];
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_id');
    }

    public function attachments()
    {
        return $this->hasMany(TripAttachment::class);
    }

    
    public function events()
    {
        return $this->hasMany(TripEvent::class);
    }
}
