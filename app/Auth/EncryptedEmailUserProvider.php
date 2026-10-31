<?php

declare(strict_types=1);

namespace App\Auth;

use Illuminate\Auth\EloquentUserProvider;
use Illuminate\Contracts\Auth\Authenticatable;

/**
 * Resolves users by their deterministic email_hash instead of the encrypted
 * email column, so authentication and password resets keep working while the
 * email address stays encrypted at rest.
 */
class EncryptedEmailUserProvider extends EloquentUserProvider
{
    /**
     * @param  array<string, mixed>  $credentials
     */
    public function retrieveByCredentials(#[\SensitiveParameter] array $credentials): ?Authenticatable
    {
        if (! isset($credentials['email'])) {
            return parent::retrieveByCredentials($credentials);
        }

        $email = strtolower(trim((string) $credentials['email']));

        $query = $this->newModelQuery()
            ->where('email_hash', hash('sha256', $email));

        foreach ($credentials as $key => $value) {
            if ($key === 'email' || str_contains($key, 'password')) {
                continue;
            }

            $query->where($key, $value);
        }

        $user = $query->first();

        return $user instanceof Authenticatable ? $user : null;
    }
}
