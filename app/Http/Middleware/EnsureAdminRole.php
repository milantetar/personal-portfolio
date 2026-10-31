<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Exceptions\RoleDoesNotExist;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminRole
{
    /**
     * Restrict the dashboard to users with the "admin" role.
     *
     * Access stays closed until an administrator explicitly assigns this
     * role, including during initial setup.
     *
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null) {
            abort(403);
        }

        try {
            if ($user->hasRole('admin')) {
                return $next($request);
            }
        } catch (RoleDoesNotExist) {
            Log::warning('Dashboard access denied because the admin role did not exist.', [
                'user_id' => $user->id,
            ]);
        }

        abort(403, 'You do not have permission to access the dashboard.');
    }
}
