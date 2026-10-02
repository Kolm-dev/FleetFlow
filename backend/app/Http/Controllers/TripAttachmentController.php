<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use App\Models\TripAttachment;
use App\Http\Resources\TripAttachmentResource;
use App\Http\Requests\StoreTripAttachmentRequest;
use App\Http\Requests\UpdateTripAttachmentRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
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
        $directory = "trips/{$trip->id}/attachments"; // 1 поездка - 1 папка для загрузок
        // каждый загруженный файл сохраняется и создается запись в бд
        $createdAttachments = [];
        $storedPaths = [];
        try {
            DB::transaction(function () use ($arrayFiles, $directory, $trip, $request, &$createdAttachments, &$storedPaths) {
                foreach ($arrayFiles as $file) {
                    $path = $file->store($directory, 'local'); // сохраняем файл на локальный диск, возращается путь к нему


                    if ($path === false) {
                        throw new \RuntimeException('Failed to store attachment.');
                    } // если не удалось сохранить файл

                    $storedPaths[] = $path;

                    $createdAttachments[] = $trip->attachments()->create([
                        'user_id' => $request->user()?->id,
                        'original_name' => $file->getClientOriginalName(),
                        'path' => $path,
                        'mime_type' => $file->getMimeType(),
                        'size' => $file->getSize(),
                        'disk' => 'local',
                    ]);
                }
            });
        } catch (Throwable $e) {
            // Если произошла ошибка, удалить все сохраненные файлы
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
        if (!$this->checkAttachmentBelongsToTrip($trip, $attachment)) {
            abort(404);
        }
        $allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'application/pdf',
            'text/plain',
        ];

        if (!in_array($attachment->mime_type, $allowedMimeTypes, true)) {
            abort(415, 'Unsupported media type.');
        }

        /** @var \Illuminate\Filesystem\FilesystemAdapter $diskAttachment */
        $diskAttachment = Storage::disk($attachment->disk); // обьект диска
        if (!$diskAttachment->exists($attachment->path)) {
            abort(404, 'Attachment not found.');
        }
        $nameFile = $attachment->original_name;
        $pathFile = $attachment->path;
        $headers = ['Content-Type' => $attachment->mime_type];
        return $diskAttachment->response($pathFile, $nameFile, $headers, "inline");
    }

    public function downloadAttachment(Trip $trip, TripAttachment $attachment)
    {
        if (!$this->checkAttachmentBelongsToTrip($trip, $attachment)) {
            abort(404);
        }
        /** @var \Illuminate\Filesystem\FilesystemAdapter $diskAttachment */
        $diskAttachment = Storage::disk($attachment->disk);
        if (!$diskAttachment->exists($attachment->path)) {
            abort(404, 'Attachment not found.');
        }
        $headers = [
            'Content-Type' => $attachment->mime_type,
        ];
        return $diskAttachment->download($attachment->path, $attachment->original_name, $headers);
    }

    public function deleteAttachment(Trip $trip, TripAttachment $attachment)
    {
        if (!$this->checkAttachmentBelongsToTrip($trip, $attachment)) {
            abort(404);
        }
        /** @var \Illuminate\Filesystem\FilesystemAdapter $diskAttachment */
        $diskAttachment = Storage::disk($attachment->disk);

        if (!$diskAttachment->exists($attachment->path)) {
            abort(404, 'Attachment not found.');
        }

        $resultOfDelete = $diskAttachment->delete($attachment->path);

        if (!$resultOfDelete) {
            abort(500, 'Failed to delete attachment.');
        }

        $attachment->delete();

        return response()->noContent();
    }


    public function updateAttachment(
        UpdateTripAttachmentRequest $request,
        Trip $trip,
        TripAttachment $attachment
    ): TripAttachmentResource {
        if (!$this->checkAttachmentBelongsToTrip($trip, $attachment)) {
            abort(404);
        }

        $requestData = $request->validated();
        $attachment->display_name = $requestData['display_name'];
        $attachment->save();

        return new TripAttachmentResource($attachment);
    }



    private function checkAttachmentBelongsToTrip(Trip $trip, TripAttachment $attachment): bool
    {
        return $attachment->trip_id === $trip->id;
    }
}
