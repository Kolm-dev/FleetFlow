<?php

use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\PricingSettingController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\TripController;
use App\Http\Controllers\Api\VehicleController;
use App\Http\Controllers\Api\VehicleServiceController;
use App\Http\Controllers\TripAttachmentController;
use App\Http\Controllers\TripEventController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {

Route::get('stats', [StatsController::class, 'index']);
Route::get('pricing-settings', [PricingSettingController::class, 'show']);
Route::patch('pricing-settings', [PricingSettingController::class, 'update']);
Route::post('trips/calculate-price', [TripController::class, 'calculatePrice']);

Route::get('/trips/{trip}/events', [TripEventController::class, 'index']);
Route::get('/trips/{trip}/attachments', [TripAttachmentController::class, 'attachments']);
Route::post('/trips/{trip}/attachments', [TripAttachmentController::class, 'storeAttachment']);
Route::patch('/trips/{trip}/attachments/{attachment}', [TripAttachmentController::class, 'updateAttachment']);
Route::get('/trips/{trip}/attachments/{attachment}/content', [TripAttachmentController::class, 'attachmentContent']);
Route::get('/trips/{trip}/attachments/{attachment}/download', [TripAttachmentController::class, 'downloadAttachment']);
Route::delete('/trips/{trip}/attachments/{attachment}', [TripAttachmentController::class, 'deleteAttachment']);


Route::patch('trips/{trip}/start', [TripController::class, 'start']);
Route::patch('/trips/{trip}/cancel', [TripController::class, 'cancel']);
Route::patch('trips/{trip}/close', [TripController::class, 'close']);
Route::apiResource('trips', TripController::class);

Route::apiResource('drivers', DriverController::class);

Route::apiResources(
    [
        'vehicles' => VehicleController::class,
        'vehicles.services' => VehicleServiceController::class,
    ]
);
});
