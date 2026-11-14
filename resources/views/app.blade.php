<!DOCTYPE html>
@php
    $portfolioDefaultTheme = $page['props']['branding']['themePreset'] ?? 'dark';
    $portfolioDefaultTheme = in_array($portfolioDefaultTheme, ['light', 'dark', 'instagram', 'discord', 'system'], true)
        ? $portfolioDefaultTheme
        : 'dark';
@endphp
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="{{ $portfolioDefaultTheme === 'light' ? 'light' : 'dark' }}" data-default-theme="{{ $portfolioDefaultTheme }}">
    <head>
        <script>
            (() => {
                const root = document.documentElement;
                let theme = root.dataset.defaultTheme || 'dark';
                try {
                    const stored = localStorage.getItem('portfolio-theme');
                    if (['light', 'dark', 'instagram', 'discord', 'system'].includes(stored)) theme = stored;
                } catch { /* Use the site's default. */ }
                const dark = theme === 'system'
                    ? matchMedia('(prefers-color-scheme: dark)').matches
                    : theme !== 'light';
                root.classList.toggle('dark', dark);
                root.classList.toggle('light', !dark);
                if (theme === 'instagram' || theme === 'discord') root.dataset.theme = theme;
                else root.removeAttribute('data-theme');
            })();
        </script>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="theme-color" content="{{ $portfolioDefaultTheme === 'light' ? '#f8f6f1' : '#151c1a' }}">
        <meta name="robots" content="{{ request()->routeIs('home', 'portfolio.*', 'blog.*') ? 'index,follow' : 'noindex,nofollow' }}">


        @fonts
        @routes
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Milan Tetar | Laravel PHP Backend Developer') }}</title>
            <meta name="description" content="Milan Tetar builds Laravel and PHP backends, REST APIs, and database-driven applications.">
            <link rel="canonical" href="{{ rtrim((string) config('app.url'), '/') . request()->getPathInfo() }}">
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
