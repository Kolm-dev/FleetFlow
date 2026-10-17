<?php

namespace App\Models\Clients;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientPhone extends Model
{

    protected $fillable = [
        'client_id',
        'phone',
        'label',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
