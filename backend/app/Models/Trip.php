<?php

namespace App\Models;

use App\Enums\TripStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Client;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'client_id',
        'completed_at',
    ];

    public function driver(): BelongsTo
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

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(TripAttachment::class);
    }


    public function events(): HasMany
    {
        return $this->hasMany(TripEvent::class);
    }

    public function client():BelongsTo
    {
        return $this->belongsTo(Client::class, 'client_id');
    }
}
