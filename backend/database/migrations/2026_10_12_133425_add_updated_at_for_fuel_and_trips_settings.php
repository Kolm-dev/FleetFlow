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
        Schema::table('pricing_settings', function (Blueprint $table) {
            $table->timestamp('fuel_pricing_updated_at')->nullable();
            $table->timestamp('trip_pricing_updated_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pricing_settings', function (Blueprint $table) {
            $table->dropColumn('fuel_pricing_updated_at');
            $table->dropColumn('trip_pricing_updated_at');
        });
    }
};
