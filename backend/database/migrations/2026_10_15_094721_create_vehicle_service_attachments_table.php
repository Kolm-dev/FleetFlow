<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vehicle_service_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_service_id')
                ->constrained('vehicle_services')
                ->onDelete('cascade');
            $table->string('path')->unique();
            $table->string('disk')->default('local');
            $table->timestamp('uploaded_at');
            $table->string('original_name');
            $table->string('mime_type');
            $table->unsignedBigInteger('size');
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicle_service_attachments', function (Blueprint $table) {

        });
    }

};
