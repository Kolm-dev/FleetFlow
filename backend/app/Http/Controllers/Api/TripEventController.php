<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Trips\TripEventResource;
use App\Models\Trips\Trip;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TripEventController extends Controller
{
    public function index(Trip $trip): AnonymousResourceCollection
    {
        $events = $trip->events()
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        return TripEventResource::collection($events);
    }
}
