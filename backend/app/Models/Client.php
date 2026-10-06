<?php

namespace App\Models;
use App\Enums\ClientType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Trip;
use App\Models\ClientPhone;

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
