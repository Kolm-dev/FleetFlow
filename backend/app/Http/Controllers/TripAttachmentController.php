<?php

namespace App\Http\Controllers;

use App\Enums\TripEventEnum;
use App\Http\Requests\StoreTripAttachmentRequest;
use App\Http\Requests\UpdateTripAttachmentRequest;
use App\Http\Resources\TripAttachmentResource;
use App\Models\Trip;
use App\Models\TripAttachment;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class TripAttachmentController extends Controller
{
    public function attachments(Trip $trip)
    {
        $q = $trip->attachments()->latest()->latest('id');
        $attachments = $q->get();

        return TripAttachmentResource::collection($attachments);
    }

    public function storeAttachment(StoreTripAttachmentRequest $request, Trip $trip)
    {
        $request->validated();
        $arrayFiles = $request->file('files', []);
        $directory = "trips/{$trip->id}/attachments";
        $createdAttachments = [];
        $storedPaths = [];
        try {
            DB::transaction(function () use ($arrayFiles, $directory, $trip, $request, &$createdAttachments, &$storedPaths) {
                foreach ($arrayFiles as $file) {
                    $path = $file->store($directory, 'local');

                    if ($path === false) {
                        throw new \RuntimeException('Failed to store attachment.');
                    }

                    $storedPaths[] = $path;

                    $attachment = $trip->attachments()->create([
                        'user_id' => $request->user()?->id,
                        'original_name' => $file->getClientOriginalName(),
                        'path' => $path,
                        'mime_type' => $file->getMimeType(),
                        'size' => $file->getSize(),
                        'disk' => 'local',
                    ]);

                    $createdAttachments[] = $attachment;

                    $trip->events()->create([
                        'type' => TripEventEnum::ATTACHMENT_UPLOADED,
                        'user_id' => Auth::id(),
                        'data' => [
                            'attachment_id' => $attachment->id,
                            'original_name' => $attachment->original_name,
                            'display_name' => $this->attachmentDisplayName($attachment),
                            'mime_type' => $attachment->mime_type,
                            'size' => $attachment->size,
                        ],
                    ]);
                }
            });
        } catch (Throwable $e) {
            foreach ($storedPaths as $path) {
                try {
                    Storage::disk('local')->delete($path);
                } catch (Throwable $th) {
                    Log::error('Failed to cleanup trip attachment.', [
                        'path' => $path,
                        'error' => $th->getMessage(),
                    ]);
                }
            }
            throw $e;
        }

        return TripAttachmentResource::collection(collect($createdAttachments))->additional(['message' => 'Attachments uploaded successfully.'])->response()
            ->setStatusCode(201);
    }

    public function attachmentContent(Trip $trip, TripAttachment $attachment)
    {
        if (! $this->checkAttachmentBelongsToTrip($trip, $attachment)) {
            abort(404);
        }
        $allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'application/pdf',
            'text/plain',
        ];

        if (! in_array($attachment->mime_type, $allowedMimeTypes, true)) {
            abort(415, 'Unsupported media type.');
        }

        /** @var FilesystemAdapter $diskAttachment */
        $diskAttachment = Storage::disk($attachment->disk);
        if (! $diskAttachment->exists($attachment->path)) {
            abort(404, 'Attachment not found.');
        }
        $nameFile = $attachment->original_name;
        $pathFile = $attachment->path;
        $headers = ['Content-Type' => $attachment->mime_type];

        return $diskAttachment->response($pathFile, $nameFile, $headers, 'inline');
    }

    public function downloadAttachment(Trip $trip, TripAttachment $attachment)
    {
        if (! $this->checkAttachmentBelongsToTrip($trip, $attachment)) {
            abort(404);
        }
        /** @var FilesystemAdapter $diskAttachment */
        $diskAttachment = Storage::disk($attachment->disk);
        if (! $diskAttachment->exists($attachment->path)) {
            abort(404, 'Attachment not found.');
        }
        $headers = [
            'Content-Type' => $attachment->mime_type,
        ];

        return $diskAttachment->download($attachment->path, $attachment->original_name, $headers);
    }

    public function deleteAttachment(Trip $trip, TripAttachment $attachment)
    {
        if (! $this->checkAttachmentBelongsToTrip($trip, $attachment)) {
            abort(404);
        }
        /** @var FilesystemAdapter $diskAttachment */
        $diskAttachment = Storage::disk($attachment->disk);

        if (! $diskAttachment->exists($attachment->path)) {
            abort(404, 'Attachment not found.');
        }

        $attachmentData = [
            'attachment_id' => $attachment->id,
            'original_name' => $attachment->original_name,
            'display_name' => $this->attachmentDisplayName($attachment),
        ];

        DB::transaction(function () use ($trip, $attachment, $attachmentData) {
            $attachment->delete();

            $trip->events()->create([
                'type' => TripEventEnum::ATTACHMENT_DELETED,
                'user_id' => Auth::id(),
                'data' => $attachmentData,
            ]);
        });

        $resultOfDelete = $diskAttachment->delete($attachment->path);

        if (! $resultOfDelete) {
            abort(500, 'Failed to delete attachment.');
        }

        return response()->noContent();
    }

    public function updateAttachment(
        UpdateTripAttachmentRequest $request,
        Trip $trip,
        TripAttachment $attachment
    ): TripAttachmentResource {
        if (! $this->checkAttachmentBelongsToTrip($trip, $attachment)) {
            abort(404);
        }

        $requestData = $request->validated();
        $oldDisplayName = $this->attachmentDisplayName($attachment);
        $attachment->display_name = $requestData['display_name'];

        DB::transaction(function () use ($trip, $attachment, $oldDisplayName) {
            if (! $attachment->isDirty('display_name')) {
                return;
            }

            $attachment->save();

            $trip->events()->create([
                'type' => TripEventEnum::ATTACHMENT_RENAMED,
                'user_id' => Auth::id(),
                'data' => [
                    'attachment_id' => $attachment->id,
                    'old_display_name' => $oldDisplayName,
                    'new_display_name' => $this->attachmentDisplayName($attachment),
                ],
            ]);
        });

        return new TripAttachmentResource($attachment);
    }

    private function checkAttachmentBelongsToTrip(Trip $trip, TripAttachment $attachment): bool
    {
        return $attachment->trip_id === $trip->id;
    }

    private function attachmentDisplayName(TripAttachment $attachment): string
    {
        return $attachment->display_name ?? $attachment->original_name;
    }
}
