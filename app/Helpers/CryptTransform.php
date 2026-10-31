<?php

namespace App\Helpers;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;

final class CryptTransform
{
    /**
     * Encrypt a nullable string using Laravel's authenticated application cipher.
     *
     * Laravel generates and verifies the initialization vector and MAC for every
     * encrypted value. The APP_KEY must remain secret and must not be rotated
     * without configuring APP_PREVIOUS_KEYS for existing encrypted data.
     */
    public static function encrypt(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        return Crypt::encryptString($value);
    }

    /**
     * Decrypt a nullable value created by encrypt().
     *
     * @throws DecryptException When the ciphertext is invalid or has been tampered with.
     */
    public static function decrypt(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        return Crypt::decryptString($value);
    }
}
