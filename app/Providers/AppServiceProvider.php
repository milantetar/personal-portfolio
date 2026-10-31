<?php

namespace App\Providers;

use App\Auth\EncryptedEmailUserProvider;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Contracts\Hashing\Hasher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        Auth::provider('encrypted-email', static function ($app, array $config): EncryptedEmailUserProvider {
            return new EncryptedEmailUserProvider(
                $app->make(Hasher::class),
                $config['model'],
            );
        });

        RateLimiter::for('login', static function (Request $request): Limit {
            return Limit::perMinute(5)->by(
                Str::lower(trim((string) $request->input('email'))).'|'.$request->ip(),
            );
        });

        RateLimiter::for('portfolio-assistant', static function (Request $request): Limit {
            return Limit::perMinute(max(1, (int) config('services.gemini.per_minute_limit', 10)))
                ->by(hash('sha256', $request->ip() ?? 'unknown'));
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
