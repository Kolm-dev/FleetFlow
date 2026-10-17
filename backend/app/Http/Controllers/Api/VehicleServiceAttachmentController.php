<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Vehicles\UploadVehicleServiceAttachmentRequest;
use App\Http\Resources\Vehicles\VehicleServiceAttachmentResource;
use App\Models\Vehicles\Vehicle;
use App\Models\Vehicles\VehicleService;
use App\Models\Vehicles\VehicleServiceAttachment;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class VehicleServiceAttachmentController extends Controller
{
    public function index(Vehicle $vehicle, VehicleService $service)
    {
        $service = $vehicle->vehicleServices()->findOrFail($service->id);

        return VehicleServiceAttachmentResource::collection($service->attachments()->latest('uploaded_at')->get());
    }

    public function downloadAttachment(
        Vehicle $vehicle,
        VehicleService $service,
        VehicleServiceAttachment $attachment,
    ) {
        $service = $vehicle->vehicleServices()->findOrFail($service->id);
        $attachment = $service->attachments()->findOrFail($attachment->id);

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk($attachment->disk);

        if (! $disk->exists($attachment->path)) {
            abort(404, 'Attachment file not found.');
        }

        return $disk->download(
            $attachment->path,

            $attachment->original_name,
            ['Content-Type' => $attachment->mime_type]
        );
    }

    public function uploadAttachment(
        UploadVehicleServiceAttachmentRequest $request,
        Vehicle $vehicle, VehicleService $service
    ) {
        $validated = $request->validated();
        $files = $validated['files'];
        $directory = "vehicle_service/{$service->id}/attachments";
        $createdAttachments = [];

        foreach ($files as $file) {
            $path = $file->store($directory, 'local');

            if ($path === false) {
                throw new RuntimeException("Failed to store file: {$file->getClientOriginalName()}");
            }

            try {
                $created = $service->attachments()->create([
                    'disk' => 'local',
                    'path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                    'user_id' => $request->user()?->id,
                    'uploaded_at' => now(),
                ]);
                $createdAttachments[] = $created;
            } catch (Throwable $exception) {
                try {
                    $deleted = Storage::disk('local')->delete($path);

                    if (! $deleted) {
                        Log::error('Failed to clean up orphaned vehicle service attachment.', [
                            'path' => $path,
                        ]);
                    }
                } catch (Throwable $cleanupException) {
                    Log::error('Failed to clean up orphaned vehicle service attachment.', [
                        'path' => $path,
                        'error' => $cleanupException->getMessage(),
                    ]);
                }

                throw $exception;
            }
        }

        return VehicleServiceAttachmentResource::collection(collect($createdAttachments))
            ->additional([
                'message' => 'Attachments uploaded successfully.',
            ])
            ->response()
            ->setStatusCode(201);
    }

    public function viewAttachment(Vehicle $vehicle, VehicleService $service, VehicleServiceAttachment $attachment)
    {
        $service = $vehicle->vehicleServices()->findOrFail($service->id);
        $attachment = $service->attachments()->findOrFail($attachment->id);

        $diskName = $attachment->disk;
        $path = $attachment->path;
        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk($diskName);

        if (! $disk->exists($path)) {
            abort(404, 'Attachment file not found.');
        }

        return $disk->response(
            $attachment->path,
            $attachment->original_name,
            ['Content-Type' => $attachment->mime_type],
            'inline',
        );
    }

    public function deleteAttachment(
        Vehicle $vehicle,
        VehicleService $service,
        VehicleServiceAttachment $attachment,
    ) {
        $service = $vehicle->vehicleServices()->findOrFail($service->id);
        $attachment = $service->attachments()->findOrFail($attachment->id);

        $diskName = $attachment->disk;
        $path = $attachment->path;

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk($diskName);

        if ($disk->exists($path) && (! $disk->delete($path))) {

            abort(500, 'Failed to delete attachment file.');

        }
        $attachment->delete();

        return response()->noContent();
    }
}
