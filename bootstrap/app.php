<?php

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Configure middleware here if needed

        $middleware->web([
            HandleInertiaRequests::class
        ]);

    })
    ->withExceptions(function (Exceptions $exceptions) {

        // 1. Validation Exception
        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid request data.',
                    'errors' => $e->errors(),
                ], 422);
            }
        });

        // 2. Authentication Exception
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required. Please provide a valid access token.',
                ], 401);
            }
        });

        // 3. Authorization Exceptions
        $exceptions->render(function (AuthorizationException|AccessDeniedHttpException $e, Request $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to perform this action.',
                ], 403);
            }
        });

        // 4. Model Not Found Exception
        $exceptions->render(function (ModelNotFoundException $e, Request $request) {
            if ($request->expectsJson()) {
                $model = class_basename($e->getModel());

                return response()->json([
                    'success' => false,
                    'message' => "{$model} does not exist.",
                ], 404);
            }
        });

        // 5. Route / Not Found Http Exception
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->expectsJson()) {
                if ($e->getPrevious() instanceof ModelNotFoundException) {
                    /** @var ModelNotFoundException $previous */
                    $previous = $e->getPrevious();
                    $model = class_basename($previous->getModel());

                    return response()->json([
                        'success' => false,
                        'message' => "{$model} does not exist.",
                    ], 404);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Not Found 404',
                ], 404);
            }
        });

        // 6. Method Not Allowed Exception
        $exceptions->render(function (MethodNotAllowedHttpException $e, Request $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'The HTTP method is not allowed for this endpoint.',
                ], 405);
            }
        });

        // 7. General HTTP Exception
        $exceptions->render(function (HttpException $e, Request $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage() ?: 'HTTP error occurred.',
                ], $e->getStatusCode());
            }
        });

        // 8. Catch-all Throwable / Internal Server Error
        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => config('app.debug')
                        ? $e->getMessage()
                        : 'Internal server error. Please try again later.',
                ], 500);
            }
        });

    })->create();