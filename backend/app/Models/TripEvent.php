<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\TripEventEnum;

class TripEvent extends Model
{
    protected $fillable = [
        'type',
        'data',
        'trip_id',
        'user_id'
    ];

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'type' => TripEventEnum::class
        ];
    }

    const UPDATED_AT = null;

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
