<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TripAttachmentResource extends JsonResource
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
            'size' => $this->size,
            'mime_type' => $this->mime_type,
            'kind' => $this->resolveKind(),
            'can_preview' => $this->canPreview(),
            'created_at' => $this->created_at?->toIsoString(),
            'original_name' => $this->original_name,
            'display_name' => $this->display_name ?? pathinfo(
                $this->original_name,
                PATHINFO_FILENAME
            ),

        ];
    }


    private function resolveKind(): string
    {
        if (str_starts_with($this->mime_type, 'image/')) {
            return 'image';
        }

        if (str_starts_with($this->mime_type, 'text/')) {
            return 'text';
        }
        return 'document';
    }


    private function canPreview(): bool
    {
        return in_array(
            $this->mime_type,
            [
                'image/jpeg',
                'image/png',
                'image/webp',
                'application/pdf',
                'text/plain',
            ],
            true
        );
    }
}
