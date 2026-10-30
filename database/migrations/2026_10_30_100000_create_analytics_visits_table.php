<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analytics_visits', function (Blueprint $table): void {
            $table->id();
            $table->char('visitor_hash', 64);
            $table->string('path', 512);
            $table->string('referrer_host')->nullable();
            $table->string('device_type', 16);
            $table->timestamp('viewed_at')->index();
            $table->index(['path', 'viewed_at']);
            $table->index(['referrer_host', 'viewed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics_visits');
    }
};
