<?php

namespace App\Models\Clients;

use App\Enums\ClientType;
use App\Models\Trips\Trip;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{


    protected $fillable = [
        'name',
        'email',
        'address',
        'notes',
        'type',
    ];


    protected $casts = [
        'type' => ClientType::class,
    ];


    public function isIndividual(): bool
    {
        return $this->type === ClientType::Individual;
    }

    public function isCompany(): bool
    {
        return $this->type === ClientType::Company;
    }


    public function trips() : HasMany
    {
        return $this->hasMany(Trip::class, 'client_id');
    }

    public function phones(): HasMany
    {
        return $this->hasMany(ClientPhone::class);
    }


}
