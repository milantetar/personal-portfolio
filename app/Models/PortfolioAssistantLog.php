<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string|null $session_id
 * @property string $ip_hash
 * @property string $user_question
 * @property string $assistant_answer
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'session_id',
    'ip_hash',
    'user_question',
    'assistant_answer',
    'status',
])]
class PortfolioAssistantLog extends Model
{
    /** @use HasFactory<Factory<static>> */
    use HasFactory;
}
