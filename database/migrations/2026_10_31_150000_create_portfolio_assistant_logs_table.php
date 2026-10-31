<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('portfolio_assistant_logs', function (Blueprint $table): void {
            $table->id();
            $table->string('session_id')->nullable()->index();
            $table->string('ip_hash', 64)->index();
            $table->text('user_question');
            $table->text('assistant_answer');
            $table->string('status', 32)->default('success')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portfolio_assistant_logs');
    }
};
