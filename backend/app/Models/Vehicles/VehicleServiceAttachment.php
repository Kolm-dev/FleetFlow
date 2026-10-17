<?php
namespace App\Models\Vehicles;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehicleServiceAttachment extends Model
{
    protected $fillable = ["disk", "path", "original_name", "mime_type", "size", "user_id", "uploaded_at"];

    public $timestamps = false;

    protected $casts = [
        "uploaded_at" => "datetime",
    ];

    /**

     * @return BelongsTo<VehicleService, VehicleServiceAttachment>
     */
    public function vehicleService(): BelongsTo
    {
        return $this->belongsTo(VehicleService::class);
    }
}
