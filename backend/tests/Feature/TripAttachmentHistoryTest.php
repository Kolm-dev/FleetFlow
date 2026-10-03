<?php

namespace Tests\Feature;

use App\Enums\DriverStatus;
use App\Enums\TripEventEnum;
use App\Enums\TripStatus;
use App\Models\Driver;
use App\Models\Trip;
use App\Models\TripAttachment;
use App\Models\Vehicle;
use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Override;
use Tests\TestCase;

class TripAttachmentHistoryTest extends TestCase
{
    use RefreshDatabase;

    #[Override]
    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(Authenticate::class);
    }

    public function test_uploading_one_file_creates_one_attachment_uploaded_event(): void
    {
        Storage::fake('local');
        $trip = $this->createTrip();

        $response = $this->postJson("/api/trips/{$trip->id}/attachments", [
            'files' => [
                UploadedFile::fake()->create('invoice.pdf', 120, 'application/pdf'),
            ],
        ]);

        $response->assertCreated();

        $attachment = TripAttachment::query()->where('trip_id', $trip->id)->firstOrFail();

        $this->assertDatabaseHas('trip_events', [
            'trip_id' => $trip->id,
            'type' => TripEventEnum::ATTACHMENT_UPLOADED->value,
            'user_id' => null,
        ]);

        $event = $trip->events()->where('type', TripEventEnum::ATTACHMENT_UPLOADED)->firstOrFail();

        $this->assertSame([
            'attachment_id' => $attachment->id,
            'original_name' => 'invoice.pdf',
            'display_name' => 'invoice.pdf',
            'mime_type' => 'application/pdf',
            'size' => $attachment->size,
        ], $event->data);
    }

    public function test_uploading_three_files_creates_three_attachment_uploaded_events(): void
    {
        Storage::fake('local');
        $trip = $this->createTrip();

        $response = $this->postJson("/api/trips/{$trip->id}/attachments", [
            'files' => [
                UploadedFile::fake()->create('first.pdf', 10, 'application/pdf'),
                UploadedFile::fake()->create('second.txt', 10, 'text/plain'),
                UploadedFile::fake()->create('third.jpg', 10, 'image/jpeg'),
            ],
        ]);

        $response->assertCreated();

        $this->assertSame(3, $trip->events()->where('type', TripEventEnum::ATTACHMENT_UPLOADED)->count());
    }

    public function test_renaming_attachment_creates_attachment_renamed_event(): void
    {
        Storage::fake('local');
        $trip = $this->createTrip();
        $attachment = $this->createAttachment($trip, [
            'original_name' => 'invoice.pdf',
            'display_name' => 'invoice.pdf',
        ]);

        $response = $this->patchJson("/api/trips/{$trip->id}/attachments/{$attachment->id}", [
            'display_name' => 'Invoice October.pdf',
        ]);

        $response->assertOk();

        $event = $trip->events()->where('type', TripEventEnum::ATTACHMENT_RENAMED)->firstOrFail();

        $this->assertSame([
            'attachment_id' => $attachment->id,
            'old_display_name' => 'invoice.pdf',
            'new_display_name' => 'Invoice October.pdf',
        ], $event->data);
    }

    public function test_saving_same_attachment_name_does_not_create_event(): void
    {
        Storage::fake('local');
        $trip = $this->createTrip();
        $attachment = $this->createAttachment($trip, [
            'display_name' => 'invoice.pdf',
        ]);

        $response = $this->patchJson("/api/trips/{$trip->id}/attachments/{$attachment->id}", [
            'display_name' => 'invoice.pdf',
        ]);

        $response->assertOk();

        $this->assertSame(0, $trip->events()->where('type', TripEventEnum::ATTACHMENT_RENAMED)->count());
    }

    public function test_deleting_attachment_creates_event_that_remains_in_trip_history(): void
    {
        Storage::fake('local');
        $trip = $this->createTrip();
        $attachment = $this->createAttachment($trip, [
            'original_name' => 'invoice.pdf',
            'display_name' => 'Invoice October.pdf',
        ]);

        $response = $this->deleteJson("/api/trips/{$trip->id}/attachments/{$attachment->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('trip_attachments', [
            'id' => $attachment->id,
        ]);

        $eventsResponse = $this->getJson("/api/trips/{$trip->id}/events");

        $eventsResponse
            ->assertOk()
            ->assertJsonFragment([
                'event_type' => TripEventEnum::ATTACHMENT_DELETED->value,
                'data' => [
                    'attachment_id' => $attachment->id,
                    'original_name' => 'invoice.pdf',
                    'display_name' => 'Invoice October.pdf',
                ],
            ]);
    }

    public function test_failed_attachment_operation_does_not_create_false_event(): void
    {
        Storage::fake('local');
        $trip = $this->createTrip();
        $anotherTrip = $this->createTrip();
        $attachment = $this->createAttachment($anotherTrip);

        $response = $this->patchJson("/api/trips/{$trip->id}/attachments/{$attachment->id}", [
            'display_name' => 'Wrong trip.pdf',
        ]);

        $response->assertNotFound();

        $this->assertDatabaseMissing('trip_events', [
            'trip_id' => $trip->id,
            'type' => TripEventEnum::ATTACHMENT_RENAMED->value,
        ]);
    }

    public function test_attachment_events_are_linked_to_the_correct_trip(): void
    {
        Storage::fake('local');
        $trip = $this->createTrip();
        $anotherTrip = $this->createTrip();

        $this->postJson("/api/trips/{$trip->id}/attachments", [
            'files' => [
                UploadedFile::fake()->create('invoice.pdf', 10, 'application/pdf'),
            ],
        ])->assertCreated();

        $this->assertSame(1, $trip->events()->where('type', TripEventEnum::ATTACHMENT_UPLOADED)->count());
        $this->assertSame(0, $anotherTrip->events()->where('type', TripEventEnum::ATTACHMENT_UPLOADED)->count());
    }

    private function createTrip(): Trip
    {
        $driver = Driver::factory()->create(['status' => DriverStatus::OnTrip]);
        $vehicle = Vehicle::factory()->create(['driver_id' => $driver->id]);

        return Trip::factory()->create([
            'driver_id' => $driver->id,
            'vehicle_id' => $vehicle->id,
            'status' => TripStatus::Pending,
        ]);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function createAttachment(Trip $trip, array $attributes = []): TripAttachment
    {
        $path = $attributes['path'] ?? "trips/{$trip->id}/attachments/invoice.pdf";

        Storage::disk('local')->put($path, 'file content');

        return TripAttachment::query()->create([
            'trip_id' => $trip->id,
            'user_id' => null,
            'original_name' => 'invoice.pdf',
            'path' => $path,
            'mime_type' => 'application/pdf',
            'size' => 12,
            'disk' => 'local',
            'display_name' => null,
            ...$attributes,
        ]);
    }
}
