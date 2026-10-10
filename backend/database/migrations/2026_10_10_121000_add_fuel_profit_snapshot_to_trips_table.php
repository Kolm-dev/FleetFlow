<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->decimal('fuel_liters', 10, 3)->nullable();
            $table->string('fuel_type_snapshot')->nullable();
            $table->decimal('fuel_price_per_liter', 8, 2)->nullable();
            $table->decimal('fuel_consumption_snapshot', 8, 2)->nullable();
            $table->decimal('fuel_cost', 10, 2)->nullable();
            $table->decimal('estimated_profit', 10, 2)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->dropColumn([
                'fuel_liters',
                'fuel_type_snapshot',
                'fuel_price_per_liter',
                'fuel_consumption_snapshot',
                'fuel_cost',
                'estimated_profit',
            ]);
        });
    }
};
