<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sidebar_items', function (Blueprint $table): void {
            $table->id();
            $table->string('label');
            $table->foreignId('icon_media_id')
                ->nullable()
                ->constrained('media')
                ->nullOnDelete(); // Links JPG/SVG from media library as an icon
            $table->string('url');
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sidebar_items');
    }
};
