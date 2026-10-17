<?php

namespace App\Models\Trips;

use App\Models\Users\User;
use Illuminate\Database\Eloquent\Model;

class TripAttachment extends Model
{
    protected $fillable = [
        'trip_id',
        'user_id',
        'original_name',
        'path',
        'mime_type',
        'size',
        'disk',
        'display_name',
    ];

    protected function casts(): array
    {
        return [
            'size' => 'integer',
        ];
    }

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
