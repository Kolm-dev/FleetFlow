<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\FuelType;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'brand',
        'model',
        'license_plate',
        'year',
        'driver_id',
        'fuel_consumption',
        'fuel_type',
    ];

    protected $casts = [
        'fuel_consumption' => 'decimal:2',
        'fuel_type' => FuelType::class,
    ];

    public function setLicensePlateAttribute(string $value)
    {
        $this->attributes['license_plate'] = strtoupper($value);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function vehicleServices()
    {
        return $this->hasMany(VehicleService::class);
    }
}
