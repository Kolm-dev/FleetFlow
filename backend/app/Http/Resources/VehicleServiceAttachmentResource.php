<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehicleServiceAttachmentResource extends JsonResource
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
            'vehicle_service_id' => $this->vehicle_service_id,
            'original_name' => $this->original_name,
            'mime_type' => $this->mime_type,
            'size' => $this->size,
            'user_id' => $this->user_id,
            'uploaded_at' => $this->uploaded_at?->toIso8601String(),
        ];
    }
}
