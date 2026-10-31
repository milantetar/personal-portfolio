import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { type SyntheticEvent, useState } from 'react';

import { Navbar } from '@/components/navbar/navbar';
import { cn } from '@/lib/utils';

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    const submit = (event: SyntheticEvent) => {
        event.preventDefault();
        post('/reset-password', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Choose a new password" />

            <div className="auth-page flex min-h-dvh flex-col bg-background text-foreground">
                <Navbar showNavigationLinks={false} />

                <main className="flex flex-1 items-center justify-center px-4 py-12">
                    <div className="w-full max-w-sm border border-border bg-card p-6 sm:p-8">
                        <p className="eyebrow mb-3">Portfolio / Admin</p>
                        <h1 className="font-display text-3xl font-medium tracking-tight">
                            Choose a new password
                        </h1>
                        <p className="mt-2 mb-7 text-sm leading-6 text-muted-foreground">
                            Set a new password for{' '}
                            <span className="font-medium text-foreground">
                                {email}
                            </span>
                            .
                        </p>

                        <form onSubmit={submit} className="flex flex-col gap-5">
                            <Field
                                label="Email address"
                                htmlFor="email"
                                error={errors.email}
                            >
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(event) =>
                                        setData('email', event.target.value)
                                    }
                                    autoComplete="username"
                                    required
                                    aria-invalid={!!errors.email}
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground transition-shadow outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                />
                            </Field>

                            <Field
                                label="New password"
                                htmlFor="password"
                                error={errors.password}
                            >
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        value={data.password}
                                        onChange={(event) =>
                                            setData(
                                                'password',
                                                event.target.value,
                                            )
                                        }
                                        autoComplete="new-password"
                                        required
                                        aria-invalid={!!errors.password}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 pr-11 text-sm text-foreground transition-shadow outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (visible) => !visible,
                                            )
                                        }
                                        aria-label={
                                            showPassword
                                                ? 'Hide password'
                                                : 'Show password'
                                        }
                                        className="absolute top-1/2 right-3 -translate-y-1/2 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </Field>

                            <Field
                                label="Confirm new password"
                                htmlFor="password_confirmation"
                                error={errors.password_confirmation}
                            >
                                <input
                                    id="password_confirmation"
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password_confirmation}
                                    onChange={(event) =>
                                        setData(
                                            'password_confirmation',
                                            event.target.value,
                                        )
                                    }
                                    autoComplete="new-password"
                                    required
                                    className={inputClassName}
                                />
                            </Field>

                            {errors.token ? (
                                <p
                                    role="alert"
                                    className="text-sm text-destructive"
                                >
                                    {errors.token}
                                </p>
                            ) : null}

                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing && (
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                )}
                                {processing ? 'Saving...' : 'Reset password'}
                            </button>
                        </form>

                        <Link
                            href="/login"
                            className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to sign in
                        </Link>
                    </div>
                </main>
            </div>
        </>
    );
}

const inputClassName = cn(
    'h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none',
    'transition-shadow placeholder:text-muted-foreground',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
);

function Field({
    label,
    htmlFor,
    error,
    children,
}: {
    label: string;
    htmlFor: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label
                htmlFor={htmlFor}
                className="mb-2 block text-sm font-medium text-card-foreground"
            >
                {label}
            </label>
            {children}
            {error ? (
                <p
                    id={`${htmlFor}-error`}
                    role="alert"
                    className="mt-2 text-sm text-destructive"
                >
                    {error}
                </p>
            ) : null}
        </div>
    );
}
