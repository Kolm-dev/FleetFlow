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
        Schema::table('vehicles', function (Blueprint $table) {
            $table->string('fuel_type')->default('diesel');
            $table->decimal('fuel_consumption', 8, 2)->nullable();
        });


        Schema::table('trips', function (Blueprint $table) {
            $table->integer('distance')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropColumn('fuel_type');
            $table->dropColumn('fuel_consumption');
        });
        Schema::table('trips', function (Blueprint $table) {
            $table->integer('distance')->nullable()->change();
        });
    }
};
