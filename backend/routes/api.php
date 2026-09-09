<?php

use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\TripController;
use App\Http\Controllers\Api\VehicleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(
    function () {}
);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('stats', [StatsController::class, 'index']);

    Route::patch('trips/{trip}/close', [TripController::class, 'close']);
    Route::apiResource('trips', TripController::class);

    Route::apiResource('drivers', DriverController::class);

    Route::apiResource('vehicles', VehicleController::class);
});
