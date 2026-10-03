<?php

namespace App\Http\Controllers;

use App\Http\Resources\TripEventResource;
use App\Models\Trip;
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
