<?php

declare(strict_types=1);

namespace App\Services\GitHub;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class GitHubRepositoryService
{
    /**
     * @return array<int, array{
     *     id: int,
     *     name: string,
     *     full_name: string,
     *     description: ?string,
     *     html_url: string,
     *     homepage: ?string,
     *     language: ?string,
     *     stargazers_count: int,
     *     topics: array<int, string>,
     *     updated_at: ?string
     * }>
     */
    public function publicRepositoriesForProfile(?string $profileUrl): array
    {
        $username = $this->usernameFromProfileUrl($profileUrl);

        if ($username === null) {
            return [];
        }

        return Cache::remember(
            'github.public-repositories.'.strtolower($username),
            now()->addMinutes(30),
            fn (): array => $this->fetchRepositories($username),
        );
    }

    private function usernameFromProfileUrl(?string $profileUrl): ?string
    {
        if (blank($profileUrl)) {
            return null;
        }

        $host = strtolower((string) parse_url($profileUrl, PHP_URL_HOST));
        $path = trim((string) parse_url($profileUrl, PHP_URL_PATH), '/');
        $segments = explode('/', $path);
        $username = $segments[0];

        if (! in_array($host, ['github.com', 'www.github.com'], true)
            || count($segments) !== 1
            || ! preg_match('/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/', $username)) {
            return null;
        }

        return $username;
    }

    /**
     * @return array<int, array{
     *     id: int,
     *     name: string,
     *     full_name: string,
     *     description: ?string,
     *     html_url: string,
     *     homepage: ?string,
     *     language: ?string,
     *     stargazers_count: int,
     *     topics: array<int, string>,
     *     updated_at: ?string
     * }>
     */
    private function fetchRepositories(string $username): array
    {
        try {
            $request = Http::acceptJson()
                ->withHeaders(['X-GitHub-Api-Version' => '2022-11-28'])
                ->timeout(5);

            $caBundle = config('services.github.ca_bundle');
            if (is_string($caBundle) && $caBundle !== '') {
                $request->withOptions(['verify' => $caBundle]);
            }

            $token = config('services.github.token');
            if (is_string($token) && $token !== '') {
                $request->withToken($token);
            }

            $repositories = [];
            $perPage = 100;

            for ($page = 1; ; $page++) {
                $response = $request->get('https://api.github.com/users/'.rawurlencode($username).'/repos', [
                    'type' => 'owner',
                    'sort' => 'updated',
                    'direction' => 'desc',
                    'per_page' => $perPage,
                    'page' => $page,
                ]);

                $pageRepositories = $response->json();

                if (! $response->successful() || ! is_array($pageRepositories)) {
                    Log::warning('GitHub repository request failed.', [
                        'username' => $username,
                        'page' => $page,
                        'status' => $response->status(),
                    ]);

                    return [];
                }

                $repositories = [...$repositories, ...$pageRepositories];

                if (count($pageRepositories) < $perPage) {
                    break;
                }
            }

            return collect($repositories)
                ->filter(fn (mixed $repository): bool => is_array($repository)
                    && ! ($repository['private'] ?? true)
                    && ! ($repository['fork'] ?? true)
                    && ! ($repository['archived'] ?? true))
                ->map(fn (array $repository): array => [
                    'id' => (int) ($repository['id'] ?? 0),
                    'name' => (string) ($repository['name'] ?? ''),
                    'full_name' => (string) ($repository['full_name'] ?? ''),
                    'description' => is_string($repository['description'] ?? null) ? $repository['description'] : null,
                    'html_url' => (string) ($repository['html_url'] ?? ''),
                    'homepage' => is_string($repository['homepage'] ?? null) && $repository['homepage'] !== '' ? $repository['homepage'] : null,
                    'language' => is_string($repository['language'] ?? null) ? $repository['language'] : null,
                    'stargazers_count' => (int) ($repository['stargazers_count'] ?? 0),
                    'topics' => is_array($repository['topics'] ?? null) ? array_values(array_filter($repository['topics'], 'is_string')) : [],
                    'updated_at' => is_string($repository['updated_at'] ?? null) ? $repository['updated_at'] : null,
                ])
                ->filter(fn (array $repository): bool => $repository['id'] > 0 && $repository['html_url'] !== '')
                ->values()
                ->all();
        } catch (Throwable $exception) {
            Log::warning('GitHub repository request could not be completed.', [
                'username' => $username,
                'exception' => $exception->getMessage(),
            ]);

            return [];
        }
    }
}
