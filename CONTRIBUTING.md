# Contributing

Thank you for helping improve this project.

## Before opening an issue or pull request

1. Search existing issues and pull requests.
2. Describe the problem or proposed change clearly.
3. Keep changes focused and preserve existing behavior.
4. Never include credentials, API keys, `.env` files, private user data, or
   uploaded media.

## Development setup

Follow the setup instructions in the [README](./README.md), then run the
relevant checks:

```bash
pnpm check
pnpm types:check
pnpm build
composer lint:check
composer types:check
php artisan test
```

## Pull requests

Pull requests should include:

- A concise summary of the change
- Testing performed
- Screenshots for visible UI changes
- Notes about migrations, environment variables, or breaking changes

Generated Wayfinder files and production build output should not be edited by
hand.
