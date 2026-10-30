<?php

declare(strict_types=1);

namespace App\Services\Portfolio;

use RuntimeException;

class PortfolioAssistantException extends RuntimeException
{
    public function __construct(public readonly int $httpStatus, string $message)
    {
        parent::__construct($message);
    }
}
