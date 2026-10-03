<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TripEventResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'trip_id' => $this->trip_id,
            'event_type' => $this->type->value,
            'data' => $this->data,
            'user' => $this->user ? [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
            ] : null,
            'created_at' => $this->created_at,

        ];

    }
}
