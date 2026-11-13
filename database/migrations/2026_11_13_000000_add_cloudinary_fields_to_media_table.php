<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('media', function (Blueprint $table): void {
            $table->string('cloudinary_public_id')->nullable()->after('path');
            $table->string('cloudinary_resource_type')->nullable()->after('cloudinary_public_id');
        });
    }

    public function down(): void
    {
        Schema::table('media', function (Blueprint $table): void {
            $table->dropColumn(['cloudinary_public_id', 'cloudinary_resource_type']);
        });
    }
};
